# NexTrade — Product Requirements Document

> **Status:** Draft
> **Date:** 2026-04-13
> **Deployment:** Standalone portal with separate login. Feeds into and is fed by the S2P system.

---

## 1. Vision

An AI-native **supplier intelligence platform** — the discovery and trust layer for B2B. Businesses register, build verified profiles, list products and services, get discovered by buyers, request and compare quotes, and build trust through verified transactions.

NexTrade is **not a social network**. It is a utility-first platform where suppliers gain visibility and buyers find qualified vendors fast. The platform is seeded from vendor lists of enterprise customers already using our S2P system, solving the cold start problem from day one.

**Tagline:** _"Find the right supplier. Fast."_

---

## 2. Relationship to S2P

NexTrade is the **top-of-funnel supplier network**. The S2P system is the **back-office procurement engine**. They feed each other:

```
┌─────────────────────────────────────────────────┐
│               NexTrade Ecosystem                │
│                                                 │
│  ┌──────────────┐    ┌────────────────────────┐ │
│  │    S2P        │───>│   NexTrade Network     │ │
│  │  (Buyer-side  │    │  (Discovery + Profiles │ │
│  │   procurement │<───│   + RFQ + Intelligence)│ │
│  │   engine)     │    │                        │ │
│  └──────────────┘    └────────────────────────┘ │
│         │                       │               │
│         │  Vendor master lists  │               │
│         │  seed the network     │               │
│         │                       │               │
│         │  New supplier         │               │
│         │  discoveries flow     │               │
│         │  back into S2P        │               │
│         └───────────────────────┘               │
└─────────────────────────────────────────────────┘
```

**How it works:**
1. S2P enterprise customers have vendor master lists (starting pool: ~5,000 suppliers)
2. AI enriches thin vendor records into rich draft profiles
3. Suppliers receive warm invites from their actual customers to claim profiles
4. Once claimed, suppliers become discoverable by all buyers on the network
5. Supplier A serves Enterprise X via S2P — now Enterprise Y discovers Supplier A through NexTrade
6. New buyer-supplier relationships formed on NexTrade feed back into S2P for procurement execution

Every new S2P customer brings their vendor base into the network. Every supplier in the network makes S2P more valuable to the next enterprise. That's the flywheel.

---

## 3. Market Gap

| Existing Platform | Limitation |
|-------------------|-----------|
| Alibaba.com | China-centric, spam-heavy, no trust layer |
| IndiaMART | Outdated UX, lead-gen spam, no AI |
| ThomasNet | Directory only, no engagement, legacy |
| SAP Ariba Network | Locked to SAP, expensive, buyer-centric |
| Coupa Supplier Network | Suppliers are second-class, onboarding tool not a network |
| TealBook | Top-down enterprise sell, scraped data, no supplier engagement |
| Kompass / GlobalSources | Pure directories, no interaction |

**What's missing:** A modern, AI-powered supplier intelligence platform with first-party verified data, built bottom-up from supplier participation, and connected to a live procurement ecosystem.

---

## 4. Core Concepts

- **Business** — the central entity. Every registered company is a Business.
- **Catalog** — products and services a business offers.
- **Discovery** — AI-powered search to find businesses, products, and services.
- **RFQ** — structured way to request and compare quotes. Terminal state is "Quote Awarded" — execution happens in the buyer's own systems.
- **Saved Suppliers** — buyers bookmark and organize suppliers into custom lists.
- **Verified Badge** — trust signal earned through document verification.
- **Trust Score** — composite score from reviews, verification, activity, response rate.
- **Deal Confirmation** — mutual acknowledgment that an off-platform transaction occurred. Anchors reviews and trust data.

---

## 5. Product Layers

The platform is organized into four layers, each building on the previous:

```
Identity data  ──>  powers Discovery
Discovery      ──>  drives Engagement (RFQs)
Engagement     ──>  generates Intelligence data
Intelligence   ──>  makes Identity profiles richer
                    (flywheel)
```

### 5.1 Layer 1 — Identity

The foundation. Every business gets a verified, structured, living profile. Valuable as a standalone tool — no network effect needed.

#### Onboarding & Registration

Two primary onboarding flows, both designed to reach a published profile in under 3 minutes:

**Self-Registration Flow:**
```
Sign up (email + password)
  → Company name + industry + location (3 fields, minimal)
  → "Paste your website URL" → AI enriches profile automatically
  → Review AI-generated profile → Edit if needed → Publish
  → "Upload a catalog PDF?" → AI builds catalog listings
  → Done. Profile live. < 3 minutes.
```

**S2P Claim Flow (warm invite):**
```
Email/SMS: "Your customer [Enterprise X] added you to NexTrade"
  → Click link → See pre-built AI-enriched draft profile
  → "Is this information correct?" → Edit/confirm
  → Set password → Profile claimed and published
  → "Upload your catalog?" → AI builds listings
  → Done. < 2 minutes.
```

- Invite team members with roles (Admin, Catalog Manager, Sales, Procurement)
- **Profile completeness score** with ROI messaging: "Your profile is 45% complete. Businesses with 80%+ profiles get 3x more inquiries." Each step shows the concrete benefit.
- Business verification workflow:
  - Upload business license, tax registration, incorporation docs
  - Admin review → **Verified** badge
  - Re-verification on expiry

#### Business Profile (Public)
- Company name, logo, banner image
- About / description
- Industry, sub-industry
- Headquarters location + additional locations
- Company size (employees, revenue range)
- Year established
- Certifications & capabilities (ISO, industry-specific)
- Social links, website
- Product/service highlights (pinned catalog items)
- Trust Score + Verified badge
- Reviews & ratings from other businesses
- Activity stats (response rate, avg response time)
- SEO-indexed, shareable URL (e.g., `nextrade.io/acme-metals`)
- **Public without login** — anyone can view profiles and search. Actions (message, RFQ, save) require sign-up. This drives SEO traffic and lowers the barrier for buyers.
- **Embeddable catalog widget** — businesses embed their NexTrade catalog on their own website. They get a polished product showcase; NexTrade gets backlinks and brand visibility ("Powered by NexTrade").

#### Product & Service Catalog
- Create product or service listing:
  - Title, description, specifications (key-value pairs)
  - Category (hierarchical taxonomy)
  - Images, datasheets, videos
  - Pricing (fixed / range / "contact for quote")
  - MOQ (Minimum Order Quantity), lead time
  - Delivery/service regions
- Bulk import via CSV/Excel
- AI Catalog Builder (upload PDF → structured listing)
- Draft / Published / Archived status
- Catalog analytics (views, inquiries)

#### Compliance Vault
- Upload compliance documents (ISO certs, insurance, audit reports, licenses)
- Document metadata: type, issue date, expiry date, issuing body
- Auto-expiry tracking with email notifications (30/14/7 days before)
- Share documents with specific businesses (controlled visibility)
- AI document parser (extract details, validate format — zero manual entry)

#### Reviews & Trust
- Reviews anchored to **Deal Confirmations** (mutual acknowledgment of off-platform transaction)
- Review categories: Quality, Communication, Delivery, Value (1-5 stars + text)
- Trust Score algorithm:
  - Verification status (weighted heavily)
  - Average review rating
  - Response rate & speed
  - Profile completeness
  - Account age & activity
- Verified Deal badge on reviews (both parties confirmed the transaction)
- Report/flag inappropriate reviews

### 5.2 Layer 2 — Discovery

The core utility. AI-powered search and matching that makes the network valuable.

#### Search & Browse
- **Public access** — browse and search without login. Gate on actions (message, save, RFQ).
- Browse by category, industry, location
- Filter: verified only, rating, company size, certifications, delivery region
- Semantic search (natural language queries via pgvector)
- "Similar suppliers" recommendations (embedding similarity)
- Trending products/services
- Featured / promoted listings (future monetization)

#### Vendor Due Diligence Tool (Public, Free)

A free, public tool that drives buyer acquisition. No login required to use.

- Enter a company name or GST number → instant due diligence summary
- Pulls from government registry data (MCA, GST, DGFT) + NexTrade profile if it exists
- Shows: incorporation status, GST compliance, import/export history, MSME classification, certifications on file, reviews
- If the business is on NexTrade: "This supplier is verified on NexTrade. [Send RFQ] [View full profile]" — gates on login
- If the business is not on NexTrade: "Invite this supplier to claim their profile for full details"
- Procurement managers use this routinely for basic checks → builds habit → converts to full platform usage

#### Supplier Organization

- **Saved Suppliers** — bookmark businesses for quick access
- **Supplier Lists** — buyer-created groups (e.g., "CNC vendors - shortlisted", "Backup packaging suppliers")
- **Smart Alerts** — "Notify me when a new verified CNC shop registers in Pune"
- **Saved Searches** — persistent search criteria with periodic notifications

