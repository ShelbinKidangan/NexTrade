# Phase 2 — Catalog & Public Discovery

> **Depends on:** [Phase 1 — Foundation & Identity](phase-1-foundation-identity.md).

## Goal

Suppliers list products and services with media, and buyers — logged in or not — discover them via keyword search and public business profiles. Buyers can save suppliers into custom lists. Discovery here is **non-AI**: Postgres full-text search over `tsvector` columns populated by triggers. Semantic search lands in [Phase 6](phase-6-ai-layer.md).

## Scope

**In:**

- CatalogItem CRUD with filtering, pagination, and status transitions (`Draft` → `Published` → `Archived`). Extend [CatalogService](../../src/NexTrade.Infrastructure/Services/CatalogService.cs) and [CatalogController](../../src/NexTrade.Api/Controllers/CatalogController.cs).
- [CatalogMedia](../../src/NexTrade.Core/Entities/CatalogMedia.cs) upload to Azure Blob (Azurite in dev). Image list, set primary, delete.
- [CatalogCategory](../../src/NexTrade.Core/Entities/CatalogCategory.cs) tree — read-any API, mutation API (platform-admin only; admin UI is in [Phase 5](phase-5-platform-admin-console.md), endpoints exist here).
- **Discovery (non-AI):** Postgres full-text search over `catalog_items` (name, description, tags) and `businesses` (name, bio, capabilities) via `tsvector` + GIN index. Ranking via `ts_rank_cd`, filters by category, industry, country.
- Public business profile endpoint — enrich existing `GetByUid` with published catalog items, compliance badge placeholder, and follower count.
- Saved-suppliers / follow flow built on the existing [Connection](../../src/NexTrade.Core/Entities/Connection.cs) entity in Follow mode.
- Frontend pages: [(app)/catalog](../../ui/src/app/(app)/catalog/), [(app)/catalog/new](../../ui/src/app/(app)/catalog/new/), [(app)/discover](../../ui/src/app/(app)/discover/), [(public)/business/[uid]](../../ui/src/app/(public)/business/[uid]/), [(app)/suppliers](../../ui/src/app/(app)/suppliers/).

**Out:**

- Semantic search, AI matching, due-diligence tool — all [Phase 6](phase-6-ai-layer.md).
- RFQ creation from discovery — [Phase 3](phase-3-rfq-quoting.md).
- Messaging a supplier from their profile — [Phase 4](phase-4-messaging-compliance-trust.md).

## Backend work

**Controllers / services:**

- Extend [CatalogController](../../src/NexTrade.Api/Controllers/CatalogController.cs) with: `GET /catalog?search=&category=&status=&page=`, `POST /catalog/{uid}/media`, `DELETE /catalog/{uid}/media/{mediaId}`, `PATCH /catalog/{uid}/status`.
- Create `DiscoveryController` — `GET /discover/items`, `GET /discover/businesses`. Both are `[AllowAnonymous]` and use `.IgnoreQueryFilters()` because they are platform-scope.
- Create `DiscoveryService` — builds FTS queries, applies filters, returns paged results via `QueryExtensions.ToPagedResultAsync`.
- Create `CatalogMediaService` — Blob upload/download via `Azure.Storage.Blobs`. Signed URL generation for private items, public URLs for published media.
- Create `ConnectionsController` / `ConnectionsService` — follow, unfollow, list followed suppliers, list followers. Uses `BaseEntity` cross-tenant semantics.
- Create `CatalogCategoriesController` — read anonymous; mutations `[Authorize(Policy="PlatformAdmin")]`.

**Full-text search plumbing:**

- Add DB trigger (in a new migration) that updates `search_vector` on insert/update of `catalog_items` and `businesses`. Use `to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ...)`.
- `DiscoveryService` builds queries via `EF.Functions.ToTsQuery` / `EF.Functions.Match` extensions from `Npgsql.EntityFrameworkCore.PostgreSQL`.

