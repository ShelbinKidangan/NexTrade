# Sprint 4 — Messaging, Compliance & Trust

> **Maps to PRD:** Split across two PRD phases. The compliance vault + basic admin verification workflow belong to [PRD Phase 1 — Identity + Seeding](../PRD.md); messaging, reviews, trust score, and verified badge belong to [PRD Phase 2 — Discovery + Engagement](../PRD.md). Packaged together here because trust score depends on both compliance state and review data, and reviews depend on messaging-adjacent deal confirmation — splitting them would create churn.
>
> **Depends on:** [Sprint 1](sprint-1-foundation-identity.md), [Sprint 2](sprint-2-catalog-discovery.md), [Sprint 3](sprint-3-rfq-quoting.md).

## Goal

Buyers and suppliers chat in real time, upload compliance documents for verification, leave reviews after a confirmed deal, and earn a composite trust score. The verified badge becomes real (not a placeholder), and compliance expiry is surfaced automatically.

## Scope

**In:**

- Threaded conversations: `General`, `Rfq` contexts (no `Order` — PRD has no orders). One conversation per (participant set, context, context-ref) enforced via [Conversation.ConversationKey](../../src/NexTrade.Core/Entities/Conversation.cs).
- Messages with read receipts and attachments. Soft-delete via `DeletedAt`.
- Real-time delivery via SignalR `ChatHub` at `/hubs/chat`. Backplane is Valkey (already wired in [Program.cs](../../src/NexTrade.Api/Program.cs)). Browser clients authenticate via the `access_token` query string per [CLAUDE.md](../../CLAUDE.md).
- Compliance vault: upload, list, replace, delete. Statuses `Pending` → `Verified` / `Rejected` → `Expired`. Rejected docs carry a reason. Expiry date captured per doc.
- Minimal admin-verification endpoints (the full console queue is in [Sprint 5](sprint-5-platform-admin-console.md)). Admins can approve/reject individual docs here; the queue UI lands in Sprint 5.
- Reviews: 1–5 stars across Quality, Communication, Delivery, Value. Gated on a confirmed [DealConfirmation](../../src/NexTrade.Core/Entities/DealConfirmation.cs) between the reviewer and the reviewee. One review per deal per direction.
- Trust score computation: scheduled consumer runs nightly, writes `Business.TrustScore` from a weighted blend of review average, compliance verified ratio, RFQ response rate, and activity recency.
- Verified badge flag on [Business](../../src/NexTrade.Core/Entities/Business.cs), derived from "has at least one Verified compliance doc of a required type" + "Business has been admin-approved."
- `ComplianceExpiryConsumer` — scheduled check: 30/7/1 days before expiry → email, on expiry → status change + email.
- Frontend: messages inbox + thread view, compliance vault page, review modal on deal-confirmation screen, trust-score pill on public profile.

**Out:**

- WhatsApp integration (in the PRD but deferred).
- AI review summarization, AI message drafts — [Sprint 6](sprint-6-ai-layer.md).
- Full admin verification queue UI — [Sprint 5](sprint-5-platform-admin-console.md).

## Backend work

**Controllers / services:**

- `ConversationsController` / `ConversationService`:
  - `GET /conversations` — paged list, context filter.
  - `GET /conversations/{uid}/messages` — paged, reverse chronological.
  - `POST /conversations/{uid}/messages` — send.
  - `POST /conversations/{uid}/read` — mark as read up to messageId.
  - `POST /conversations/find-or-create` — body `{ counterpartyBusinessUid, context, contextRefUid }`. Builds the deterministic `ConversationKey` (sorted participant uids + context) for uniqueness.
- `ChatHub` in `src/NexTrade.Api/Hubs/ChatHub.cs`:
  - Groups per conversation Uid. Server broadcasts on send, read-receipt, typing.
  - JWT auth via query string (see [Program.cs](../../src/NexTrade.Api/Program.cs)).
- `ComplianceController` / `ComplianceService`:
  - `POST /compliance/documents` — upload to Blob, create row with `Pending` status.
  - `GET /compliance/documents` — tenant-scope.
  - `DELETE /compliance/documents/{uid}`.
  - `POST /compliance/documents/{uid}/verify` — platform-admin only, sets `Verified`.
  - `POST /compliance/documents/{uid}/reject` — platform-admin only, sets `Rejected` with reason.
- `ReviewsController` / `ReviewsService`:
  - `POST /reviews` — requires a confirmed [DealConfirmation](../../src/NexTrade.Core/Entities/DealConfirmation.cs) between reviewer and reviewee.
  - `GET /businesses/{uid}/reviews` — paged, public (`.IgnoreQueryFilters()`).
- `TrustScoreService` — pure function over review aggregate + compliance state + RFQ stats + last-activity timestamp. Scheduled consumer wraps it.

