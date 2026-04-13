# Phase 6 — AI Layer

> **Depends on:** [Phase 1](phase-1-foundation-identity.md) through [Phase 5](phase-5-platform-admin-console.md).
>
> **Philosophy:** Everything in this phase is **additive**. Nothing here is load-bearing for core flows — every AI surface must degrade gracefully to the non-AI behaviour delivered in earlier phases.

## Goal

Layer AI intelligence across identity, discovery, engagement, and analytics. Claude API is the model backbone; embeddings populate the `catalog_items.embedding` column that has existed (unused) since [Phase 1](phase-1-foundation-identity.md).

## Scope

**Identity AI:**

- Profile enrichment consumer: supplier pastes a website URL → background job fetches the site, runs a Claude extraction pass, writes a structured draft profile the supplier can accept or edit.
- Catalog builder: supplier uploads a PDF price list / brochure → draft [CatalogItem](../../src/NexTrade.Core/Entities/CatalogItem.cs) rows in `Draft` status.
- Compliance document parser: certificate upload → auto-fill document type, issuer, issue date, expiry date. Supplier confirms before save.

**Discovery AI:**

- `CatalogItemEmbeddingConsumer` — listens for `CatalogItemPublishedEvent`, calls the embeddings API, writes to `catalog_items.embedding` (pgvector(1536), already present).
- Hybrid search: extend `DiscoveryService` from [Phase 2](phase-2-catalog-discovery.md) to blend `ts_rank_cd` with cosine similarity. Feature-flag the blend so the pure-FTS fallback still works.
- Similar suppliers endpoint: `GET /discover/businesses/{uid}/similar` via embedding cosine.
- **Vendor Due-Diligence Tool** (public, no login): paste a GSTIN or CIN → pipeline fetches from MCA / GST / DGFT / GeM / Udyam / MSME public endpoints → Claude synthesizes a readable report. Lands at [(public)/due-diligence](../../ui/src/app/(public)/due-diligence/) and is the primary non-auth buyer-acquisition hook.

**Engagement AI:**

- Smart RFQ generator: plain-text requirement → structured [Rfq](../../src/NexTrade.Core/Entities/Rfq.cs) + [RfqItem](../../src/NexTrade.Core/Entities/RfqItem.cs) draft via Claude with tool-use.
- Quote comparison assistant: augment the buyer comparison view from [Phase 3](phase-3-rfq-quoting.md) with a Claude-generated narrative summary (risks, total-cost-of-ownership, recommendation).
- RFQ auto-responder: supplier-side opt-in. New RFQ arrives → Claude drafts a quote using the supplier's catalog; supplier reviews and submits.

**Intelligence AI:**

- Supplier analytics page at [(app)/intelligence](../../ui/src/app/(app)/intelligence/): view counts, inquiry conversion, response rate, quote win rate, competitive positioning.
- Buyer intelligence: risk alerts (supplier trust dip, compliance expiring, negative review cluster), alternative-supplier recommendations.
- Conversational analytics: natural-language queries over the tenant's own data, answered via Claude with tool-use calling pre-defined scoped SQL endpoints.

**Admin AI surfaces:**

- AI usage dashboard in the admin console from [Phase 5](phase-5-platform-admin-console.md): token spend per feature, per tenant, per model.
- Prompt template management: centralized templates with version history.
- Auto-moderation suggestions: catalog items / reviews flagged by a classifier surface in the [Phase 5](phase-5-platform-admin-console.md) moderation queue with a confidence score.

## Out of scope

- WhatsApp integration (still deferred).
- Any paid external data feed (MCA / GST integrations use public endpoints only; commercial feeds are a backlog item).
- Fine-tuning or self-hosted models. Claude API only.

## Backend work

**Claude-API client:**

- Use `Anthropic.SDK` (or the official `@anthropic-ai/sdk` via a Node microservice — decide during design spike). Default: .NET SDK in-process.
- All Claude calls go through a `IClaudeClient` wrapper that:
  - Applies **prompt caching** on stable system prompts (per the `claude-api` skill guidance).
  - Meters token usage per (tenant, feature, model) → persists to a `ai_usage_entries` table for the admin dashboard.
  - Retries with backoff on 429.
  - Falls back silently (feature-flagged) when the API is unreachable.

**Consumers (in [NexTrade.Consumers](../../src/NexTrade.Consumers/)):**

- `ProfileEnrichmentConsumer` — handles `ProfileEnrichmentRequestedEvent`.
- `CatalogBuilderConsumer` — handles `CatalogBuilderRequestedEvent` (PDF → items).
- `ComplianceDocumentParseConsumer` — handles `ComplianceUploadedEvent` (chained from [Phase 4](phase-4-messaging-compliance-trust.md) upload).
- `CatalogItemEmbeddingConsumer` — handles `CatalogItemPublishedEvent` (chained from [Phase 2](phase-2-catalog-discovery.md) publish action).
- `TrustRiskMonitorConsumer` — scheduled daily, emits alerts.

**Controllers:**

- `AiAssistController`: `POST /ai/rfq-draft`, `POST /ai/quote-draft`, `POST /ai/quote-summary`, `POST /ai/analytics-query`.
- `DueDiligenceController`: `POST /public/due-diligence` — rate-limited, no auth.
- `AdminAiController`: usage metrics, template CRUD (admin-only).

