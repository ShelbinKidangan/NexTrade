# NexTrade — Phase-Wise Delivery Roadmap

> **Status:** Draft
> **Date:** 2026-04-13
> **Scope:** How NexTrade is built, one shippable slice at a time. AI is deferred to the final phase so non-AI delivery is never blocked by model integration.

This folder breaks the [PRD](../PRD.md) into six sequential phases. Each phase ends in a demoable, production-shaped cut of the product. No phase depends on AI except Phase 6.

## Phases at a glance

| # | Phase | Focus | AI? |
|---|-------|-------|-----|
| 1 | [Foundation & Identity](phase-1-foundation-identity.md) | Auth, tenant model, business profiles, platform-admin login, initial migration, reference data seeding | No |
| 2 | [Catalog & Discovery](phase-2-catalog-discovery.md) | Catalog CRUD, media upload, public business profile, Postgres full-text discovery, saved suppliers | No |
| 3 | [RFQ & Quoting](phase-3-rfq-quoting.md) | RFQ lifecycle, quote submission and comparison, award and deal confirmation, email notifications | No |
| 4 | [Messaging, Compliance & Trust](phase-4-messaging-compliance-trust.md) | SignalR messaging, compliance vault and verification workflow, reviews, trust score, verified badge | No |
| 5 | [Platform Admin Console](phase-5-platform-admin-console.md) | Cross-tenant moderation console, verification queues, reference-data management, platform analytics | No |
| 6 | [AI Layer](phase-6-ai-layer.md) | Profile enrichment, catalog builder, semantic search, matching, RFQ/quote assistants, intelligence | Yes |

## Platform admin, across the phases

Platform admin login, the `PlatformAdmin` role, and the seeded super-admin account are introduced in **Phase 1** so every later phase can wire admin-gated endpoints as it goes. The **full cross-tenant console** (verification queues, moderation, reference-data CRUD, platform KPIs) is consolidated in **Phase 5** to avoid scattering admin UX across every feature phase.

## Document template

Every phase doc follows the same structure so they scan quickly:

1. **Goal** — one-paragraph outcome.
2. **Scope (in / out)** — what ships, what's deferred.
3. **Backend work** — entities touched, new controllers/services, migrations, consumers, files to create or modify.
4. **Frontend work** — pages to build/wire in [ui/src/app/](../../ui/src/app/), components, API client additions.
5. **Data / migrations** — EF migration name, seed data, indexes.
6. **Reused utilities** — existing building blocks to lean on (never rebuild these).
7. **Exit criteria** — concrete, testable checklist.
8. **Verification** — how to run and test the slice end-to-end.
9. **Dependencies on prior phases.**

## Reusable building blocks (don't rebuild)

- [ServiceResult / ServiceResult&lt;T&gt;](../../src/NexTrade.Infrastructure/Services/ServiceResult.cs) — standard response wrapper for every service method.
- [QueryExtensions](../../src/NexTrade.Infrastructure/Services/QueryExtensions.cs): `ToPagedResultAsync`, `CheckDuplicateAsync`, `ResolveRefAsync` — use for paging, uniqueness checks, and Uid→entity resolution.
- [TenantMiddleware](../../src/NexTrade.Api/Middleware/TenantMiddleware.cs) + [TenantContext](../../src/NexTrade.Infrastructure/Data/TenantContext.cs) — never hand-roll tenant filtering; use `.IgnoreQueryFilters()` only for explicit cross-tenant reads.
- [AppDbContext](../../src/NexTrade.Infrastructure/Data/AppDbContext.cs) — global query filters on `TenantEntity` already live here.
- [ui/src/lib/api.ts](../../ui/src/lib/api.ts) — central API client with JWT attach. All new frontend calls go through it.
- MassTransit + RabbitMQ wiring already in [Program.cs](../../src/NexTrade.Api/Program.cs). Add one consumer per feature in [NexTrade.Consumers](../../src/NexTrade.Consumers/); don't add new transports.