### 5.3 Layer 3 — Engagement

Where discovery converts to real business. The platform's job ends when buyer and supplier agree on terms.

#### RFQ (Request for Quote)
- Create RFQ:
  - Title, description, line items with specs
  - Quantity, delivery location, timeline
  - Attachments (drawings, specs docs)
  - Visibility: public (all businesses) or targeted (selected businesses)
- Receive and compare quotes:
  - Side-by-side comparison view
  - AI-generated comparison summary
- Negotiate via threaded messages per quote
- **Award quote** → terminal state. Execution happens in buyer's own ERP/S2P.
- Post-award: **Deal Confirmation** prompt to both parties ("Did this result in a deal?")
- RFQ analytics (responses received, avg response time)
- **Shareable RFQ links** — buyer creates an RFQ and gets a unique URL. Can share via WhatsApp, email, or any channel — even to suppliers not yet on NexTrade. Suppliers who click must claim a profile to respond. Every RFQ becomes a supplier acquisition channel.

#### Messaging
- Threaded conversations (general, per-RFQ)
- Real-time via SignalR
- File attachments
- Read receipts
- Notification preferences (email, in-app, WhatsApp)
- **WhatsApp share** — share NexTrade profile links, RFQ links, and quote summaries directly to WhatsApp. Meets Indian B2B users where they already work.

#### Team Collaboration
- **Procurement team invite** — one person signs up → "Invite your team"
- Shared supplier lists, shared RFQs, shared notes on suppliers
- Team activity visibility (who contacted which supplier, who reviewed which quote)
- Makes NexTrade a team tool, not a personal bookmark

### 5.4 Layer 4 — Intelligence

The moat. Data generated by Layers 1-3 powers insights that make the platform irreplaceable.

#### Supplier Analytics (For Suppliers)
- Profile views: count, trend, viewer industry breakdown
- Catalog analytics: which products get the most views and inquiries
- Competitive positioning: "Competitors in your category have ISO 14001 — getting certified could increase your visibility"
- RFQ response performance: win rate, average response time, how you compare

#### Buyer Intelligence (For Buyers)
- Risk alerts: saved supplier's cert expiring, review score declining, profile going inactive
- Alternative supplier recommendations when risk is flagged
- Pricing benchmarks: anonymized, aggregated quote data ("Network average for this spec is $12-15/kg")
- Demand signals: "RFQ volume for EV battery components up 200% this quarter in your region"

#### Conversational Analytics
- Natural language queries on your own data:
  - _"Which of my products gets the most inquiries?"_
  - _"Show me all RFQs I haven't responded to this week"_
  - _"What's my average response time this month?"_

---

## 6. AI Features

AI is not a separate layer — it's woven into every interaction. All AI features use the Claude API (Anthropic SDK).

### 6.1 Identity AI (Profile Building)

**Profile Enrichment**
- Enter website URL → AI scrapes and structures: company description, industry, capabilities, product/service categories, locations, certifications
- Business reviews and edits before publishing
- Used at scale for S2P vendor data enrichment: thin vendor master records → rich draft profiles

**AI Catalog Builder**
- Upload a PDF brochure, datasheet, or product sheet
- Claude extracts: product name, description, specs, pricing, images
- Generates structured catalog listings for review and publish
- Supports batch processing (multi-page catalogs)

**Compliance Document Parser**
- Upload ISO cert, insurance policy, business license
- AI extracts: issuing body, issue date, expiry date, scope, standard number
- Auto-populates compliance vault fields — zero manual data entry

### 6.2 Discovery AI (Finding the Right Match)

**Semantic Search**
- Natural language queries: _"precision CNC machining, small batch, ISO 9001, ships to EU"_
- pgvector embeddings on catalog items and business profiles
- Results ranked by relevance + trust score + location proximity

**AI Matching**
- When RFQ is posted, AI ranks suppliers by:
  - Catalog relevance (semantic similarity)
  - Capability match
  - Location & delivery region
  - Trust score & ratings
  - Past deal history on the platform
- Notifies top-matched suppliers

**Similar Suppliers**
- Embedding-based similarity across profiles and catalogs
- "5 suppliers with comparable capabilities" on every profile page

### 6.3 Engagement AI (Closing Deals Faster)

**Smart RFQ Generator**
- Describe need in plain text
- AI generates structured RFQ with line items, specs, quantities, delivery terms
- Suggests relevant categories and evaluation criteria

**Quote Comparison Assistant**
- AI summarizes received quotes in plain language
- Highlights key differences (price, lead time, terms, quality indicators)
- Flags outliers (unusually low/high pricing)
- Recommends based on stated priorities

**AI RFQ Auto-Responder (For Suppliers)**
- Supplier uploads past RFP responses, spec sheets, capability docs to their profile
- When a new RFQ matches, AI drafts a quote response pulling from stored data
- Supplier reviews, adjusts pricing, and submits in minutes instead of hours
- Key supplier acquisition hook: "Join NexTrade, never manually fill an RFQ again"

### 6.4 Intelligence AI (Getting Smarter Over Time)

**Supplier Insights**
- AI-generated profile improvement suggestions
- Competitive benchmarking against similar suppliers
- Demand trend analysis relevant to supplier's catalog

**Buyer Risk Monitoring**
- Continuous monitoring of saved suppliers for: expiring certifications, declining review trends, profile inactivity
- AI-generated alternative supplier recommendations when risk is flagged

**Pricing Intelligence**
- Anonymized, aggregated quote data across the network
- Benchmark reports by category, spec, and region
- Requires critical mass of RFQ data — becomes a moat over time

---

## 7. Architecture

Standard layered .NET architecture.

### 7.1 Solution Structure

```
NexTrade/
├── src/
│   ├── NexTrade.Core/                # Domain layer (zero dependencies)
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   └── Enums/
│   │
│   ├── NexTrade.Shared/              # DTOs, MassTransit contracts
│   │
│   ├── NexTrade.Infrastructure/      # EF Core, Services, Repositories
│   │   ├── Data/
│   │   │   └── AppDbContext.cs
│   │   ├── Services/
│   │   ├── Repositories/
│   │   └── DependencyInjection.cs
│   │
│   ├── NexTrade.Api/                 # Controllers, Middleware, SignalR
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Hubs/
│   │   └── Program.cs
│   │
│   ├── NexTrade.Consumers/           # MassTransit consumers
│   ├── NexTrade.AppHost/             # Aspire orchestrator
│   └── NexTrade.ServiceDefaults/     # Aspire shared config
│
├── ui/                               # Next.js frontend
│   ├── src/app/
│   │   ├── (auth)/                   # Login, register
│   │   ├── (app)/                    # Authenticated portal
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── catalog/
│   │   │   ├── discover/
│   │   │   ├── rfq/
│   │   │   ├── suppliers/            # Saved suppliers, lists
│   │   │   ├── messages/
│   │   │   ├── compliance/
│   │   │   ├── intelligence/         # Analytics, insights
│   │   │   └── settings/
│   │   └── (public)/                 # Public business profiles, search
│   ├── src/components/
│   └── src/lib/
│
└── CLAUDE.md
```

### 7.2 Tech Stack

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
| Frontend | Next.js 16, React 19, Tailwind v4, shadcn/ui |
| AI | Claude API (Anthropic SDK) for all AI features |
| Embeddings | pgvector for semantic search |
| Orchestration | Aspire (dev), Docker Compose (prod) |
| API Docs | Scalar |

### 7.3 Patterns

- **TenantEntity** base: `Id (long)`, `Uid (Guid)`, `TenantId`, audit fields
- **ChildEntity** base: no Uid/TenantId — isolated via parent FK
- **PlatformEntity** — shared across tenants (Industry, Country, Currency)
- **BaseEntity** — cross-tenant entities (Review, Conversation, DealConfirmation)
- **Global query filters** on TenantId for data isolation
- **Thin controllers** → scoped services → `ServiceResult<T>`
- **QueryExtensions**: `ToPagedResultAsync`, `CheckDuplicateAsync`, `ResolveRefAsync`
- **DTOs**: `CreateXRequest`, `UpdateXRequest`, `XDto`, `XFilter` (records)
- **Manual DTO mapping** (no AutoMapper)
- **Snake_case DB naming**, UTC datetime conversion, enums as strings
- **ExceptionMiddleware** + **TenantMiddleware**
- **CancellationToken** on all async operations

### 7.4 Key Architectural Difference

In NexTrade, **tenant = business**, and **cross-tenant visibility is the core feature**. This means:

- Discovery/search queries bypass tenant filters (platform-scoped)
- Public profiles are readable by all authenticated users
- RFQs can be visible across tenants
- Reviews and deal confirmations reference cross-tenant relationships
- Saved suppliers link a buyer-tenant to supplier-tenants

