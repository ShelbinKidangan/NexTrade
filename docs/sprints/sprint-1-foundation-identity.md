# Sprint 1 — Foundation & Identity

> **Maps to PRD:** [Phase 1 — Identity + Seeding (MVP)](../PRD.md) — foundation slice only. This sprint lays the auth, tenancy, and reference-data substrate the rest of PRD Phase 1 builds on. Catalog and public profiles land in [Sprint 2](sprint-2-catalog-discovery.md), compliance vault in [Sprint 4](sprint-4-messaging-compliance-trust.md), and the AI-powered seeding features (S2P enrichment, Due Diligence tool, catalog builder) in [Sprint 6](sprint-6-ai-layer.md).
>
> **Prerequisite sprint for everything else.** No forward dependencies.

## Goal

A new business can self-register, log in, and edit its profile. A seeded platform-admin account can log in to a minimal admin shell. The database schema exists as a single initial migration, and reference data (industries, countries, currencies) is seeded on first run. Tenant isolation is wired end-to-end via JWT claims and EF global query filters.

## Scope

**In:**

- Initial EF migration covering every [NexTrade.Core](../../src/NexTrade.Core/) entity — even ones implemented in later phases — so schema churn is minimized.
- Self-signup and login via [AuthController](../../src/NexTrade.Api/Controllers/AuthController.cs) / [AuthService](../../src/NexTrade.Infrastructure/Services/AuthService.cs). Harden password policy, email uniqueness, lockout.
- JWT carries `NameIdentifier`, `tenant_id`, and a new `platform_admin` claim.
- Platform-admin identity: `IsPlatformAdmin` on [User](../../src/NexTrade.Core/Entities/User.cs), seeded super-admin on first run, `POST /auth/admin-login` endpoint, `[Authorize(Policy="PlatformAdmin")]` policy.
- Tenant role seeding (`Admin`, `CatalogManager`, `Sales`, `Procurement`, `Member`) for every new tenant.
- Business profile read/edit (extend [BusinessService](../../src/NexTrade.Infrastructure/Services/BusinessService.cs)).
- Reference-data seeding for [Industry](../../src/NexTrade.Core/Entities/Industry.cs), [Country](../../src/NexTrade.Core/Entities/Country.cs), [Currency](../../src/NexTrade.Core/Entities/Currency.cs) (ISO lists).
- Frontend: wire [(auth)/login](../../ui/src/app/(auth)/login/), [(auth)/register](../../ui/src/app/(auth)/register/), and [(app)/profile](../../ui/src/app/(app)/profile/) to the API; JWT stored via [ui/src/lib/api.ts](../../ui/src/lib/api.ts).
- Frontend: `/admin/login` page + empty `(admin)/` layout shell (dashboard is a placeholder panel).

**Out:**

- Catalog, discovery, RFQ, messaging, compliance.
- Admin console functionality beyond the login + shell (full console is [Sprint 5](sprint-5-platform-admin-console.md)).
- Any AI behaviour ([Sprint 6](sprint-6-ai-layer.md)).

## Backend work

**Migration:**

```bash
dotnet ef migrations add InitialSchema -p src/NexTrade.Infrastructure -s src/NexTrade.Api
```

The migration must include: Identity tables, all domain tables for Core entities, `tsvector` columns + GIN indexes on searchable fields (populated in [Sprint 2](sprint-2-catalog-discovery.md) — columns exist now to avoid re-migration), pgvector extension enabled, and the `embedding vector(1536)` column on `catalog_items` and `business_profiles` (populated in [Sprint 6](sprint-6-ai-layer.md)).

**Identity:**

- Add `IsPlatformAdmin` flag to [User](../../src/NexTrade.Core/Entities/User.cs).
- Update token generation in [AuthService](../../src/NexTrade.Infrastructure/Services/AuthService.cs) to emit `platform_admin=true` when flag is set. Platform admins still get a synthetic `tenant_id` claim (zero GUID) so middleware doesn't choke.
- In [Program.cs](../../src/NexTrade.Api/Program.cs), register policy `PlatformAdmin` that requires the `platform_admin` claim.
- [TenantMiddleware](../../src/NexTrade.Api/Middleware/TenantMiddleware.cs) must bypass tenant binding when the caller is a platform admin; platform-admin requests do not set `TenantContext.TenantId`, forcing admin endpoints to use `.IgnoreQueryFilters()` explicitly.
- Add `POST /auth/admin-login` on [AuthController](../../src/NexTrade.Api/Controllers/AuthController.cs). Same flow as login but rejects non-admins.

