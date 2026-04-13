# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is This

NexTrade is an AI-native **supplier intelligence platform** — the discovery and trust layer for B2B. Businesses register, build verified profiles, list products/services, get discovered by buyers, request and compare quotes. The platform is seeded from vendor lists of enterprise customers using our S2P system (~5,000 suppliers).

NexTrade is the **top-of-funnel network**; the S2P system is the **back-office procurement engine**. No transactions (orders/invoicing) happen on NexTrade — the platform's job ends at "Quote Awarded." Execution happens in the buyer's own systems.

Standalone app. Separate repo, separate DB, separate deployment. Integrates with S2P via API.

## Architecture

- **Core** (`NexTrade.Core`) — entities, interfaces, enums. Zero dependencies.
- **Shared** (`NexTrade.Shared`) — DTOs, MassTransit contracts.
- **Infrastructure** (`NexTrade.Infrastructure`) — EF Core, services, repositories, Identity.
- **API** (`NexTrade.Api`) — controllers, middleware, SignalR hubs.
- **Consumers** (`NexTrade.Consumers`) — MassTransit background workers. Separate container.
- **AppHost** (`NexTrade.AppHost`) — Aspire orchestrator. Dev only, never deployed.
- **ServiceDefaults** (`NexTrade.ServiceDefaults`) — OpenTelemetry, health checks. Dev only.
- **UI** ([ui/](ui/)) — Next.js 16 + React 19 frontend. Separate npm project, consumes the API. Product requirements live in [docs/PRD.md](docs/PRD.md).

Solution file is [src/NexTrade.slnx](src/NexTrade.slnx) — the new XML solution format. `dotnet build`/`run` against the `.slnx` or individual project directories.

### Multi-Tenant Model

In NexTrade, **tenant = business**, and **cross-tenant visibility is the core feature**. This means:

- **Tenant-scoped queries**: my catalog, my RFQs, my team, my settings, my compliance vault (use normal EF query filters)
- **Platform-scoped queries**: discovery, public profiles, public RFQs, reviews, deal confirmations (use `.IgnoreQueryFilters()`)

### Tenant Resolution Flow

1. JWT carries a `tenant_id` claim (plus `NameIdentifier` for the user).
2. [TenantMiddleware](src/NexTrade.Api/Middleware/TenantMiddleware.cs) runs after auth, parses the claim, and populates the scoped [TenantContext](src/NexTrade.Infrastructure/Data/TenantContext.cs) (`ITenantContext`).
3. [AppDbContext](src/NexTrade.Infrastructure/Data/AppDbContext.cs) uses `ITenantContext.TenantId` inside global query filters on every `TenantEntity`.
4. Any cross-tenant read must call `.IgnoreQueryFilters()` explicitly — there is no other escape hatch.

SignalR note: JWT auth on `/hubs/*` reads the token from the `access_token` query string (see [Program.cs](src/NexTrade.Api/Program.cs)), since browser WebSocket clients can't send Authorization headers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | .NET 10, C# |
| ORM | EF Core 10 + PostgreSQL (Npgsql) |
| Search | pgvector (semantic) + PostgreSQL full-text |
| Auth | ASP.NET Core Identity + JWT |
| Messaging | MassTransit + RabbitMQ |
| Cache | Valkey (Redis-compatible) |
| Real-time | SignalR + Valkey backplane |
| Storage | Azure Blob Storage |
| API Docs | Scalar |
| Orchestration | Aspire (dev) |

## Development Commands

```bash
# Backend — run with Aspire (recommended, brings up Postgres/RabbitMQ/Valkey)
cd src/NexTrade.AppHost
dotnet run

# Backend — API only (expects infra already running)
cd src/NexTrade.Api
dotnet run

# Add an EF migration (Infrastructure owns the model, Api is the startup host)
dotnet ef migrations add MigrationName -p src/NexTrade.Infrastructure -s src/NexTrade.Api

# Frontend
cd ui
npm run dev     # next dev
npm run build   # next build
npm run lint    # eslint

# Docker — production-style stack (Api + Consumers + Postgres + RabbitMQ + Valkey)
docker compose -f infra/docker/docker-compose.mvp.yml up -d

# Docker — full stack (adds Azurite blob emulator + Mailhog SMTP dev server)
docker compose -f infra/docker/docker-compose.full.yml up -d

# Docker — DB-only, for running integration tests against real Postgres
docker compose -f infra/docker/docker-compose.test.yml up -d
```

Docker build contexts are the repo root (not each project dir) so the Dockerfiles in [src/NexTrade.Api/Dockerfile](src/NexTrade.Api/Dockerfile) and [src/NexTrade.Consumers/Dockerfile](src/NexTrade.Consumers/Dockerfile) can `COPY` sibling projects. The compose files expect env vars (`DB_USER`, `DB_CONNECTION_STRING`, `JWT_KEY`, etc.) from a `.env` file next to the compose file or the shell environment.

Frontend auth: the UI stores the JWT and attaches it via [ui/src/lib/api.ts](ui/src/lib/api.ts); SignalR connections must pass it through the `access_token` query string, not a header.

## Code Patterns

### Entity Hierarchy
- `TenantEntity` — tenant-scoped, has `Uid`, `TenantId`, audit fields
- `ChildEntity` — no Uid/TenantId, isolated via parent FK
- `PlatformEntity` — shared across tenants (Industry, Country, Currency)
- `BaseEntity` — cross-tenant entities (DealConfirmation, Review, Conversation)

### Service Pattern
- Thin controllers → scoped services → [ServiceResult / ServiceResult&lt;T&gt;](src/NexTrade.Infrastructure/Services/ServiceResult.cs) (`Ok` / `Created` / `Fail` with status code and field-level errors)
- DTOs as nested records inside service class
- Filter records: `public record FooFilter(int Page = 1, int PageSize = 20, string? Search = null)`
- Manual DTO mapping (no AutoMapper)
- Reusable query helpers live in [QueryExtensions](src/NexTrade.Infrastructure/Services/QueryExtensions.cs): `ToPagedResultAsync`, `CheckDuplicateAsync`, `ResolveRefAsync` (Uid → entity with 400 on miss). Prefer these over hand-rolling the same logic.

### Naming
- Public APIs use `Uid` (Guid), never expose `Id` (long)
- Controllers: plural (`BusinessesController`)
- Services: `FooService`
- DTOs: `FooDto`, `CreateFooRequest`, `UpdateFooRequest`, `FooFilter`
- Enums stored as strings in DB

### Database
- Snake_case naming convention
- UTC datetime conversion on all DateTime properties
- Decimal precision 18,4 default
- JSONB for flexible fields (specifications, capabilities, etc.)
- pgvector for semantic search embeddings

## Code Style

Only add comments when code genuinely cannot express its own intent. Do not restate what code does.