This requires a **dual-scope query pattern**:
- **Tenant-scoped**: my catalog, my RFQs, my team, my settings, my compliance vault
- **Platform-scoped**: discovery, public profiles, public RFQs, reviews

### 7.5 S2P Integration

The S2P system and NexTrade share no database or runtime. Integration is via API:

```
S2P Vendor Master ──API──> NexTrade Bulk Profile Import
                           ├── AI Profile Enrichment (background job)
                           ├── Draft Profile Creation
                           └── Supplier Claim Invite (email/SMS)

NexTrade Activity  ──API──> S2P Supplier Records
                           ├── New supplier discovered
                           ├── RFQ awarded
                           └── Trust score / review updates
```

### 7.6 Government Data Pipeline

NexTrade enriches and verifies supplier profiles using legally available government registry data. This is not web scraping — these are public datasets and APIs meant for consumption.

| Source | Data | Use |
|--------|------|-----|
| **MCA** (Ministry of Corporate Affairs) | Company name, directors, incorporation date, registered address, active/struck-off status | Profile verification, enrichment, age calculation |
| **GST Network** (GSTIN lookup) | Business name, address, registration status, filing compliance history | Trust signal: "GST compliant for 36 consecutive months" |
| **DGFT** (Import/Export data) | IEC code, export/import history, product categories, destination countries | Verify export claims, enrich capabilities, trade volume signals |
| **GeM** (Govt e-Marketplace) | Registered sellers, product categories, past government contract history | Trust signal: "Govt-approved vendor" |
| **MSME Udyam Portal** | MSE classification, industry NIC code, investment size, district | Enrich company size, verify MSME status |

**How it integrates:**

```
Government Registries ──batch/API──> NexTrade Data Pipeline
                                     ├── Cross-reference existing profiles
                                     │   └── "GST filing compliant ✓" badge
                                     ├── Pre-build draft profiles for unclaimed businesses
                                     │   └── Name + address + industry + trade history
                                     └── Power the Vendor Due Diligence tool
                                         └── Public, free lookup — buyer acquisition hook
```

**This is the data moat.** TealBook scrapes websites. IndiaMART has self-reported data. NexTrade has government-verified data cross-referenced with first-party supplier input. This combination is extremely hard to replicate.

---

## 8. Data Model

### Core Entities

```
Business (extends Tenant concept)
├── Id, Uid, Name, Subdomain
├── Industry, SubIndustry
├── CompanySize (enum: Micro, Small, Medium, Large, Enterprise)
├── YearEstablished
├── Website, LinkedInUrl
├── IsVerified, VerifiedAt
├── TrustScore (decimal)
├── ProfileSource (enum: SelfRegistered, S2PImport, Claimed)
├── ClaimedAt
├── IsActive
└── Timestamps

BusinessProfile (1:1 with Business/Tenant)
├── Logo, BannerImage
├── About (rich text)
├── HeadquartersAddress (embedded)
├── AdditionalLocations[]
├── Capabilities[] (tags)
├── Certifications[] (tags)
├── SocialLinks (JSON)
├── ResponseRate, AvgResponseTime
├── Embedding (vector) — pgvector for semantic search
└── ProfileCompleteness (computed %)

CatalogItem
├── BusinessId (tenant-scoped)
├── Type (enum: Product, Service)
├── Title, Description, Specifications (JSONB)
├── CategoryId (FK)
├── PricingType (enum: Fixed, Range, ContactForQuote)
├── PriceMin, PriceMax, CurrencyCode
├── MOQ, LeadTimeDays
├── DeliveryRegions[] (tags)
├── Status (enum: Draft, Published, Archived)
├── ViewCount, InquiryCount
├── Embedding (vector) — pgvector for semantic search
└── Timestamps

CatalogCategory
├── Name, Slug
├── ParentCategoryId (self-referencing, hierarchical)
├── Level, SortOrder
└── IsActive

CatalogMedia (child of CatalogItem)
├── CatalogItemId
├── MediaType (enum: Image, Document, Video)
├── Url, FileName, FileSize
├── SortOrder, IsPrimary
└── Timestamps

ComplianceDocument
├── BusinessId (tenant-scoped)
├── Type (enum: BusinessLicense, TaxRegistration, ISOCert, Insurance, AuditReport, Other)
├── Title, Description
├── FileUrl, FileName
├── IssuingBody
├── IssueDate, ExpiryDate
├── Status (enum: Pending, Verified, Rejected, Expired)
├── VerifiedAt, VerifiedBy
├── Visibility (enum: Private, SharedOnRequest, Public)
└── Timestamps

RFQ
├── BusinessId (requester, tenant-scoped)
├── Title, Description
├── Visibility (enum: Public, Targeted)
├── Status (enum: Draft, Open, Closed, Awarded, Cancelled)
├── ResponseDeadline
├── DeliveryLocation, DeliveryTimeline
├── Attachments[]
└── Timestamps

RFQItem (child of RFQ)
├── RFQId
├── Description, Specifications (JSONB)
├── Quantity, UnitOfMeasure
├── CategoryId
└── SortOrder

RFQTarget (child of RFQ, for targeted RFQs)
├── RFQId
├── TargetBusinessUid (cross-tenant ref)
└── SentAt

Quote
├── RFQId
├── BusinessId (responder, tenant-scoped)
├── Status (enum: Draft, Submitted, Revised, Accepted, Rejected, Withdrawn)
├── TotalAmount, CurrencyCode
├── ValidUntil
├── Notes
├── Attachments[]
└── Timestamps

QuoteItem (child of Quote)
├── QuoteId
├── RFQItemId (maps to RFQ line item)
├── UnitPrice, Quantity, TotalPrice
├── LeadTimeDays
├── Notes
└── SortOrder

DealConfirmation (cross-tenant, anchors reviews)
├── RFQId (optional — deal may originate off-platform)
├── QuoteId (optional)
├── BuyerBusinessId, SupplierBusinessId
├── BuyerConfirmed, SupplierConfirmed
├── ConfirmedAt
├── DealValue (optional, for analytics)
├── CurrencyCode
└── Timestamps

Review (cross-tenant)
├── ReviewerBusinessId, ReviewedBusinessId
├── DealConfirmationId (must have mutual confirmation)
├── OverallRating (1-5)
├── QualityRating, CommunicationRating, DeliveryRating, ValueRating
├── Comment
├── IsVerifiedDeal (both parties confirmed)
└── Timestamps

SavedSupplier
├── BuyerBusinessId (tenant-scoped)
├── SupplierBusinessUid (cross-tenant ref)
├── SupplierListId (optional — can be unsorted)
├── Notes
└── Timestamps

SupplierList
├── BusinessId (tenant-scoped)
├── Name (e.g., "CNC vendors - shortlisted")
├── Description
└── Timestamps

SavedSearch
├── BusinessId (tenant-scoped)
├── Name
├── SearchCriteria (JSONB — filters, query text, etc.)
├── NotifyOnNewResults (bool)
├── LastNotifiedAt
└── Timestamps

Conversation (cross-tenant)
├── ParticipantBusinessIds
├── ContextType (enum: General, RFQ)
├── ContextId (polymorphic ref)
└── Timestamps

Message (child of Conversation)
├── ConversationId
├── SenderUserId
├── Content (text)
├── Attachments[]
├── ReadAt
└── Timestamps
```

### Platform Entities (Shared, Not Tenant-Scoped)

```
Industry
├── Name, Slug, ParentId, SortOrder

Country, Currency
├── (seeded reference data)
```

---

## 9. Phased Rollout

### Phase 1 — Identity + Seeding (MVP)

Build the supplier database. Make profiles valuable as a standalone product.

**Features:**
- S2P vendor data import + AI profile enrichment pipeline
- Government registry data pipeline (MCA, GST, DGFT)
- Supplier claim/onboarding flow (warm invite from their customer)
- Business registration for new suppliers (self-service)
- Business profile (public, SEO-indexed)
- Product/service catalog (manual + AI Catalog Builder)
- Compliance vault + AI document parser
- Basic verification workflow
- Semantic search + filters (pgvector)
- Profile Enrichment from website URL
- Vendor Due Diligence tool (public, free)

**Success Metrics:**

| Metric | Target | Why It Matters |
|--------|--------|---------------|
| Draft profiles created | 5,000+ | S2P seeding + govt data pipeline working |
| Claimed profiles | 500-1,000 | Suppliers see enough value to claim |
| Claim rate (invited → claimed) | >30% | Warm invite channel is effective |
| Avg profile completeness | >60% | Data is useful, not ghost profiles |
| Time to published profile | <3 min | Onboarding flow is frictionless |
| Trade association partnerships signed | 2-3 | Bulk onboarding channel established |

