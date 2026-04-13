# Sprint 3 — RFQ & Quoting

> **Maps to PRD:** [Phase 2 — Discovery + Engagement](../PRD.md). This sprint covers the non-AI RFQ + quoting + deal-confirmation core. AI RFQ drafting, AI quote summary, and the auto-responder are all also PRD Phase 2 features but land in [Sprint 6](sprint-6-ai-layer.md).
>
> **Depends on:** [Sprint 1](sprint-1-foundation-identity.md), [Sprint 2](sprint-2-catalog-discovery.md).

## Goal

Buyers post public or targeted RFQs. Suppliers submit quotes. Buyers compare quotes side-by-side and award one. Both sides confirm the off-platform deal, which becomes the anchor for trust scoring in [Sprint 4](sprint-4-messaging-compliance-trust.md). NexTrade's job ends at **Quote Awarded**; execution happens in the buyer's own systems.

## Scope

**In:**

- RFQ lifecycle: `Draft` → `Open` → `Closed` → `Awarded` → `Cancelled`.
- Public vs targeted visibility. Targeted RFQs attach a list of supplier Uids via [RfqTarget](../../src/NexTrade.Core/Entities/Rfq.cs).
- [RfqItem](../../src/NexTrade.Core/Entities/Rfq.cs) line items with JSONB `specifications` payload. Attachments (JSONB list of blob URLs) on [Rfq](../../src/NexTrade.Core/Entities/Rfq.cs).
- Quote submission: one quote per (RFQ, supplier). Suppliers can revise while RFQ is `Open`. Attachments on [Quote](../../src/NexTrade.Core/Entities/Quote.cs).
- [QuoteItem](../../src/NexTrade.Core/Entities/Quote.cs) line-level pricing, lead time, MOQ, incoterms.
- Side-by-side comparison DTO: quotes grouped by RFQ with normalized totals and per-item breakdown.
- Award flow: buyer picks a quote → RFQ moves to `Awarded`, chosen quote to `Accepted`, all others to `Rejected`.
- Deal confirmation: both parties acknowledge the off-platform deal. Writes a [DealConfirmation](../../src/NexTrade.Core/Entities/DealConfirmation.cs) record as platform-scope (cross-tenant). Confirmation can optionally reference an `RfqId` + `QuoteId`, or stand alone when a deal originates off-platform.
- First real MassTransit consumer in [NexTrade.Consumers](../../src/NexTrade.Consumers/): `RfqNotificationConsumer` — emits email via Mailhog (dev) when:
  - an RFQ is published to targeted suppliers;
  - a quote is submitted against an RFQ;
  - an RFQ is awarded.
- Frontend: [(app)/rfqs](../../ui/src/app/(app)/rfqs/), [(app)/rfqs/[uid]](../../ui/src/app/(app)/rfqs/[uid]/), quote submission modal, comparison grid, award flow, deal-confirmation banner.

**Out:**

- Real-time notifications — [Sprint 4](sprint-4-messaging-compliance-trust.md) adds SignalR.
- Review posting — gated on confirmed deal, implemented in [Sprint 4](sprint-4-messaging-compliance-trust.md).
- AI RFQ drafting, AI quote summary, auto-responder — [Sprint 6](sprint-6-ai-layer.md).
- Order execution, invoicing, payment — **out of product scope entirely** (PRD terminal state is "Quote Awarded").

## Backend work

**Controllers / services:**

- `RfqController` / `RfqService`:
  - `POST /rfqs` (Draft), `PATCH /rfqs/{uid}` (while Draft), `POST /rfqs/{uid}/publish`, `POST /rfqs/{uid}/close`, `POST /rfqs/{uid}/cancel`.
  - `GET /rfqs/mine` (tenant scope), `GET /rfqs/public` (platform scope, `.IgnoreQueryFilters()`), `GET /rfqs/targeted` (RFQs where current tenant is a target).
  - `GET /rfqs/{uid}` — buyer sees all quotes; suppliers see only their own.
- `QuoteController` / `QuoteService`:
  - `POST /rfqs/{rfqUid}/quotes`, `PATCH /quotes/{uid}`, `POST /quotes/{uid}/submit`, `POST /quotes/{uid}/withdraw`.
  - `GET /rfqs/{rfqUid}/quotes/comparison` — buyer-only side-by-side DTO.
  - `POST /rfqs/{rfqUid}/award` with `quoteUid` in body → status transitions across RFQ and all quotes atomically, creates a `DealConfirmation` row in one transaction.
- `DealConfirmationsController` / `DealConfirmationsService`:
  - `POST /deal-confirmations/{uid}/confirm` — each party confirms once; when both `BuyerConfirmed` and `SupplierConfirmed` flip true, `ConfirmedAt` is stamped.
  - `GET /deal-confirmations/pending` — confirmations awaiting current tenant's acknowledgment.
  - `POST /deal-confirmations` — create a standalone confirmation for a deal that happened off-platform (no RFQ/Quote linkage).

