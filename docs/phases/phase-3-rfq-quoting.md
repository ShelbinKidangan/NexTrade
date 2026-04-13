# Phase 3 — RFQ & Quoting

> **Depends on:** [Phase 1](phase-1-foundation-identity.md), [Phase 2](phase-2-catalog-discovery.md).

## Goal

Buyers post public or targeted RFQs. Suppliers submit quotes. Buyers compare quotes side-by-side and award one. Both sides confirm the off-platform deal, which becomes the anchor for trust scoring in [Phase 4](phase-4-messaging-compliance-trust.md). NexTrade's job ends at **Quote Awarded**; execution happens in the buyer's own systems.

## Scope

**In:**

- RFQ lifecycle: `Draft` → `Open` → `Closed` → `Awarded` → `Cancelled`.
- Public vs targeted visibility. Targeted RFQs attach a list of supplier Uids via [RfqTarget](../../src/NexTrade.Core/Entities/RfqTarget.cs).
- [RfqItem](../../src/NexTrade.Core/Entities/RfqItem.cs) line items with JSONB `specifications` payload.
- Quote submission: one quote per (RFQ, supplier). Suppliers can revise while RFQ is `Open`.
- [QuoteItem](../../src/NexTrade.Core/Entities/QuoteItem.cs) line-level pricing, lead time, MOQ, incoterms.
- Side-by-side comparison DTO: quotes grouped by RFQ with normalized totals and per-item breakdown.
- Award flow: buyer picks a quote → RFQ moves to `Awarded`, chosen quote to `Accepted`, all others to `Rejected`.
- Deal confirmation: both parties acknowledge the off-platform deal. Writes an [Order](../../src/NexTrade.Core/Entities/Order.cs) / DealConfirmation record as platform-scope (cross-tenant).
- First real MassTransit consumer in [NexTrade.Consumers](../../src/NexTrade.Consumers/): `RfqNotificationConsumer` — emits email via Mailhog (dev) when:
  - an RFQ is published to targeted suppliers;
  - a quote is submitted against an RFQ;
  - an RFQ is awarded.
- Frontend: [(app)/rfqs](../../ui/src/app/(app)/rfqs/), [(app)/rfqs/[uid]](../../ui/src/app/(app)/rfqs/[uid]/), quote submission modal, comparison grid, award flow, deal-confirmation banner.

**Out:**

- Real-time notifications — [Phase 4](phase-4-messaging-compliance-trust.md) adds SignalR.
- Review posting — gated on confirmed deal, implemented in [Phase 4](phase-4-messaging-compliance-trust.md).
- AI RFQ drafting, AI quote summary, auto-responder — [Phase 6](phase-6-ai-layer.md).
- Order execution, invoicing, payment — out of product scope entirely.

## Backend work

**Controllers / services:**

- `RfqController` / `RfqService`:
  - `POST /rfqs` (Draft), `PATCH /rfqs/{uid}` (while Draft), `POST /rfqs/{uid}/publish`, `POST /rfqs/{uid}/close`, `POST /rfqs/{uid}/cancel`.
  - `GET /rfqs/mine` (tenant scope), `GET /rfqs/public` (platform scope, `.IgnoreQueryFilters()`), `GET /rfqs/targeted` (RFQs where current tenant is a target).
  - `GET /rfqs/{uid}` — buyer sees all quotes; suppliers see only their own.
- `QuoteController` / `QuoteService`:
  - `POST /rfqs/{rfqUid}/quotes`, `PATCH /quotes/{uid}`, `POST /quotes/{uid}/submit`, `POST /quotes/{uid}/withdraw`.
  - `GET /rfqs/{rfqUid}/quotes/comparison` — buyer-only side-by-side DTO.
  - `POST /rfqs/{rfqUid}/award` with `quoteUid` in body → status transitions across RFQ and all quotes atomically.
- `DealsController` / `DealsService`:
  - `POST /deals/{orderUid}/confirm` — each party confirms once; when both confirmed, `Order.ConfirmedAt` is set.
  - `GET /deals/pending` — deals awaiting current tenant's confirmation.

**Messaging:**

- `RfqPublishedEvent`, `QuoteSubmittedEvent`, `RfqAwardedEvent` — MassTransit contracts in [NexTrade.Shared](../../src/NexTrade.Shared/).
- `RfqNotificationConsumer` in [NexTrade.Consumers](../../src/NexTrade.Consumers/) handles all three and sends via `SmtpEmailSender` (new, Mailhog config in `appsettings.Development.json`).

**Files to create:**

- `src/NexTrade.Api/Controllers/RfqController.cs`
- `src/NexTrade.Api/Controllers/QuoteController.cs`
- `src/NexTrade.Api/Controllers/DealsController.cs`
- `src/NexTrade.Infrastructure/Services/RfqService.cs`
- `src/NexTrade.Infrastructure/Services/QuoteService.cs`
- `src/NexTrade.Infrastructure/Services/DealsService.cs`
- `src/NexTrade.Infrastructure/Services/SmtpEmailSender.cs`
- `src/NexTrade.Consumers/RfqNotificationConsumer.cs`
- `src/NexTrade.Shared/Contracts/Rfq/*.cs`

## Frontend work

- [ui/src/app/(app)/rfqs/page.tsx](../../ui/src/app/(app)/rfqs/) — tabs: My RFQs (as buyer) / Invitations (as supplier) / Public feed.
- `ui/src/app/(app)/rfqs/new/page.tsx` — multi-step create: basics → line items → targeted suppliers picker → review.
- [ui/src/app/(app)/rfqs/[uid]/page.tsx](../../ui/src/app/(app)/rfqs/[uid]/) — header with status, line items, quote list (buyer) or quote composer (supplier).
- `ui/src/app/(app)/rfqs/[uid]/compare/page.tsx` — side-by-side comparison grid with award button.
- Deal-confirmation banner component rendered on dashboard + RFQ detail when action is pending.
- API client module: `rfqs`, `quotes`, `deals`.

## Data / migrations

- Migration name: `RfqEngine`.
- Add indexes: `(rfq_id, supplier_business_id)` unique on quotes; `(rfq_id, line_no)` on rfq_items; `(buyer_business_id, status)` and `(seller_business_id, status)` on orders.
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
- [ ] Buyer awards one quote; losing quote auto-transitions to `Rejected`, RFQ to `Awarded`.
- [ ] Deal-confirmation banner appears for both buyer and winning supplier.
- [ ] Both confirm; `Order.ConfirmedAt` is set; banner clears.
- [ ] Supplier cannot see other suppliers' quotes on the same RFQ.
- [ ] Public RFQ feed lists only `Open` + `Public`-visibility RFQs across all tenants.

## Verification

```bash
docker compose -f infra/docker/docker-compose.full.yml up -d   # Mailhog + Azurite + infra
cd src/NexTrade.AppHost && dotnet run
cd ui && npm run dev
```

Walk the flow end-to-end across three browser profiles (buyer + two suppliers). Check Mailhog at http://localhost:8025 after each step.

## Dependencies

- [Phase 1](phase-1-foundation-identity.md): auth, tenant context, migration baseline, reference data (currencies).
- [Phase 2](phase-2-catalog-discovery.md): supplier discovery is how buyers find the suppliers they target here; catalog items can be linked from RFQ line items as "looking for something like this."