**Files to create:**

- `src/NexTrade.Infrastructure/AI/ClaudeClient.cs`
- `src/NexTrade.Infrastructure/AI/PromptTemplates/*.md`
- `src/NexTrade.Infrastructure/AI/Embeddings/EmbeddingClient.cs`
- `src/NexTrade.Api/Controllers/AiAssistController.cs`
- `src/NexTrade.Api/Controllers/DueDiligenceController.cs`
- `src/NexTrade.Api/Controllers/Admin/AdminAiController.cs`
- `src/NexTrade.Consumers/Ai/ProfileEnrichmentConsumer.cs`
- `src/NexTrade.Consumers/Ai/CatalogBuilderConsumer.cs`
- `src/NexTrade.Consumers/Ai/ComplianceDocumentParseConsumer.cs`
- `src/NexTrade.Consumers/Ai/CatalogItemEmbeddingConsumer.cs`
- `src/NexTrade.Consumers/Ai/TrustRiskMonitorConsumer.cs`
- `src/NexTrade.Core/Entities/AiUsageEntry.cs`
- `src/NexTrade.Core/Entities/PromptTemplate.cs`

## Frontend work

- [ui/src/app/(app)/intelligence/page.tsx](../../ui/src/app/(app)/intelligence/) — tenant analytics dashboard.
- [ui/src/app/(public)/due-diligence/page.tsx](../../ui/src/app/(public)/due-diligence/) — public report tool.
- AI-assist affordances across existing flows:
  - Profile page: "Enrich from website" button.
  - Catalog new: "Upload PDF to draft items" button.
  - Compliance upload: auto-fill before save.
  - RFQ create: "Draft from description" button.
  - Quote comparison: "Summarize" panel.
  - Messages: optional "Suggest reply" button (feature-flag, off by default).
- Admin: AI usage dashboard + template editor in `(admin)/ai/`.

## Data / migrations

- Migration name: `AiLayer`.
- New tables: `ai_usage_entries`, `prompt_templates`, `due_diligence_reports` (cached by GSTIN/CIN with TTL).
- Ensure pgvector extension is enabled (already in [Phase 1](phase-1-foundation-identity.md) initial migration) and IVFFlat index on `catalog_items.embedding`.

## Reused utilities

- [ServiceResult](../../src/NexTrade.Infrastructure/Services/ServiceResult.cs) — all AI service methods return wrapped results (so failures degrade gracefully).
- `DiscoveryService` from [Phase 2](phase-2-catalog-discovery.md) — extended, not replaced.
- MassTransit bus from [Phase 3](phase-3-rfq-quoting.md) onward — every AI task runs as a consumer.
- Blob storage abstraction from [Phase 2](phase-2-catalog-discovery.md) / [Phase 4](phase-4-messaging-compliance-trust.md) — for PDF ingestion.
- Platform-admin policy + audit-log middleware from [Phase 5](phase-5-platform-admin-console.md) for AI admin surfaces.
- `claude-api` skill guidance for prompt caching, tool use, and Managed Agents (load it before touching Claude calls).

## Exit criteria

- [ ] Supplier pastes a website URL → within a minute sees a pre-filled profile draft with source citations.
- [ ] Supplier uploads a 10-item brochure PDF → sees that many draft catalog items.
- [ ] Compliance upload auto-fills type / issuer / expiry; supplier edits and confirms.
- [ ] Keyword search returns 10 results; semantic search for a synonym returns 10 overlapping + 4 new relevant results that the keyword version missed.
- [ ] Due-diligence tool returns a readable report for a known GSTIN within the rate-limit window.
- [ ] Buyer types "10 tonnes HR coil, delivered Chennai next month, ISO 9001 only" and gets a structured RFQ draft with line items.
- [ ] Quote comparison view shows an AI narrative that references each quote by supplier name.
- [ ] Intelligence dashboard loads and answers a natural-language question about own data.
- [ ] Admin AI usage dashboard shows non-zero token counts broken down by feature.
- [ ] Disabling the AI feature flag on any surface falls back to the non-AI behaviour from earlier phases without errors.

## Verification

```bash
docker compose -f infra/docker/docker-compose.full.yml up -d
cd src/NexTrade.AppHost && dotnet run
cd ui && npm run dev
# Set ANTHROPIC_API_KEY in .env before starting
```

Exercise every AI surface with a flag-on / flag-off toggle and confirm graceful degradation. Watch Mailhog and RabbitMQ admin (`http://localhost:15672`) to confirm consumers fire.

## Dependencies

- Every prior phase supplies the data and surfaces this layer enriches. In particular:
  - [Phase 2](phase-2-catalog-discovery.md) — catalog items and the FTS infrastructure that hybrid search extends.
  - [Phase 3](phase-3-rfq-quoting.md) — RFQ + quote objects that the engagement AI drafts.
  - [Phase 4](phase-4-messaging-compliance-trust.md) — compliance upload pipeline and trust score signals that risk monitoring reads.
  - [Phase 5](phase-5-platform-admin-console.md) — admin console this phase extends with AI surfaces.