### Phase 2 — Discovery + Engagement

Turn the database into a marketplace.

**Features:**
- Saved suppliers, supplier lists, smart alerts
- RFQ creation + quote management
- Shareable RFQ links
- AI Matching (auto-notify top suppliers on new RFQ)
- Smart RFQ Generator (plain text → structured RFQ)
- Quote Comparison Assistant
- AI RFQ Auto-Responder (for suppliers)
- Messaging (SignalR) + WhatsApp sharing
- Team collaboration (invite procurement team)
- Deal Confirmation flow
- Reviews & Trust Score

**Success Metrics:**

| Metric | Target | Why It Matters |
|--------|--------|---------------|
| Monthly active buyers | 50-100 | Demand side exists and is engaged |
| RFQs created per month | 100+ | Real sourcing activity happening |
| Quotes per RFQ (avg) | 3+ | Marketplace has liquidity — suppliers respond |
| Deal confirmation rate | >30% of awarded quotes | Real business is happening off-platform |
| S2P customers with NexTrade enabled | >40% | S2P upsell channel works |
| Team invite multiplier | 3-5x per buyer | Platform spreads within organizations |

### Phase 3 — Intelligence

Build the data moat.

**Features:**
- Supplier analytics dashboard (views, inquiries, competitive positioning)
- Buyer risk alerts (cert expiry, review decline, inactivity)
- Alternative supplier recommendations
- Pricing benchmarks (anonymized, aggregated quote data)
- Demand signals by category and region
- Similar Suppliers recommendations
- Conversational analytics

**Success Metrics:**

| Metric | Target | Why It Matters |
|--------|--------|---------------|
| Claimed profiles (cumulative) | 5,000+ | Network has critical mass |
| Monthly RFQs | 500+ | Enough data for pricing intelligence |
| Supplier return rate (monthly) | >40% | Intelligence features drive retention |
| Buyer return rate (monthly) | >50% | Risk alerts and benchmarks create habit |
| Avg reviews per active business | 2+ | Trust data is accumulating |
| Pricing benchmark coverage | 10+ categories | Intelligence product is viable for monetization |

### Phase 4 — Growth + Monetization

**Features:**
- Premium Verified status (paid AI + human audit)
- Promoted listings
- Buyer Intelligence subscription (pricing benchmarks, risk alerts)
- API data access for enterprise ERP integration
- Trade finance partnerships (invoice factoring)
- Supplier referral program
- Content SEO engine
- Mobile app

**Success Metrics:**

| Metric | Target | Why It Matters |
|--------|--------|---------------|
| Monthly revenue | First $50K MRR | Business model is validated |
| Premium Verified conversion | 5-10% of active suppliers | Suppliers will pay for trust signal |
| Buyer Intelligence subscribers | 20+ enterprise teams | Buyers will pay for data |
| API data customers | 5+ | Enterprise data channel works |
| Organic traffic (SEO) | 10K+ monthly visits | Content + public profiles compound |
| Industry clusters active | 5+ | Platform has horizontal breadth |

---

## 10. Monetization

| Model | Description |
|-------|-------------|
| **Freemium** | Free profile + limited listings. Paid plans for more listings, AI features, analytics |
| **Premium Verified** | AI + human audit, annual fee, highest search ranking. "NexTrade Verified" becomes a recognized trust mark |
| **Buyer Intelligence** | Subscription for pricing benchmarks, risk alerts, demand signals ($X/mo per procurement seat) |
| **API Data Access** | Enterprise subscription to consume verified supplier data into their ERP/S2P |
| **Promoted Listings** | Pay to boost catalog items in search results |
| **Trade Finance** | Invoice factoring / early payment via fintech partnership (referral fee on each transaction) |

---

## 11. Go-To-Market: Solving the Cold Start

NexTrade does not launch cold. It is seeded from the S2P ecosystem and government data.

### Acquisition Channels

#### Supplier Acquisition

| Channel | How It Works | Cost | Expected Volume |
|---------|-------------|------|-----------------|
| **S2P vendor list seeding** | Import vendor masters from S2P enterprise customers. AI-enrich. Send warm invites: _"Your customer [X] uses NexTrade."_ | Near zero | 5,000 draft profiles at launch |
| **Government registry pipeline** | Bulk import from MCA, GST, DGFT. Pre-build draft profiles. Invite businesses to claim. | Data pipeline cost only | 100K+ draftable businesses |
| **Trade association partnerships** | Partner with CII, FICCI, ACMA, IPA, local chambers. Pitch: "We'll digitize your member directory for free." They get a modern searchable portal; we get bulk onboarding. | Relationship-driven, zero cost | 500-5,000 per partnership |
| **Shareable RFQ links** | Every RFQ has a unique URL. Buyers share on WhatsApp/email to suppliers not on NexTrade. Suppliers must claim a profile to respond. | Zero — buyer does the recruiting | Grows with RFQ volume |
| **Trade show onboarding** | Booth at B2B trade shows. QR code → mobile claim flow → profile built from brochure PDF on the spot. | Booth cost ($1-5K per show) | 50-200 per show |
| **Supplier referral program** | "Invite 5 businesses → get Premium Verified free for 3 months." Suppliers know their peers and competitors. | Cost of premium tier | Viral within clusters |
| **Embeddable catalog widget** | Suppliers embed NexTrade catalog on their own website. "Powered by NexTrade" drives inbound traffic from their customers. | Zero | Slow burn, compounds |
| **WhatsApp profile sharing** | Suppliers share NexTrade profile link instead of sending PDFs on WhatsApp. Profile link becomes their digital business card. | Zero | Organic, compounds |
| **Content SEO** | Industry-specific articles: "Top CNC shops in Pune," "How to find a packaging supplier in India." Links to NexTrade profiles. | Content creation cost | Slow burn, 6+ months to compound |

#### Buyer Acquisition

| Channel | How It Works | Cost | Expected Volume |
|---------|-------------|------|-----------------|
| **S2P upsell** | Every S2P customer conversation: "Your vendor list is on NexTrade. Your team can discover 4,800 other suppliers too." Zero CAC — it's a feature of S2P. | Zero | Every S2P customer |
| **Vendor Due Diligence tool** | Free public tool: enter company name or GST → instant due diligence report. Procurement managers use routinely → converts to full platform. | Zero (data pipeline already built) | High volume, low intent initially |
| **Procurement newsletter** | Weekly email: trending RFQ categories, new verified suppliers, pricing benchmarks. Builds buyer audience before they need to source. | Content cost only | Email list compounds |
| **Team invites** | One procurement manager signs up → invites team. Shared lists, shared RFQs, shared notes. One user becomes five. | Zero | 3-5x multiplier per buyer |
| **SEO-indexed profiles + search** | Public access — anyone can browse and search without login. Gate on actions. Google becomes an acquisition channel. | Zero | Grows with profile count |
| **Peer effect** | Procurement manager sees a colleague using NexTrade for sourcing → signs up. | Zero | Organic |

### GTM Phases

#### Phase 1: Seed (Months 1-3)
1. Extract vendor master lists from S2P enterprise customers (~5,000 suppliers)
2. Ingest government registry data (MCA, GST, DGFT) for profile enrichment and due diligence tool
3. AI-enrich thin records into rich draft profiles
4. Send warm invites: _"Your customer [Enterprise X] uses NexTrade. Claim your profile."_
5. White-glove onboarding for first 200 suppliers (run their PDFs through AI Catalog Builder)
6. Target one industry cluster + geography first (e.g., auto components in Pune)
7. Sign 2-3 trade association partnerships for bulk member onboarding

#### Phase 2: Cross-Pollinate (Months 3-6)
8. Open discovery to procurement teams at S2P customers (S2P upsell)
9. Launch Vendor Due Diligence tool publicly (buyer acquisition hook)
10. Supplier A (serves Enterprise X) becomes discoverable by Enterprise Y
11. Enable shareable RFQ links and WhatsApp sharing
12. Every RFQ and quote generates data that improves matching and intelligence

#### Phase 3: Organic Growth (Months 6+)

Built-in growth loops — every feature is an acquisition channel:

| Mechanic | How It Works |
|----------|-------------|
| **SEO-indexed profiles** | Public profiles rank on Google for "[company name] supplier." Inbound organic traffic, zero ad spend. |
| **Shareable RFQ links** | Every RFQ recruits suppliers from outside the network. |
| **Embeddable catalog widget** | Suppliers embed NexTrade catalog on their own website. "Powered by NexTrade." |
| **WhatsApp sharing** | Profile link becomes the supplier's digital business card. |
| **Team invites** | One procurement manager becomes five users. |
| **Peer effect in clusters** | Supplier sees competitor getting inquiries → signs up. Dense clusters create FOMO. |
| **S2P flywheel** | Every new S2P enterprise customer brings their vendor list. Network grows with every sale. |
| **Trade show circuit** | Regular presence at industry trade shows for face-to-face onboarding. |
| **Content SEO** | Industry articles drive long-tail organic traffic to NexTrade profiles and search. |
| **Referral program** | Suppliers invite peers for premium tier benefits. |