**Messaging:**

- `RfqPublishedEvent`, `QuoteSubmittedEvent`, `RfqAwardedEvent` — MassTransit contracts in [NexTrade.Shared](../../src/NexTrade.Shared/).
- `RfqNotificationConsumer` in [NexTrade.Consumers](../../src/NexTrade.Consumers/) handles all three and sends via `SmtpEmailSender` (new, Mailhog config in `appsettings.Development.json`).

**Files to create:**

- `src/NexTrade.Api/Controllers/RfqController.cs`
- `src/NexTrade.Api/Controllers/QuoteController.cs`
- `src/NexTrade.Api/Controllers/DealConfirmationsController.cs`
- `src/NexTrade.Infrastructure/Services/RfqService.cs`
- `src/NexTrade.Infrastructure/Services/QuoteService.cs`
- `src/NexTrade.Infrastructure/Services/DealConfirmationsService.cs`
- `src/NexTrade.Infrastructure/Services/SmtpEmailSender.cs`
- `src/NexTrade.Consumers/RfqNotificationConsumer.cs`
- `src/NexTrade.Shared/Contracts/Rfq/*.cs`

## Frontend work

- [ui/src/app/(app)/rfqs/page.tsx](../../ui/src/app/(app)/rfqs/) — tabs: My RFQs (as buyer) / Invitations (as supplier) / Public feed.
- `ui/src/app/(app)/rfqs/new/page.tsx` — multi-step create: basics → line items → targeted suppliers picker → review.
- [ui/src/app/(app)/rfqs/[uid]/page.tsx](../../ui/src/app/(app)/rfqs/[uid]/) — header with status, line items, quote list (buyer) or quote composer (supplier).
- `ui/src/app/(app)/rfqs/[uid]/compare/page.tsx` — side-by-side comparison grid with award button.
- Deal-confirmation banner component rendered on dashboard + RFQ detail when action is pending.
- API client module: `rfqs`, `quotes`, `dealConfirmations`.

## Data / migrations

- Migration name: `RfqEngine`.
- Index additions: `(tenant_id, status)` on `rfqs`, `(rfq_id, tenant_id)` unique on `quotes` (already present from Sprint 1 — confirm), `(buyer_business_uid, supplier_business_uid, rfq_id, quote_id)` on `deal_confirmations`.
- Check constraint on quote status transitions.

## Reused utilities

- [ServiceResult](../../src/NexTrade.Infrastructure/Services/ServiceResult.cs) — every service method.
- [QueryExtensions.ToPagedResultAsync](../../src/NexTrade.Infrastructure/Services/QueryExtensions.cs) — RFQ and quote lists.
- [QueryExtensions.ResolveRefAsync](../../src/NexTrade.Infrastructure/Services/QueryExtensions.cs) — resolve supplier Uids on targeted RFQs, resolve currency Uid on quote.
- `.IgnoreQueryFilters()` — public RFQ feed and cross-tenant quote visibility on the buyer's comparison endpoint.
- MassTransit wiring in [Program.cs](../../src/NexTrade.Api/Program.cs) — add consumer class, do not reconfigure the bus.

## Exit criteria

- [ ] Buyer creates a targeted RFQ to 3 suppliers, publishes it.
- [ ] 3 emails arrive at Mailhog, one per targeted supplier.
- [ ] 2 suppliers submit quotes; buyer receives 2 notification emails.
- [ ] Buyer opens comparison view, sees both quotes side-by-side with normalized totals.
- [ ] Buyer awards one quote; losing quote auto-transitions to `Rejected`, RFQ to `Awarded`, a `DealConfirmation` is created.
- [ ] Deal-confirmation banner appears for both buyer and winning supplier.
- [ ] Both confirm; `DealConfirmation.ConfirmedAt` is stamped; banner clears.
- [ ] Supplier cannot see other suppliers' quotes on the same RFQ.
- [ ] Public RFQ feed lists only `Open` + `Public`-visibility RFQs across all tenants.
- [ ] Off-platform deal: a tenant can create a `DealConfirmation` without `RfqId`/`QuoteId`, both parties confirm, and a `Review` can later be anchored to it in Sprint 4.

## Verification

```bash
docker compose -f infra/docker/docker-compose.full.yml up -d   # Mailhog + Azurite + infra
cd src/NexTrade.AppHost && dotnet run
cd ui && npm run dev
```

Walk the flow end-to-end across three browser profiles (buyer + two suppliers). Check Mailhog at http://localhost:8025 after each step.

## Dependencies

- [Sprint 1](sprint-1-foundation-identity.md): auth, tenant context, migration baseline, reference data (currencies).
- [Sprint 2](sprint-2-catalog-discovery.md): supplier discovery is how buyers find the suppliers they target here; catalog items can be linked from RFQ line items as "looking for something like this."