**Files to create:**

- `src/NexTrade.Api/Controllers/DiscoveryController.cs`
- `src/NexTrade.Api/Controllers/ConnectionsController.cs`
- `src/NexTrade.Api/Controllers/CatalogCategoriesController.cs`
- `src/NexTrade.Infrastructure/Services/DiscoveryService.cs`
- `src/NexTrade.Infrastructure/Services/CatalogMediaService.cs`
- `src/NexTrade.Infrastructure/Services/ConnectionsService.cs`
- `src/NexTrade.Infrastructure/Services/CatalogCategoryService.cs`

## Frontend work

- [ui/src/app/(app)/catalog/page.tsx](../../ui/src/app/(app)/catalog/) — list with search, status filter, pagination.
- [ui/src/app/(app)/catalog/new/page.tsx](../../ui/src/app/(app)/catalog/new/) — create form with category picker, multi-image upload, tag entry.
- `ui/src/app/(app)/catalog/[uid]/page.tsx` — edit + media manager + publish/archive buttons.
- [ui/src/app/(app)/discover/page.tsx](../../ui/src/app/(app)/discover/) — search bar, result grid, filters, pagination. Tab toggle: items vs businesses.
- `ui/src/app/(app)/discover/item/[uid]/page.tsx` — item detail + supplier card + follow button.
- [ui/src/app/(public)/business/[uid]/page.tsx](../../ui/src/app/(public)/business/[uid]/) — public profile, item grid, follow button (prompts login).
- [ui/src/app/(app)/suppliers/page.tsx](../../ui/src/app/(app)/suppliers/) — followed suppliers, list grouping placeholder.
- Extend [ui/src/lib/api.ts](../../ui/src/lib/api.ts) with `catalog`, `discovery`, `media`, `connections` modules.

## Data / migrations

- Migration name: `CatalogDiscovery`.
- Adds FTS triggers, GIN indexes on `catalog_items.search_vector` and `businesses.search_vector`, unique index on `(business_id, slug)` for items.
- Creates blob container names in config: `nextrade-catalog-media`.

## Reused utilities

- [QueryExtensions.ToPagedResultAsync](../../src/NexTrade.Infrastructure/Services/QueryExtensions.cs) — every list endpoint.
- [QueryExtensions.ResolveRefAsync](../../src/NexTrade.Infrastructure/Services/QueryExtensions.cs) — category/industry Uid→entity.
- [TenantMiddleware](../../src/NexTrade.Api/Middleware/TenantMiddleware.cs) — discovery must explicitly call `.IgnoreQueryFilters()`, everything else inherits tenant scope.
- [ServiceResult](../../src/NexTrade.Infrastructure/Services/ServiceResult.cs).

## Exit criteria

- [ ] Supplier creates 3 catalog items with images, publishes them.
- [ ] Anonymous user hits `/discover` in the browser, searches a keyword, finds the items.
- [ ] Anonymous user opens `/business/{uid}`, sees published items and compliance badge placeholder.
- [ ] Buyer registers, follows a supplier, sees them in `(app)/suppliers`.
- [ ] `GET /discover/items?search=foo` returns relevance-ranked results with total count.
- [ ] Changing an item's name updates the FTS index (verify via new search term).
- [ ] Categories CRUD returns 403 for tenant user, 200 for platform admin.
- [ ] Archived items do not appear in discovery results.

## Verification

```bash
# Start full stack with Azurite and Mailhog
docker compose -f infra/docker/docker-compose.full.yml up -d
cd src/NexTrade.AppHost && dotnet run
cd ui && npm run dev
```

Manual walkthrough: register two tenants → Tenant A publishes items → open private window → search as anonymous → view public profile → register Tenant B → follow Tenant A → confirm in saved suppliers.

## Dependencies

- Phase 1 migration provides the FTS columns; this phase adds the trigger and index.
- Phase 1 JWT + tenant middleware; nothing here bypasses it except discovery controllers.
