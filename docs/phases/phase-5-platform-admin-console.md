# Phase 5 — Platform Admin Console

> **Depends on:** [Phase 1](phase-1-foundation-identity.md) through [Phase 4](phase-4-messaging-compliance-trust.md).

## Goal

Platform admins get a full cross-tenant operations console. They can verify businesses, review compliance documents in a queue, moderate content, manage reference-data taxonomies, manage users across tenants, and see platform-wide KPIs. Every admin write is captured in an audit log.

This phase **consolidates** admin functionality that was deliberately left minimal in earlier phases (for example, the single-record compliance verify endpoint from [Phase 4](phase-4-messaging-compliance-trust.md) is now fronted by a real queue UI with bulk actions).

## Scope

**In:**

- Admin business management: cross-tenant list, search, filter by status, verify / suspend / unsuspend / soft-delete, view per-business audit log.
- Admin verification queue for compliance documents: filter by type, age, country, tenant; approve / reject with reason; bulk approve.
- Reference-data management: [Industry](../../src/NexTrade.Core/Entities/Industry.cs) tree, [Country](../../src/NexTrade.Core/Entities/Country.cs), [Currency](../../src/NexTrade.Core/Entities/Currency.cs), [CatalogCategory](../../src/NexTrade.Core/Entities/CatalogCategory.cs) tree — CRUD + reorder.
- Admin user management: cross-tenant user lookup by email, lockout clear, password reset, promote/demote platform admin, impersonation is **out** for this phase.
- Content moderation: hide / flag / delete catalog items, RFQs, reviews. Soft-delete only; hard-delete requires two-admin approval (defer hard-delete to backlog).
- Platform metrics dashboard: registered businesses (total + 30d delta), published catalog items, open RFQs, average quote response time, MAU, trust-score distribution, verified-badge rate.
- Audit log: every admin write goes through a middleware that records `(admin_user_id, action, target_entity, target_uid, payload_json, timestamp)`.
- Frontend: full `(admin)/` route tree replacing the placeholder shell from [Phase 1](phase-1-foundation-identity.md).

**Out:**

- AI-driven anomaly detection, auto-moderation, auto-enrichment audits — [Phase 6](phase-6-ai-layer.md).
- Billing, plan management, rate-limit controls — backlog, not in the roadmap.
- Admin impersonation / "log in as user" — backlog.

## Backend work

**Controllers (all gated on `[Authorize(Policy="PlatformAdmin")]`):**

- `AdminBusinessController`:
  - `GET /admin/businesses` — cross-tenant list with filters.
  - `POST /admin/businesses/{uid}/verify`, `/suspend`, `/unsuspend`, `/delete`.
  - `GET /admin/businesses/{uid}` — full detail with audit log.
- `AdminVerificationController`:
  - `GET /admin/verifications/compliance` — queue view with filters.
  - `POST /admin/verifications/compliance/{uid}/approve`, `/reject`.
  - `POST /admin/verifications/compliance/bulk-approve`.
- `AdminReferenceDataController`:
  - `/admin/industries`, `/admin/countries`, `/admin/currencies`, `/admin/catalog-categories` — CRUD + reorder children.
- `AdminUserController`:
  - `GET /admin/users` — cross-tenant search.
  - `POST /admin/users/{uid}/unlock`, `/reset-password`, `/promote`, `/demote`.
- `AdminContentController`:
  - `POST /admin/content/catalog-items/{uid}/hide`, `/flag`, `/delete`.
  - Same for `/rfqs` and `/reviews`.
- `AdminMetricsController`:
  - `GET /admin/metrics/overview` — dashboard payload.
  - `GET /admin/metrics/timeseries?metric=...&range=...`.

**Audit log:**

- New entity `AdminAuditEntry : BaseEntity`.
- New middleware `AdminAuditMiddleware` positioned after authentication: for any request on `/admin/*` where method is not `GET`, wraps the pipeline and records the call on success.
- Service helper `IAdminAuditLog.Record(...)` for actions that need custom payloads.

**Files to create:**