13. Expand to adjacent industry clusters
14. Launch supplier referral program
15. Start content SEO engine
16. Regular trade show presence

---

## 12. Pre-Funding Validation

Before raising, de-risk the three biggest unknowns with cheap experiments.

### Validation Experiments

| Experiment | What It Proves | How | Timeline |
|------------|---------------|-----|----------|
| **50-supplier claim pilot** | Suppliers will claim profiles when their customer invites them | Take 50 suppliers from one S2P customer. AI-build profiles. Send warm invites. Measure claim rate, completion rate, time-to-claim. | 2 weeks |
| **5-buyer sourcing test** | Procurement managers will use NexTrade for real sourcing | Get 3-5 S2P procurement managers to create one real RFQ each on the seeded platform. Measure: did they find useful suppliers? Did they get quotes? Was it faster? | 2-3 weeks |
| **Flywheel proof** | S2P → Network → cross-pollination works | Track whether suppliers claimed via Enterprise X get discovered by Enterprise Y. One confirmed cross-pollination = the thesis works. | Runs alongside buyer test |

**Target outcomes before fundraising:**
- Claim rate >30% (15+ out of 50)
- Profile completeness >60% for claimed profiles
- At least 1 real RFQ with 3+ quotes from network suppliers
- At least 1 cross-pollination event (Enterprise Y discovers Enterprise X's supplier)
- 1-2 buyer testimonials: "Found a supplier faster than my current process"

### Demo-Ready Product (Build Before Raising)

Not the full product — just enough to demo with real data:

| Must Have | Why |
|-----------|-----|
| 50-100 claimed supplier profiles with real data | Proves suppliers participate |
| Working semantic search on real profiles | "Type a query, see real results" — the wow moment |
| AI Catalog Builder demo | Upload a PDF, watch it become a listing in 10 seconds |
| Government data cross-reference | "This supplier claims ISO 9001 — GST data confirms active filing" |
| 1-2 real RFQs that generated real quotes | Proves the marketplace works end-to-end |
| Vendor Due Diligence tool | Enter a GST number, get instant report — visceral demo |

This is a 4-6 week build on the existing architecture.

---

## 13. Pre-Funding Revenue

Even small revenue signals de-risk the investment and prove willingness to pay.

| Revenue Play | Price | Expected Revenue | When |
|-------------|-------|-----------------|------|
| **S2P Network Access tier** | $500/mo per S2P customer for "NexTrade Network Access" as a premium S2P feature | Recurring, scales with S2P sales | Month 1 — immediate |
| **Sponsored profile enrichment** | $50/profile, sold to trade associations for bulk member enrichment | $5-25K one-time per partnership | Month 1-2 |
| **Premium Verified** | $200/yr per supplier for verification badge + priority search ranking | $10K ARR from first 50 suppliers | Month 2-3 |
| **Deep due diligence reports** | $20-50/report for detailed supplier analysis (basic report is free) | Per-report, scales with buyer volume | Month 3+ |

**Target: $20K+ ARR before seed round.** This proves the business model is real, not theoretical.

---

## 14. Fundraising Strategy

### Unfair Advantages to Lead With

| Advantage | Why VCs Care |
|-----------|-------------|
| **Existing S2P customers** | Built-in distribution. Zero buyer CAC. Most marketplaces burn $5-50K per enterprise buyer. |
| **5,000 real suppliers** | Not scraped, not cold leads — active commercial relationships. Day-one supply. |
| **Government data pipeline** | Defensible data moat. Legal, verified, hard to replicate. |
| **S2P revenue** | Not asking VCs to fund to zero. NexTrade is a platform expansion, not a greenfield bet. |

### Target Investors

| Type | Why | Examples |
|------|-----|---------|
| **B2B SaaS / procurement VCs** | Understand the space, sales cycles, metrics | Accel India, Nexus Venture Partners, Together Fund |
| **Supply chain / trade-tech** | Thesis-aligned, value the data moat | Tiger Global (B2B bets), Lightspeed India |
| **Strategic angels** | CPOs, procurement leaders, S2P veterans — validate the need, open doors | Ex-SAP Ariba, ex-Coupa, ex-Moglix leadership |
| **Fintech-aligned VCs** | See the trade finance endgame | Elevation Capital, Matrix Partners India |

### Angel Round First

Before the institutional seed, get 3-5 strategic angels ($25-100K each):
- Current or ex-CPOs at large Indian manufacturers — validate buyer need, open doors for pilots
- Founders of adjacent B2B startups (logistics, trade finance, ERP) — warm introductions
- Ex-IndiaMART / Moglix / Udaan leadership — credibility signal, domain expertise

Their value is 10x the money: introductions, credibility, and domain validation.

### The Pitch Narrative

Don't pitch "AI marketplace." Pitch a **platform expansion with built-in distribution:**

> _"We built a Source-to-Pay system used by X enterprise customers managing $Y in procurement spend. Those customers have 5,000 suppliers in their vendor master lists. We're now connecting those suppliers into an AI-powered network — seeded from real commercial relationships, enriched with government-verified data. Every new S2P customer brings their vendors into the network. Every vendor in the network makes our S2P stickier. We're not starting cold — we're activating an existing ecosystem."_

### Pitch Deck Structure (10-12 slides)

1. **Cover** — NexTrade: AI-Powered Supplier Intelligence Platform
2. **Problem** — Finding and vetting suppliers is manual, slow, unreliable. Existing platforms have stale, unverified data.
3. **Solution** — AI-powered supplier network with first-party verified data, seeded from live procurement ecosystem
4. **Why Now** — AI enables enrichment/search/matching at scale. India's manufacturing base going digital. Legacy platforms vulnerable.
5. **How It Works** — Four layers: Identity → Discovery → Engagement → Intelligence
6. **Unfair Advantage** — S2P distribution, 5K supplier base, government data moat (most important slide)
7. **Traction** — Claim rates, active suppliers, RFQs, deal confirmations, buyer testimonials, early revenue
8. **Business Model** — Freemium → Premium Verified → Buyer Intelligence → API → Trade Finance
9. **Market** — TAM/SAM/SOM for Indian B2B procurement
10. **Team** — Engineering leadership, domain expertise, S2P track record
11. **The Ask** — Amount, use of funds (18-month runway), key milestones
12. **Vision** — The Dun & Bradstreet replacement: every B2B transaction in India touches NexTrade's data

### Data Room (Have Ready)

- S2P customer list and revenue
- Supplier claim rate data from validation pilot
- Demo video (2-3 min)
- Financial model (36-month P&L projection)
- Technical architecture overview
- Competitive landscape analysis
- Cap table

### Fundraising Timeline

| Week | Action |
|------|--------|
| 1-2 | Run the 50-supplier claim pilot. Collect claim rate data. |
| 3-4 | Get 3-5 procurement managers to run real RFQs. Collect testimonials. |
| 5-6 | Build demo-ready product (search, catalog builder, due diligence tool with real data). |
| 7 | Pitch deck + data room + financial model ready. |
| 8 | Start with strategic angels. Get 2-3 angel checks + advisor commitments. |
| 9-12 | Institutional seed round. Lead with traction from pilot. |

### Key Risks VCs Will Raise

| Risk | Your Answer |
|------|-------------|
| "It's just a directory" | Show RFQ volume and deal confirmations — real transactions happen through us |
| "S2P customers won't share vendor lists" | Pilot data: X% of S2P customers opted in. Signed LOIs. |
| "No revenue" | $X ARR from Premium Verified + S2P Network Access tier. Clear path to $Y. |
| "Can't compete with TealBook ($50M raised)" | Different market (India), different data (govt-verified, not scraped), different wedge (bottom-up from suppliers, not top-down enterprise sell) |
| "Marketplace economics are brutal" | We don't need paid acquisition. S2P is our distribution. CAC is near zero for both sides. |
| "How do you make real money?" | Short-term: SaaS subscriptions. Long-term: financial services on transaction data (the Ant Financial path). |

---

## 15. UI Design

### Design Philosophy

NexTrade is a **supplier intelligence platform** — the layout prioritizes search, discovery, and fast evaluation over social interaction or deep navigation.

**Key principle:** "Google Maps meets Bloomberg Terminal for suppliers"

### Layout: Top Navigation

NexTrade has few top-level sections and the focus is on **content discovery**, not deep navigation.

```
┌──────────────────────────────────────────────────────────────┐
│  Logo    Discover  Catalog  RFQs  Messages  Suppliers   [👤] │  <- Top nav
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    Content Area                               │
│                    (max-width: 1280px, centered)              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Why top nav over sidebar:**
- Discovery is the core UX — wide content area for business cards, product grids, search results
- Fewer nav items (6-7) — fits in a top bar
- Feels like a platform, not an admin panel
- Public profile pages (shareable URLs) need a clean, non-app layout

### Design System

#### Foundations

| Aspect | NexTrade |
|--------|----------|
| **Layout** | Top navigation |
| **Typography** | Inter (body) + JetBrains Mono (data, codes, specs) |
| **Components** | shadcn/ui (Tailwind v4) |
| **Content width** | 1280px max, wider (1440px) for card grids |
| **Border radius** | Rounded-lg (8px) for cards, rounded-md (6px) for buttons/inputs |
| **Dark mode** | Phase 2+. Phase 1 is light mode only — doubles design effort for zero business impact |
| **Density** | Comfortable (browsing/discovery), compact option for table views |

#### Color Tokens

| Token | Usage | Guidance |
|-------|-------|---------|
| **Primary** | Blue — CTAs, links, active navigation, primary buttons | The dominant action color |
| **Secondary** | Muted/gray — secondary buttons, subtle backgrounds | De-emphasized actions |
| **Destructive** | Red — delete, remove, reject, overdue, expired | Danger and negative states |
| **Success** | Green — verified badge, confirmed, active, compliant | Trust and positive states |
| **Warning** | Amber — expiring soon, needs attention, pending | Time-sensitive alerts |
| **Muted** | Gray — disabled states, placeholder text, borders | Background and structural |
| **Accent** | Teal — AI features, smart suggestions, intelligence insights | Signals "AI is helping here" |

#### Trust Signal Colors

Trust signals are the most important visual system in NexTrade. They must be instantly recognizable:

| Signal | Visual | Where It Appears |
|--------|--------|-----------------|
| **Verified badge** | Green checkmark icon + "Verified" text | Business cards, profile header, search results |
| **Trust Score** | Numeric score (e.g., 4.8) with star fill | Business cards, profile header |
| **Govt data confirmed** | Blue shield icon + "GST Compliant" / "Export Verified" | Profile about section, due diligence reports |
| **Verified Deal** | Green handshake icon on reviews | Review cards |
| **Profile completeness** | Progress bar (gray → blue → green at 80%+) | Dashboard, profile edit view |
| **Response rate** | Percentage with color coding (green >90%, amber 70-90%, red <70%) | Business cards, profile header |

#### Status Colors (Consistent Across All Entities)

| Status | Color | Used On |
|--------|-------|---------|
| Draft | Gray | RFQs, quotes, catalog items |
| Open / Active / Published | Blue | RFQs, catalog items |
| Pending / Submitted | Amber | Quotes, verification, deal confirmations |
| Awarded / Accepted / Verified | Green | RFQs, quotes, compliance docs |
| Closed / Archived | Gray (muted) | RFQs, catalog items |
| Rejected / Cancelled / Expired | Red | Quotes, compliance docs, RFQs |

#### Key Custom Components

Beyond shadcn/ui defaults, these are the NexTrade-specific components that define the platform's identity:

**Business Card** — the most important UI element. Used in discover results, saved suppliers, recommendations, similar suppliers. Contains: logo, name, verified badge, location, industry tags, trust score, review count, response rate, [View] and [Save] actions. Must be scannable in under 2 seconds.

**Product Card** — used in catalog browsing. Contains: primary image, title, price/price range, supplier name (linked), category badge.

**Trust Badge** — reusable green verified badge. Appears on cards, profile headers, and inline in search results. Optionally expandable to show verification details.

**Government Verification Badges** — "GST Compliant," "Export Verified," "MSME Registered." Blue shield icon. Distinct from the platform's own Verified badge.

**RFQ Card** — used in supplier dashboard (opportunities), buyer dashboard (active RFQs). Contains: title, requester name, deadline, line item count, status badge, match score (for AI-matched).

**Profile Completeness Bar** — progress bar with segmented milestones: "Add logo" → "Add about" → "Add catalog" → "Add certifications" → "Get verified." Each step shows the benefit: "Profiles with logos get 2x more views."

**Stat Card** — mini dashboard metric card. Number + trend arrow + percentage change. Used in dashboard header row.

**AI Indicator** — subtle accent-colored tag/icon that marks AI-generated or AI-assisted content. Used on: enriched profile fields, AI catalog listings (before review), AI RFQ drafts, AI quote comparisons. Signals "AI helped here — review before trusting."

### Page Layouts

#### Home / Dashboard — Action-Oriented, Adaptive

The dashboard adapts based on business activity. A business that mostly lists products and responds to RFQs sees a supplier-oriented view. A business that mostly creates RFQs and saves suppliers sees a buyer-oriented view. Businesses doing both see a blended view.

**Supplier-oriented dashboard:**

```
┌──────────────────────────────────────────────────┐
│  Needs Your Attention (3)                         │
│  ┌──────────────────────────────────────────────┐│
│  │ ! RFQ #142 — deadline in 2 days     [Respond]││
│  │ ! ISO 9001 cert expires in 14 days  [Upload] ││
│  │ ! 3 unread messages                 [View]   ││
│  └──────────────────────────────────────────────┘│
│                                                   │
│  Your Performance This Month                      │
│  Profile Views: 142 (+12%)                        │
│  Catalog Views: 384 (+8%)                         │
│  RFQs Received: 7 | Responded: 5 | Won: 2        │
│  Avg Response Time: 4.2 hours                     │
│                                                   │
│  Opportunities (AI-matched RFQs you haven't seen) │
│  [RFQ Card]  [RFQ Card]  [RFQ Card]              │
│                                                   │
│  Profile Completeness: 72%                        │
│  "Add certifications to increase visibility by 2x"│
└──────────────────────────────────────────────────┘
```

**Buyer-oriented dashboard:**

```
┌──────────────────────────────────────────────────┐
│  Needs Your Attention (2)                         │
│  ┌──────────────────────────────────────────────┐│
│  │ ! RFQ #142 — 5 quotes received      [Compare]││
│  │ ! Deal confirmation pending (Acme)  [Confirm] ││
│  └──────────────────────────────────────────────┘│
│                                                   │
│  Your Active RFQs                                 │
│  #142 CNC Parts — 5 quotes, deadline tomorrow     │
│  #138 Packaging — 3 quotes, awarded               │
│                                                   │
│  New Suppliers Matching Your Alerts               │
│  [Business Card] [Business Card]                  │
│                                                   │
│  Risk Alerts                                      │
│  ! Acme Metals ISO 9001 expires in 21 days        │
│  "3 alternative suppliers available"    [View]     │
└──────────────────────────────────────────────────┘
```

#### Discover — The Heart of the App

```
┌──────────────────────────────────────────────────┐
│  +-- Hero Search Bar (large, centered) ---------+│
│  |  "CNC machining, small batch, ISO..."        |│
│  |  AI-powered * Try: "packaging supplier       |│
│  |  near Mumbai with food-grade certs"          |│
│  +----------------------------------------------+│
│                                                   │
│  [Businesses]  [Products]  [Services]  <- Tabs    │
│                                                   │
│  Filters (horizontal):                            │
│  [Industry v] [Location v] [Verified] [Size v]   │
│                                                   │
│  247 results  [Grid] [List]                       │
│                                                   │
│  +-------------+ +-------------+ +-----------+   │
│  | Logo        | | Logo        | | Logo      |   │
│  | Acme Metals | | FastPack Inc| | SteelCo   |   │
│  | Verified    | | 4.8 (23)    | | 4.5       |   │
│  | Mumbai, IN  | | Delhi, IN   | | Pune, IN  |   │
│  | CNC, Sheet..| | Packaging.. | | Steel..   |   │
│  | 4.9 (47)    | | 12 products | | 8 prods   |   │
│  | [View] [Save]| [View] [Save]| [View]     |   │
│  +-------------+ +-------------+ +-----------+   │
│                                                   │
│  3 cols desktop / 2 tablet / 1 mobile             │
└──────────────────────────────────────────────────┘
```

#### Business Profile

```
┌──────────────────────────────────────────────────┐
│  +-- Banner Image -----+--------+---------------+│
│  |                     | Logo   |               |│
│  +---------------------+--------+---------------+│
│                                                   │
│  Acme Metals Pvt. Ltd.   Verified                 │
│  Industrial metals & precision machining           │
│  Mumbai, India * Est. 2008 * 50-200 employees     │
│  4.9 (47 reviews) * 98% response rate             │
│                                                   │
│  [Save]  [Send Message]  [Request Quote]           │
│                                                   │
│  [About] [Products] [Services] [Reviews] [Docs]   │
│                                                   │
│  -- About --                                      │
│  Company description text...                       │
│                                                   │
│  Capabilities: [CNC] [Sheet Metal] [Welding]       │
│  Certifications: [ISO 9001] [ISO 14001]            │
│  Serves: India, SE Asia, Middle East               │
│                                                   │
│  Key Facts           |  Locations                  │
│  Revenue: $5-10M     |  Mumbai (HQ)               │
│  Employees: 120      |  Pune (Factory)             │
│  Founded: 2008       |                             │
│                                                   │
│  -- Products Tab --                                │
│  Product card grid (same as catalog)               │
│                                                   │
│  -- Reviews Tab --                                 │
│  Overall: 4.9                                      │
│  Quality    ========.. 4.8                         │
│  Delivery   =======... 4.7                         │
│  Communication =========. 4.9                      │
│                                                   │
│  "Excellent quality, delivered on time"             │
│  -- FastPack Inc 5/5 * Verified Deal               │
└──────────────────────────────────────────────────┘
```

#### My Catalog — Management View

```
┌──────────────────────────────────────────────────┐
│  My Catalog                     [+ Add] [AI Import]│
│                                                   │
│  [All (42)] [Published (38)] [Draft (3)] [Archived]│
│                                                   │
│  Search...   [Category v] [Type v]                │
│                                                   │
│  Table: Image | Title | Category | Price | Status  │
│  (standard table with sort, pagination)             │
└──────────────────────────────────────────────────┘
```

#### My Suppliers — Saved Suppliers & Lists

```
┌──────────────────────────────────────────────────┐
│  My Suppliers                  [+ New List]        │
│                                                   │
│  [All Saved (84)] [CNC Vendors (12)] [Packaging..] │
│                                                   │
│  Search...   [Industry v] [Verified v]            │
│                                                   │
│  Business card grid (same as discover results)     │
│  with "Remove" and "Move to list" actions          │
└──────────────────────────────────────────────────┘
```

#### Messages — Full-Height Chat

```
┌────────────────┬─────────────────────────────────┐
│  Conversations │  Acme Metals -- RFQ #142         │
│                │                                  │
│  Search        │  Chat messages (scrollable)      │
│                │                                  │
│  * Acme Metals │  Acme: "Hi, 500 units at $12/kg" │
│    RFQ #142    │  You: "Can you do $11 for 1000+?" │
│                │  Acme: "Yes, sending revised..."  │
│  * FastPack    │                                  │
│    General     │  +--------------------+ [Send]   │
│                │  | Type a message...  |          │
│                │  +--------------------+          │
└────────────────┴─────────────────────────────────┘
```

#### RFQ Pages

- **RFQ list** — table with status tabs, filters, pagination
- **RFQ detail** — header + content + sidebar (quotes received, activity timeline)

**Quote Comparison:**

```
┌──────────────────────────────────────────────────┐
│  RFQ #142: CNC Machined Parts         [Back]      │
│  5 quotes received | Deadline: Apr 20              │
├──────────────────────────────────────────────────┤
│  AI Summary                                       │
│  ┌──────────────────────────────────────────────┐│
│  │ "Acme Metals offers the lowest unit price at ││
│  │  $11.50/kg with the fastest lead time (14d). ││
│  │  SteelCo is 20% higher but includes free     ││
│  │  shipping. FastPack's quote is an outlier at  ││
│  │  $8/kg — unusually low, verify capability."   ││
│  └──────────────────────────────────────────────┘│
│                                                   │
│  Side-by-side (scrollable horizontally on mobile) │
│                                                   │
│  Criteria     | Acme Metals | SteelCo  | FastPack │
│  -------------|-------------|----------|----------│
│  Unit Price   | $11.50/kg   | $14/kg   | $8/kg    │
│  Lead Time    | 14 days     | 21 days  | 28 days  │
│  MOQ          | 500 kg      | 200 kg   | 1000 kg  │
│  Shipping     | Extra       | Included | Extra    │
│  Trust Score  | 4.9 (47)    | 4.5 (12) | 3.8 (4)  │
│  Verified     | Yes         | Yes      | No       │
│  Valid Until  | Apr 30      | Apr 25   | May 5    │
│  -------------|-------------|----------|----------│
│               | [Award]     | [Award]  | [Award]  │
│               | [Message]   | [Message]| [Message]│
└──────────────────────────────────────────────────┘
```

#### Onboarding: S2P Claim Flow (Mobile-First)

The most critical UX in the entire product. This is how 5,000 suppliers enter the platform.

```
Step 1: Email/SMS received
┌──────────────────────────────────────┐
│  NexTrade                            │
│                                      │
│  Your customer Tata Motors           │
│  added you to NexTrade.              │
│                                      │
│  We built your business profile      │
│  using public information.           │
│  Review and claim it now.            │
│                                      │
│  [Claim Your Profile]                │
│                                      │
│  Preview: nextrade.io/acme-metals    │
└──────────────────────────────────────┘

Step 2: Review AI-generated profile (no login yet)
┌──────────────────────────────────────┐
│  Your NexTrade Profile               │
│                                      │
│  Acme Metals Pvt. Ltd.              │
│  Industrial metals & machining       │
│  Mumbai, India                       │
│                                      │
│  About: [AI-generated text........]  │
│  Industry: Manufacturing > Metals    │
│  Employees: 50-200                   │
│  Website: acmemetals.in              │
│                                      │
│  "Does this look right?"             │
│                                      │
│  [Yes, Claim This Profile]           │
│  [Edit Before Claiming]              │
└──────────────────────────────────────┘

Step 3: Set credentials (minimal)
┌──────────────────────────────────────┐
│  Almost done!                        │
│                                      │
│  Email: [pre-filled from invite]     │
│  Password: [............]            │
│                                      │
│  [Claim & Publish Profile]           │
│                                      │
│  By claiming, you agree to           │
│  Terms of Service                    │
└──────────────────────────────────────┘

Step 4: Profile claimed — next steps
┌──────────────────────────────────────┐
│  Profile Live!                       │
│                                      │
│  Your profile is now visible to      │
│  buyers on NexTrade.                 │
│                                      │
│  Complete your profile to get        │
│  3x more inquiries:                  │
│                                      │
│  [ ] Add your logo          +15%     │
│  [ ] Upload catalog (PDF)   +40%     │
│  [ ] Add certifications     +25%     │
│  [ ] Upload compliance docs +20%     │
│                                      │
│  [Upload Catalog PDF]                │
│  [I'll do this later]                │
└──────────────────────────────────────┘
```

#### Onboarding: Self-Registration Flow

```
Step 1: Sign up
┌──────────────────────────────────────┐
│  Create your business profile        │
│                                      │
│  Company Name: [................]    │
│  Industry:     [Select v]            │
│  Location:     [City, Country]       │
│  Email:        [................]    │
│  Password:     [................]    │
│                                      │
│  [Continue]                          │
│                                      │
│  Already have an account? Sign in    │
└──────────────────────────────────────┘

Step 2: AI enrichment (automatic)
┌──────────────────────────────────────┐
│  Let's build your profile            │
│                                      │
│  Paste your website URL and we'll    │
│  fill in the rest automatically:     │
│                                      │
│  [https://acmemetals.in         ]    │
│                                      │
│  [Build My Profile]                  │
│  [Skip — I'll fill manually]         │
│                                      │
│  (loading: "Reading your website...  │
│   Extracting company details...      │
│   Building profile...")              │
└──────────────────────────────────────┘

Step 3: Review AI-generated profile
┌──────────────────────────────────────┐
│  Review your profile                 │
│                                      │
│  (Same as claim flow Step 2 —        │
│   AI-populated fields with edit      │
│   capability on each field)          │
│                                      │
│  [Publish Profile]                   │
└──────────────────────────────────────┘

Step 4: Post-publish (same as claim Step 4)
  Upload catalog → completeness checklist
```

#### Vendor Due Diligence Tool (Public)

```
┌──────────────────────────────────────────────────┐
│  NexTrade  [Sign In]                              │
│                                                   │
│  Vendor Due Diligence                             │
│  Instant supplier verification — free.            │
│                                                   │
│  [Enter company name or GST number      ] [Check] │
├──────────────────────────────────────────────────┤
│                                                   │
│  Acme Metals Pvt. Ltd.                            │
│  GSTIN: 27AABCU9603R1ZX                           │
│                                                   │
│  Registration     Active since 2008    [green]    │
│  GST Compliance   Filed 36/36 months   [green]    │
│  MSME Status      Medium Enterprise    [blue]     │
│  Export History   847 shipments (DGFT)  [blue]    │
│  MCA Status       Active, no flags     [green]    │
│                                                   │
│  On NexTrade?     Yes — Verified Profile          │
│  Trust Score      4.9 (47 reviews)                │
│  Certifications   ISO 9001, ISO 14001             │
│  Response Rate    98%                             │
│                                                   │
│  [View Full Profile]  [Request Quote]  [Message]  │
│  (Sign in required for actions)                   │
│                                                   │
│  Want a detailed report with financial analysis?  │
│  [Get Deep Report — $30]                          │
└──────────────────────────────────────────────────┘
```

#### Compliance Vault

```
┌──────────────────────────────────────────────────┐
│  Compliance Vault                   [+ Upload]    │
│                                                   │
│  [All (12)] [Valid (8)] [Expiring (2)] [Expired]  │
│                                                   │
│  ! 2 documents expiring within 30 days            │
│                                                   │
│  ISO 9001:2015                                    │
│  Bureau Veritas | Expires: May 15, 2026 | [green] │
│  Visibility: Public                               │
│                                                   │
│  ISO 14001:2015                                   │
│  TUV SUD | Expires: Apr 28, 2026 | [amber]       │
│  "Expiring in 15 days" | Visibility: Public       │
│                                                   │
│  General Liability Insurance                      │
│  ICICI Lombard | Expires: Mar 2, 2026 | [red]     │
│  "Expired 42 days ago" | Visibility: Private      │
│                                                   │
│  (Each row expandable to show full details,       │
│   download, change visibility, re-upload)         │
└──────────────────────────────────────────────────┘
```

### Empty States

Empty states guide new users to their first action. Every empty state must answer: "What is this page for?" and "What should I do next?"

| Page | Empty State Message | CTA |
|------|-------------------|-----|
| **Dashboard (new supplier)** | "Welcome! Your profile is live but empty. Complete it to start getting discovered by buyers." | [Complete Your Profile] |
| **Dashboard (new buyer)** | "Welcome! Start by finding suppliers or creating your first RFQ." | [Search Suppliers] [Create RFQ] |
| **My Catalog** | "Your catalog is empty. Add products and services to get discovered. Upload a PDF and our AI will do the rest." | [+ Add Product] [AI Import from PDF] |
| **My Suppliers** | "You haven't saved any suppliers yet. Discover suppliers that match your needs." | [Search Suppliers] |
| **RFQs (buyer)** | "No RFQs yet. Describe what you need and we'll find the right suppliers." | [Create Your First RFQ] |
| **RFQs (supplier)** | "No RFQ invitations yet. Complete your profile and catalog to start getting matched." | [Complete Profile] |
| **Messages** | "No conversations yet. Messages will appear here when you reach out to a supplier or respond to an RFQ." | [Discover Suppliers] |
| **Compliance Vault** | "No documents uploaded. Store your certifications here — share them with buyers and get notified before they expire." | [Upload Document] |
| **Intelligence** | "Not enough data yet. Intelligence insights will appear as your profile gets views and you engage with RFQs." | — |

### Notifications & Email System

#### Notification Triggers

| Event | In-App | Email | WhatsApp (opt-in) | Timing |
|-------|--------|-------|-------------------|--------|
| **Claim invite** (S2P seeded) | — | Yes | Yes | Immediately when profile is created |
| **Claim reminder** | — | Yes | — | Day 3, Day 7 if unclaimed |
| **New RFQ matches your catalog** | Yes | Yes | Yes | Within minutes of RFQ creation |
| **RFQ deadline approaching** | Yes | Yes | — | 48h and 24h before deadline |
| **New quote received on your RFQ** | Yes | Yes | Yes | Immediately |
| **Quote accepted / rejected** | Yes | Yes | Yes | Immediately |
| **Deal confirmation request** | Yes | Yes | — | After quote is awarded |
| **New review received** | Yes | Yes | — | Immediately |
| **New message** | Yes | Yes | — | Immediately (batched if multiple) |
| **Cert expiring** | Yes | Yes | — | 30, 14, 7 days before expiry |
| **Profile view milestone** | Yes | — | — | At 10, 50, 100, 500 views |
| **Smart alert match** | Yes | Yes | — | Daily digest, not per-match |
| **Team invite** | — | Yes | — | Immediately |
| **Profile completeness nudge** | Yes | Email | — | Day 1, Day 7 if <60% complete |

#### Notification Design Principles

- **Frequency cap**: Max 3 emails/day per user. Batch low-priority notifications into daily digest.
- **Unsubscribe**: Per-category unsubscribe in settings. One-click unsubscribe in every email.
- **WhatsApp**: Uses WhatsApp Business API with pre-approved template messages. Opt-in only. Reserved for high-value events (RFQ match, new quote, claim invite).
- **In-app notification center**: Bell icon in top nav. Grouped by type. Mark all as read. Link directly to the relevant page.

### Admin Panel (Internal)

Not a user-facing feature. Internal tool for NexTrade operations team.

**Capabilities:**
- **Verification queue** — review uploaded business documents, approve/reject verified badge
- **Review moderation** — handle flagged/reported reviews
- **Profile moderation** — handle reported profiles, spam detection
- **Government data pipeline monitoring** — data freshness, import errors, reconciliation
- **S2P import management** — trigger bulk imports, monitor claim rates per enterprise customer
- **Platform analytics** — total profiles, claim rates, RFQ volume, engagement metrics, revenue
- **User management** — support tickets, account issues, password resets

**Phase 1 scope:** Verification queue + profile moderation + basic analytics. Everything else can be manual/SQL initially.

### Security & Compliance

| Area | Approach |
|------|----------|
| **Data storage** | PostgreSQL on Azure (India region for data residency) |
| **Encryption** | TLS 1.3 in transit, AES-256 at rest |
| **Authentication** | ASP.NET Core Identity + JWT, bcrypt password hashing |
| **Authorization** | Role-based (Admin, Catalog Manager, Sales, Procurement) + tenant isolation via global query filters |
| **Compliance documents** | Stored in Azure Blob Storage with signed URLs (not publicly accessible) |
| **PII handling** | Contact details visible only to logged-in users. Public profiles show company info, not personal info. |
| **API security** | Rate limiting, JWT auth, tenant-scoped access |
| **SOC2** | Target for Phase 3 — required before enterprise pilots scale |
| **GDPR/DPDPA** | Data deletion on request, consent tracking, export capability |
| **Audit trail** | All profile changes, document uploads, and verification decisions logged |

### Mobile-First Priorities

Indian SME business owners live on their phones. The first interaction (claim invite email → claim profile) will happen on mobile. Design mobile-first for these critical flows:

1. **S2P claim flow** — the entire claim experience must work perfectly on mobile. One-tap from email/SMS → review profile → confirm → done.
2. **Messaging and notifications** — RFQ notifications, quote alerts, chat. These are inherently mobile interactions.
3. **Profile viewing** — buyers browse supplier profiles on the go.
4. **WhatsApp sharing** — share profile links, RFQ links directly from mobile.

Desktop-first for these (complex, multi-element UIs):
- RFQ creation with line items and attachments
- Quote comparison (side-by-side)
- Catalog management
- Analytics dashboards

Responsive is not enough for critical mobile flows — they need dedicated mobile UX consideration.

### Public Access Strategy

NexTrade has two audiences: logged-in users and the public web. This drives SEO, lowers buyer acquisition cost, and makes supplier profiles valuable as standalone microsites.

| Content | Public (no login) | Logged in |
|---------|-------------------|-----------|
| Business profiles | Full view | Full view + Save, Message, RFQ |
| Product/service listings | Full view | Full view + Inquire |
| Search & discovery | Browse + search | Browse + search + filters + alerts |
| Reviews | Read only | Read + write (with deal confirmation) |
| RFQ details (shareable link) | View RFQ specs | View + respond with quote |
| Messaging | Not available | Full access |
| Analytics / intelligence | Not available | Full access |

### UI Differentiators

1. **AI search bar as hero** — prominent on Discover page, not hidden in a corner
2. **Business cards, not table rows** — discovery is visual with logos, ratings, verified badges
3. **Trust signals everywhere** — verified badge, trust score, response rate visible on every card
4. **Public shareable profiles** — SEO-friendly URLs, viewable without login
5. **Save, don't connect** — buyers organize suppliers into lists, not social connections
6. **AI woven in naturally** — catalog builder, smart search, quote comparison, RFQ auto-responder are inline features, not separate AI pages
7. **Adaptive dashboard** — supplier-oriented or buyer-oriented based on business activity
8. **Shareable everything** — profile links, RFQ links, catalog widgets designed for WhatsApp/email sharing
9. **Mobile-first claim flow** — S2P invite → claimed profile in under 2 minutes on a phone