**Seeding:**

- New `DbInitializer` service invoked from [Program.cs](../../src/NexTrade.Api/Program.cs) on startup. Idempotent: reference data upsert, tenant-role template seed, platform-admin seed from env vars `ADMIN_EMAIL` / `ADMIN_PASSWORD` on first run only.

**Files to create or modify:**

- Modify [src/NexTrade.Infrastructure/Services/AuthService.cs](../../src/NexTrade.Infrastructure/Services/AuthService.cs) — policy enforcement, admin login, stronger password validation, default role assignment.
- Modify [src/NexTrade.Api/Controllers/AuthController.cs](../../src/NexTrade.Api/Controllers/AuthController.cs) — add `AdminLogin`.
- Modify [src/NexTrade.Api/Middleware/TenantMiddleware.cs](../../src/NexTrade.Api/Middleware/TenantMiddleware.cs) — platform-admin bypass.
- Create `src/NexTrade.Infrastructure/Data/DbInitializer.cs`.
- Create `src/NexTrade.Infrastructure/Migrations/*_InitialSchema.*`.

## Frontend work

- [ui/src/app/(auth)/login/page.tsx](../../ui/src/app/(auth)/login/) — form, error states, JWT persistence, redirect to `(app)/dashboard`.
- [ui/src/app/(auth)/register/page.tsx](../../ui/src/app/(auth)/register/) — business + first-user registration form.
- [ui/src/app/(app)/profile/page.tsx](../../ui/src/app/(app)/profile/) — GET/PATCH business profile.
- Create `ui/src/app/(admin)/layout.tsx` — admin shell (sidebar, header, logout).
- Create `ui/src/app/(admin)/login/page.tsx` — separate from tenant login, posts to `/auth/admin-login`.
- Create `ui/src/app/(admin)/dashboard/page.tsx` — placeholder panel ("Admin console — see [Sprint 5](sprint-5-platform-admin-console.md)").
- Extend [ui/src/lib/api.ts](../../ui/src/lib/api.ts) — JWT storage, 401 handling, admin token separation.

## Data / migrations

- Migration name: `InitialSchema`.
- Seed data: ISO 3166 countries, ISO 4217 currencies, Level-1 industries (NAICS or UNSPSC top-level), default tenant-role template.
- Indexes: unique on `users.email`, `businesses.slug`, `businesses.uid`; GIN placeholders on `catalog_items.search_vector` and `businesses.search_vector` (used in [Sprint 2](sprint-2-catalog-discovery.md)).

## Reused utilities

- [ServiceResult](../../src/NexTrade.Infrastructure/Services/ServiceResult.cs) — all AuthService / BusinessService returns.
- [QueryExtensions.CheckDuplicateAsync](../../src/NexTrade.Infrastructure/Services/QueryExtensions.cs) — email and slug uniqueness.
- ASP.NET Core Identity password hasher, lockout, and role store (do not roll your own).

## Exit criteria

- [ ] `dotnet ef database update` applies cleanly against a fresh Postgres (test via `docker compose -f infra/docker/docker-compose.test.yml up`).
- [ ] `POST /auth/register` → `POST /auth/login` → `GET /businesses/me` → `PATCH /businesses/me` works via curl or Scalar.
- [ ] Seeded admin logs in at `POST /auth/admin-login`; returns a token with `platform_admin=true`.
- [ ] Admin token on a tenant-scoped endpoint returns 403 (no tenant context).
- [ ] Tenant token on `/admin/*` endpoints (added in [Sprint 5](sprint-5-platform-admin-console.md)) returns 403.
- [ ] `GET /reference/industries`, `/reference/countries`, `/reference/currencies` return seeded data.
- [ ] Frontend: register → land on dashboard; edit profile; reload page keeps session; log out clears token.
- [ ] Frontend: `/admin/login` lets the seeded admin into the `(admin)/` shell.

## Verification

```bash
cd src/NexTrade.AppHost
dotnet run                                       # brings up Postgres / RabbitMQ / Valkey
dotnet ef database update -p ../NexTrade.Infrastructure -s ../NexTrade.Api
```

Then exercise the curl flow above, followed by the UI walkthroughs. Confirm `git log` shows the new `InitialSchema` migration file.

## Dependencies

None. This phase is the base of the pyramid.