- `src/NexTrade.Api/Controllers/Admin/AdminBusinessController.cs`
- `src/NexTrade.Api/Controllers/Admin/AdminVerificationController.cs`
- `src/NexTrade.Api/Controllers/Admin/AdminReferenceDataController.cs`
- `src/NexTrade.Api/Controllers/Admin/AdminUserController.cs`
- `src/NexTrade.Api/Controllers/Admin/AdminContentController.cs`
- `src/NexTrade.Api/Controllers/Admin/AdminMetricsController.cs`
- `src/NexTrade.Api/Middleware/AdminAuditMiddleware.cs`
- `src/NexTrade.Infrastructure/Services/Admin/*Service.cs` (one per controller).
- `src/NexTrade.Core/Entities/AdminAuditEntry.cs`

## Frontend work

- `ui/src/app/(admin)/dashboard/page.tsx` — KPIs, sparklines, trust distribution chart.
- `ui/src/app/(admin)/verifications/page.tsx` — compliance queue with bulk select.
- `ui/src/app/(admin)/businesses/page.tsx` and `/[uid]/page.tsx` — list + detail with audit log tab.
- `ui/src/app/(admin)/users/page.tsx` — cross-tenant user search and actions.
- `ui/src/app/(admin)/content/page.tsx` — moderation tabs: catalog / RFQs / reviews.
- `ui/src/app/(admin)/reference-data/page.tsx` — taxonomy editors with tree reorder (DnD).
- `ui/src/app/(admin)/audit-log/page.tsx` — global audit trail.
- Admin API module in `ui/src/lib/api.ts` — `admin.*` namespace using the admin token from [Phase 1](phase-1-foundation-identity.md).

## Data / migrations

- Migration name: `AdminConsole`.
- New table `admin_audit_entries` with indexes on `(admin_user_id, created_at)` and `(target_entity, target_uid)`.
- Add `IsSuspended` + `SuspendedAt` on `businesses` if not already present.

## Reused utilities

- `.IgnoreQueryFilters()` — every admin read. Admins do not have a `TenantContext.TenantId`.
- [ServiceResult](../../src/NexTrade.Infrastructure/Services/ServiceResult.cs) — all admin service methods.
- [QueryExtensions.ToPagedResultAsync](../../src/NexTrade.Infrastructure/Services/QueryExtensions.cs) — every admin list endpoint.
- [QueryExtensions.ResolveRefAsync](../../src/NexTrade.Infrastructure/Services/QueryExtensions.cs) — Uid resolution inside admin payloads.
- Platform-admin policy and seeded admin account from [Phase 1](phase-1-foundation-identity.md).
- Trust-score recompute service from [Phase 4](phase-4-messaging-compliance-trust.md) — admins can trigger an on-demand recompute from the business detail page.

## Exit criteria

- [ ] Admin logs in at `/admin/login` (from [Phase 1](phase-1-foundation-identity.md)), lands on populated dashboard.
- [ ] Admin opens verification queue, approves a pending compliance doc in bulk mode; supplier's public profile flips to Verified.
- [ ] Admin edits an Industry taxonomy entry; discovery filters in [Phase 2](phase-2-catalog-discovery.md) reflect the change.
- [ ] Admin suspends a business; that business's users cannot log in; their public profile returns 404.
- [ ] Admin flags a catalog item; item disappears from discovery results, stays visible to its owner as `Flagged`.
- [ ] Every write action above appears in the audit log with correct `admin_user_id` and payload.
- [ ] Tenant user hitting any `/admin/*` endpoint returns 403.
- [ ] Metrics dashboard numbers match a hand-run SQL query (spot-check).

## Verification

```bash
docker compose -f infra/docker/docker-compose.full.yml up -d
cd src/NexTrade.AppHost && dotnet run
cd ui && npm run dev
```

Seed a handful of businesses / items / RFQs from [Phases 2–4](phase-2-catalog-discovery.md), then run through every admin action in the browser. Cross-check the audit log after each write.

## Dependencies

- All prior phases contribute the data and surfaces this console operates over.
- Platform-admin identity from [Phase 1](phase-1-foundation-identity.md) is load-bearing; without the policy, nothing in this phase is reachable.