**Consumers (in [NexTrade.Consumers](../../src/NexTrade.Consumers/)):**

- `TrustScoreRecomputeConsumer` — runs nightly via a cron message or Quartz/MassTransit scheduler. Recomputes all active businesses.
- `ComplianceExpiryConsumer` — runs daily. Finds docs with `expires_at` within alert windows, publishes `ComplianceExpiryEvent`, handled by the existing email sender from [Sprint 3](sprint-3-rfq-quoting.md).

**Files to create:**

- `src/NexTrade.Api/Controllers/ConversationsController.cs`
- `src/NexTrade.Api/Controllers/ComplianceController.cs`
- `src/NexTrade.Api/Controllers/ReviewsController.cs`
- `src/NexTrade.Api/Hubs/ChatHub.cs`
- `src/NexTrade.Infrastructure/Services/ConversationService.cs`
- `src/NexTrade.Infrastructure/Services/ComplianceService.cs`
- `src/NexTrade.Infrastructure/Services/ReviewsService.cs`
- `src/NexTrade.Infrastructure/Services/TrustScoreService.cs`
- `src/NexTrade.Consumers/TrustScoreRecomputeConsumer.cs`
- `src/NexTrade.Consumers/ComplianceExpiryConsumer.cs`

## Frontend work

- [ui/src/app/(app)/messages/page.tsx](../../ui/src/app/(app)/messages/) — inbox pane + thread pane. Real-time updates via SignalR client (`@microsoft/signalr`).
- `ui/src/app/(app)/messages/[uid]/page.tsx` — thread detail (or a pane inside messages/page).
- "Message supplier" button on [(public)/business/[uid]](../../ui/src/app/(public)/business/[uid]/) — calls `find-or-create` then navigates to thread.
- [ui/src/app/(app)/compliance/page.tsx](../../ui/src/app/(app)/compliance/) — vault list, upload, status badges, expiry countdown.
- Review modal component invoked from the deal-confirmation banner introduced in [Sprint 3](sprint-3-rfq-quoting.md).
- Trust-score pill component used on public profile cards and discovery results.
- SignalR connection helper in `ui/src/lib/signalr.ts` — reconnect, token refresh.

## Data / migrations

- Migration name: `MessagingComplianceTrust`.
- New indexes: `(tenant_id, created_at)` on messages, `(business_id, status, expires_at)` on compliance_documents, `(reviewed_business_uid, created_at)` on reviews (unique `(reviewer_business_uid, deal_confirmation_id)` already in [Sprint 1](sprint-1-foundation-identity.md) schema).
- `TrustScore` already lives on [Business](../../src/NexTrade.Core/Entities/Business.cs) from Sprint 1; this migration is just indexes and triggers.

## Reused utilities

- [ServiceResult](../../src/NexTrade.Infrastructure/Services/ServiceResult.cs).
- [QueryExtensions.ToPagedResultAsync](../../src/NexTrade.Infrastructure/Services/QueryExtensions.cs) — conversations, messages, reviews, compliance docs.
- Blob upload path from `CatalogMediaService` in [Sprint 2](sprint-2-catalog-discovery.md) — extract a shared `IBlobStorage` interface during this sprint if not yet done.
- SMTP sender from [Sprint 3](sprint-3-rfq-quoting.md) — reused by expiry consumer.
- MassTransit scheduler and bus registration already in [Program.cs](../../src/NexTrade.Api/Program.cs).

## Exit criteria

- [ ] Two tenants chat in real time: messages appear without refresh; read receipts update live.
- [ ] Supplier uploads a compliance certificate; doc lands in Blob, row is `Pending`.
- [ ] Platform admin calls `POST /compliance/documents/{uid}/verify`; supplier's public profile now shows Verified badge.
- [ ] Supplier sets an expiry 5 days out; `ComplianceExpiryConsumer` emits an alert email.
- [ ] Buyer cannot post a review without a confirmed deal; with one, review posts and updates trust score after the nightly job (or manual recompute endpoint for tests).
- [ ] Trust score is visible on public business profile.
- [ ] Tenant user calling the admin verify endpoint receives 403.

## Verification

```bash
docker compose -f infra/docker/docker-compose.full.yml up -d
cd src/NexTrade.AppHost && dotnet run
cd ui && npm run dev
```

Run three browser profiles (buyer, supplier, admin). Exercise: message thread across tabs; upload cert; admin verifies; supplier uploads an already-expiring cert → Mailhog shows alert; complete a Sprint 3 deal → post review → confirm trust-score change.

## Dependencies

- Deal confirmation from [Sprint 3](sprint-3-rfq-quoting.md) (reviews gate on it).
- Catalog media / Blob plumbing from [Sprint 2](sprint-2-catalog-discovery.md) (compliance uploads reuse it).
- Platform-admin policy + seeded admin from [Sprint 1](sprint-1-foundation-identity.md).
