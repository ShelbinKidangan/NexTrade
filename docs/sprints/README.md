# NexTrade — Engineering Sprints

> **Status:** Draft
> **Date:** 2026-04-13
> **Scope:** How NexTrade is **built**, one shippable engineering slice at a time.

## Sprints vs PRD Phases

This folder holds **engineering delivery sprints** — technical slices sized to build and ship in sequence. They are **not** the same as the **product phases** in [the PRD §9](../PRD.md).

- **PRD phases** are strategic, business-facing milestones: `Phase 1 — Identity + Seeding (MVP)`, `Phase 2 — Discovery + Engagement`, `Phase 3 — Intelligence`. They describe *when customers see what*.
- **Sprints** are the engineering delivery units that feed those phases. Each sprint produces a demoable cut of the codebase. Sprints do **not** map 1:1 to PRD phases — a single PRD phase spans several sprints, and AI-powered features from PRD Phase 1 are deferred to the final sprint so non-AI delivery is never blocked by model integration.

Every sprint doc begins with a `Maps to PRD` header that states which PRD phase(s) the sprint contributes to.

## Sprints at a glance

| # | Sprint | Focus | Contributes to PRD phase | AI? |
|---|--------|-------|---|-----|
| 1 | [Foundation & Identity](sprint-1-foundation-identity.md) | Auth, tenant model, business profiles, platform-admin login, initial migration, reference data seeding | PRD Phase 1 (foundation slice) | No |
| 2 | [Catalog & Discovery](sprint-2-catalog-discovery.md) | Catalog CRUD, media upload, public business profile, Postgres full-text discovery, saved suppliers | PRD Phase 1 (catalog, profiles) + PRD Phase 2 (saved suppliers) | No |
| 3 | [RFQ & Quoting](sprint-3-rfq-quoting.md) | RFQ lifecycle, quote submission and comparison, award and deal confirmation, email notifications | PRD Phase 2 | No |
| 4 | [Messaging, Compliance & Trust](sprint-4-messaging-compliance-trust.md) | SignalR messaging, compliance vault and verification, reviews, trust score, verified badge | PRD Phase 1 (compliance vault) + PRD Phase 2 (messaging, reviews, trust) | No |
| 5 | [Platform Admin Console](sprint-5-platform-admin-console.md) | Cross-tenant moderation console, verification queues, reference-data management, platform analytics | Cross-cutting — supports PRD Phases 1–3 | No |
| 6 | [AI Layer](sprint-6-ai-layer.md) | Profile enrichment, catalog builder, semantic search, matching, RFQ/quote assistants, Due Diligence tool, intelligence | PRD Phase 1 (enrichment, Due Diligence) + PRD Phase 2 (smart RFQ/quote AI) + PRD Phase 3 (Intelligence) | Yes |

## Why AI is deferred to Sprint 6

The PRD's Phase 1 mixes non-AI features (auth, profiles, catalog, compliance) with AI-powered features (website enrichment, catalog builder from PDF, semantic search, Due Diligence tool). If we build them together, the whole MVP blocks on model plumbing. Splitting the AI out means Sprints 1–5 ship a fully functional non-AI platform and Sprint 6 layers intelligence on top without touching core flows.

## Platform admin, across the sprints

Platform admin login, the `PlatformAdmin` role, and the seeded super-admin account are introduced in **Sprint 1** so every later sprint can wire admin-gated endpoints as it goes. The **full cross-tenant console** (verification queues, moderation, reference-data CRUD, platform KPIs) is consolidated in **Sprint 5** to avoid scattering admin UX across every feature sprint.

## Document template

Every sprint doc follows the same structure so they scan quickly:

1. **Maps to PRD** — which PRD phase(s) this sprint contributes to.
2. **Goal** — one-paragraph outcome.
3. **Scope (in / out)** — what ships, what's deferred.
4. **Backend work** — entities touched, new controllers/services, migrations, consumers, files to create or modify.
5. **Frontend work** — pages to build/wire in [ui/src/app/](../../ui/src/app/), components, API client additions.
6. **Data / migrations** — EF migration name, seed data, indexes.
7. **Reused utilities** — existing building blocks to lean on (never rebuild these).
8. **Exit criteria** — concrete, testable checklist.
9. **Verification** — how to run and test the slice end-to-end.
10. **Dependencies on prior sprints.**

## Reusable building blocks (don't rebuild)

- [ServiceResult / ServiceResult&lt;T&gt;](../../src/NexTrade.Infrastructure/Services/ServiceResult.cs) — standard response wrapper for every service method.
- [QueryExtensions](../../src/NexTrade.Infrastructure/Services/QueryExtensions.cs): `ToPagedResultAsync`, `CheckDuplicateAsync`, `ResolveRefAsync` — use for paging, uniqueness checks, and Uid→entity resolution.
- [TenantMiddleware](../../src/NexTrade.Api/Middleware/TenantMiddleware.cs) + [TenantContext](../../src/NexTrade.Infrastructure/Data/TenantContext.cs) — never hand-roll tenant filtering; use `.IgnoreQueryFilters()` only for explicit cross-tenant reads.
- [AppDbContext](../../src/NexTrade.Infrastructure/Data/AppDbContext.cs) — global query filters on `TenantEntity` already live here.
- [ui/src/lib/api.ts](../../ui/src/lib/api.ts) — central API client with JWT attach. All new frontend calls go through it.
- MassTransit + RabbitMQ wiring already in [Program.cs](../../src/NexTrade.Api/Program.cs). Add one consumer per feature in [NexTrade.Consumers](../../src/NexTrade.Consumers/); don't add new transports.
