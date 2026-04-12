# SupplierNet — Product Requirements Document

> **Status:** Draft
> **Date:** 2026-04-12
> **Relationship to ProcNext:** Standalone add-on portal. Sold alongside S2P system with separate login. No integration with ProcNext in Phase 1.

---

## 1. Vision

A new-age, AI-native B2B platform — **LinkedIn for businesses**. Companies register, build verified profiles, list products and services, discover partners, request quotes, and transact. Every business is a peer — no buyer/supplier distinction.

**Tagline idea:** _"Where businesses find each other."_

---

## 2. Market Gap

| Existing Platform | Limitation |
|-------------------|-----------|
| Alibaba.com | China-centric, spam-heavy, no trust layer |
| IndiaMART | Outdated UX, lead-gen spam, no AI |
| ThomasNet | Directory only, no transactions, legacy |
| SAP Ariba Network | Locked to SAP, expensive, buyer-centric |
| Coupa Supplier Network | Suppliers are second-class, onboarding tool not a network |
| Amazon Business | Commodity products only, no services, no relationships |
| Kompass / GlobalSources | Pure directories, no interaction |

**What's missing:** A modern, AI-powered, trust-first B2B network where every business is equal — can promote itself, discover others, get verified, and transact.

---

## 3. Core Concepts

- **Business** — the central entity. Every registered company is a Business. No buyer/supplier role selection.
- **Catalog** — products and services a business offers.
- **Discovery** — AI-powered search to find businesses, products, and services.
- **RFQ** — structured way to request and compare quotes.
- **Connections** — business-to-business relationships (follow, preferred partner).
- **Verified Badge** — trust signal earned through document verification.
- **Trust Score** — composite score from reviews, verification, activity, response rate.

---

## 4. Features

### 4.1 Onboarding & Identity

- Business registration (company name, industry, location, size)
- Email verification + admin user setup
- Invite team members with roles (Admin, Catalog Manager, Sales, Procurement)
- Business verification workflow:
  - Upload business license, tax registration, incorporation docs
  - Admin review → **Verified** badge
  - Re-verification on expiry

### 4.2 Business Profile (Public)

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

### 4.3 Product & Service Catalog

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

### 4.4 Discovery & Search

- Browse by category, industry, location
- Filter: verified only, rating, company size, certifications, delivery region
- Semantic search (natural language queries via pgvector)
- "Similar businesses" recommendations
- "Businesses you might need" based on your industry
- Saved searches with alerts
- Trending products/services
- Featured / promoted listings (future monetization)

### 4.5 RFQ (Request for Quote)

- Create RFQ:
  - Title, description, line items with specs
  - Quantity, delivery location, timeline
  - Attachments (drawings, specs docs)
  - Visibility: public (all businesses) or targeted (selected businesses)
- Receive and compare quotes:
  - Side-by-side comparison view
  - AI-generated comparison summary
- Negotiate via threaded messages per quote
- Award quote → triggers order creation
- RFQ analytics (responses received, avg response time)

### 4.6 Orders & Invoicing

- Order created from awarded quote
- Order lifecycle: Created → Confirmed → In Progress → Shipped → Delivered → Completed
- Invoice generation and tracking
- Basic payment status tracking (Paid / Unpaid / Overdue)
- Order history and reordering

### 4.7 Connections & Network

- Follow a business (one-way, like LinkedIn)
- Connection request (two-way, mutual)
- Preferred Partner tag (manual designation)
- Connection feed — updates from connected businesses (new products, profile updates)
- Network analytics (profile views, connection growth)

### 4.8 Reviews & Trust

- Post-transaction reviews (1-5 stars + text)
- Review categories: Quality, Communication, Delivery, Value
- Trust Score algorithm:
  - Verification status (weighted heavily)
  - Average review rating
  - Response rate & speed
  - Profile completeness
  - Account age & activity
- Report/flag inappropriate reviews

### 4.9 Compliance Vault

- Upload compliance documents (ISO certs, insurance, audit reports, licenses)
- Document metadata: type, issue date, expiry date, issuing body
- Auto-expiry tracking with email notifications (30/14/7 days before)
- Share documents with connections (controlled visibility)
- AI document verification (extract details, validate format)

### 4.10 Messaging

- Threaded conversations (general, per-RFQ, per-order)
- Real-time via SignalR
- File attachments
- Read receipts
- Notification preferences (email, in-app)

---

## 5. AI Features

### 5.1 AI Catalog Builder
- Upload a PDF brochure, datasheet, or product sheet
- Claude extracts: product name, description, specs, pricing, images
- Generates structured catalog listings for review and publish
- Supports batch processing (multi-page catalogs)

### 5.2 Semantic Search
- Natural language queries: _"precision CNC machining, small batch, ISO 9001, ships to EU"_
- pgvector embeddings on catalog items and business profiles
- Results ranked by relevance + trust score + location proximity

### 5.3 Smart RFQ Generator
- Describe need in plain text
- AI generates structured RFQ with line items, specs, quantities, delivery terms
- Suggests relevant categories and evaluation criteria

### 5.4 AI Matching
- When RFQ is posted, AI ranks businesses by:
  - Catalog relevance (semantic similarity)
  - Capability match
  - Location & delivery region
  - Trust score & ratings
  - Past transaction history
- Notifies top-matched businesses

### 5.5 Quote Comparison Assistant
- AI summarizes received quotes in plain language
- Highlights key differences (price, lead time, terms, quality indicators)
- Flags outliers (unusually low/high pricing)
- Recommends based on stated priorities

### 5.6 Profile Enrichment
- Enter website URL → AI scrapes and structures:
  - Company description, industry, capabilities
  - Product/service categories
  - Locations, certifications mentioned
- Business reviews and edits before publishing

### 5.7 Risk & Compliance Signals
- Monitor connected businesses for:
  - Expiring certifications
  - Declining review trends
  - Profile inactivity
- Alerts dashboard for procurement teams

### 5.8 Conversational Analytics
- Natural language queries on your own data:
  - _"Which of my products gets the most inquiries?"_
  - _"Show me all RFQs I haven't responded to this week"_
  - _"What's my average response time this month?"_

---

## 6. Architecture

Mirrors ProcNext patterns exactly.

### 6.1 Solution Structure

```
SupplierNet/
├── src/
│   ├── SupplierNet.Core/                # Domain layer (zero dependencies)
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   └── Enums/
│   │
│   ├── SupplierNet.Shared/              # DTOs, MassTransit contracts
│   │
│   ├── SupplierNet.Infrastructure/      # EF Core, Services, Repositories
│   │   ├── Data/
│   │   │   └── AppDbContext.cs
│   │   ├── Services/
│   │   ├── Repositories/
│   │   └── DependencyInjection.cs
│   │
│   ├── SupplierNet.Api/                 # Controllers, Middleware, SignalR
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Hubs/
│   │   └── Program.cs
│   │
│   ├── SupplierNet.Consumers/           # MassTransit consumers
│   ├── SupplierNet.AppHost/             # Aspire orchestrator
│   └── SupplierNet.ServiceDefaults/     # Aspire shared config
│
├── ui/                                  # Next.js frontend
│   ├── src/app/
│   │   ├── (auth)/                      # Login, register
│   │   ├── (app)/                       # Authenticated portal
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── catalog/
│   │   │   ├── discover/
│   │   │   ├── rfq/
│   │   │   ├── orders/
│   │   │   ├── connections/
│   │   │   ├── messages/
│   │   │   ├── compliance/
│   │   │   └── settings/
│   │   └── (public)/                    # Public business profiles, search
│   ├── src/components/
│   └── src/lib/
│
├── ai/                                  # Python AI service
│   ├── agents/
│   │   ├── catalog_builder/
│   │   ├── matching/
│   │   ├── rfq_generator/
│   │   └── analytics/
│   └── core/
│
└── CLAUDE.md
```

### 6.2 Tech Stack

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
| AI Agents | Python + FastAPI + LangGraph (if needed) |
| Embeddings | pgvector for semantic search |
| Orchestration | Aspire (dev), Docker Compose (prod) |

### 6.3 Patterns (Same as ProcNext)

- **TenantEntity** base: `Id (long)`, `Uid (Guid)`, `TenantId`, audit fields
- **ChildEntity** base: no Uid/TenantId — isolated via parent FK
- **Global query filters** on TenantId for data isolation
- **Thin controllers** → scoped services → `ServiceResult<T>`
- **QueryExtensions**: `ToPagedResultAsync`, `CheckDuplicateAsync`, `ResolveRefAsync`
- **DTOs**: `CreateXRequest`, `UpdateXRequest`, `XDto`, `XFilter` (records)
- **Manual DTO mapping** (no AutoMapper)
- **Snake_case DB naming**, UTC datetime conversion, enums as strings
- **ExceptionMiddleware** + **TenantMiddleware**
- **CancellationToken** on all async operations

### 6.4 Key Architectural Difference

In ProcNext, tenant = buying organization, and other businesses are master data (Supplier entity).

In SupplierNet, **tenant = business**, and **cross-tenant visibility is the core feature**. This means:

- Discovery/search queries bypass tenant filters (platform-scoped)
- Public profiles are readable by all authenticated users
- RFQs can be visible across tenants
- Connections link two tenants together
- Reviews reference cross-tenant transactions

This requires a **dual-scope query pattern**:
- **Tenant-scoped**: my catalog, my orders, my team, my settings
- **Platform-scoped**: discovery, public profiles, public RFQs, reviews

---

## 7. Data Model

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
└── ResponseRate, AvgResponseTime

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
├── Embedding (vector)  — pgvector for semantic search
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

Order
├── QuoteId (origin)
├── BuyerBusinessId, SellerBusinessId (cross-tenant)
├── OrderNumber (auto-generated)
├── Status (enum: Created, Confirmed, InProgress, Shipped, Delivered, Completed, Cancelled)
├── TotalAmount, CurrencyCode
├── ShippingAddress
├── ExpectedDeliveryDate
└── Timestamps

OrderItem (child of Order)
├── OrderId
├── Description, Specifications
├── Quantity, UnitPrice, TotalPrice
└── SortOrder

Invoice (child of Order)
├── OrderId
├── InvoiceNumber
├── Amount, CurrencyCode
├── Status (enum: Pending, Paid, Overdue, Cancelled)
├── DueDate, PaidAt
└── Timestamps

Connection
├── RequesterBusinessId, TargetBusinessId (cross-tenant)
├── Type (enum: Follow, ConnectionRequest, Connected)
├── IsPreferredPartner
├── Status (enum: Pending, Accepted, Rejected)
└── Timestamps

Review
├── ReviewerBusinessId, ReviewedBusinessId (cross-tenant)
├── OrderId (must have completed transaction)
├── OverallRating (1-5)
├── QualityRating, CommunicationRating, DeliveryRating, ValueRating
├── Comment
├── IsVerifiedPurchase
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
├── Visibility (enum: Private, ConnectionsOnly, Public)
└── Timestamps

Conversation
├── ParticipantBusinessIds (cross-tenant)
├── ContextType (enum: General, RFQ, Order)
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
├── (Same as ProcNext — seeded reference data)
```

---

## 8. Phased Rollout

### Phase 1 — Foundation (MVP)
- Business registration & profile
- Product/service catalog (manual entry)
- Basic search & discovery (filters + full-text)
- Business verification workflow
- Connections (follow + connect)

### Phase 2 — Transactions
- RFQ creation & quote management
- Order lifecycle
- Invoicing
- Reviews & trust score
- Messaging (SignalR)

### Phase 3 — AI Layer
- AI Catalog Builder (PDF → listings)
- Semantic search (pgvector)
- Smart RFQ Generator
- AI Matching
- Quote Comparison Assistant
- Profile Enrichment

### Phase 4 — Growth
- Compliance vault with expiry tracking
- Conversational analytics
- Risk signals
- Promoted listings / premium plans
- API for third-party integrations
- Mobile app

---

## 9. Monetization (Future)

| Model | Description |
|-------|-------------|
| **Freemium** | Free profile + limited listings. Paid plans for more listings, AI features, analytics |
| **Promoted Listings** | Pay to boost catalog items in search results |
| **Verified Badge** | Free basic verification, premium expedited verification |
| **Transaction Fee** | Small % on orders processed through platform |
| **Premium Plans** | Unlimited listings, advanced AI, priority support, API access |

---

## 10. Naming Candidates

| Name | Notes |
|------|-------|
| **NexTrade** | Next-gen trade network. Clean, modern |
| **ProcNet** | Brand continuity with ProcNext |
| **TradeForge** | Building trade relationships |
| **BizNex** | Business + Nexus |
| **Nexura** | Next + secure/trust |

_Decision pending._

---

## 11. UI Design

### Design Philosophy

ProcNext is an **internal enterprise tool** — sidebar-heavy, data-dense, task-oriented. SupplierNet is a **network/marketplace** — outward-facing, social, and discoverable. Reuse ProcNext's design system (colors, components, typography) but change the layout paradigm.

**Key principle:** "Notion meets LinkedIn for B2B"

### Layout: Top Navigation (Not Sidebar)

ProcNext uses a left sidebar for 20+ deep workflow nav items. SupplierNet has fewer sections and the focus is on **content discovery**, not deep navigation.

```
┌─────────────────────────────────────────────────────────────┐
│  Logo    Discover  Catalog  RFQs  Messages  Network    [👤] │  ← Top nav
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Content Area                              │
│                    (max-width: 1280px, centered)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Why top nav over sidebar:**
- Discovery is the core UX — wide content area for business cards, product grids, search results
- Fewer nav items (6-7 vs ProcNext's 20+) — fits in a top bar
- Feels like a platform, not an admin panel
- Public profile pages (shareable URLs) need a clean, non-app layout

### Design System: Inherit from ProcNext, Adapt for Network

| Aspect | ProcNext | SupplierNet |
|--------|----------|-------------|
| **Layout** | Left sidebar | Top navigation |
| **Primary color** | Accent system (blue default) | Same — reuse accent picker |
| **Typography** | Inter + JetBrains Mono | Same |
| **Components** | shadcn/ui | Same library, same variants |
| **Cards** | Data cards (KPIs, stats) | Business cards, product cards (visual, image-heavy) |
| **Tables** | Heavy use everywhere | Only for management views (my catalog, my orders) |
| **Dark mode** | Yes | Yes, same CSS variables |
| **Content width** | 1200px max | 1280px max (wider for card grids) |
| **Public pages** | None (all auth'd) | Yes — profiles, product pages, search |
| **Density** | Compact (enterprise) | Comfortable (browsing/discovery) |

### Page Layouts

#### Home / Dashboard — Activity Feed (Not KPI Dashboard)

```
┌──────────────────────────────────────────────────┐
│  Quick Actions Bar                                │
│  [+ Add Product]  [Create RFQ]  [🔍 Search]      │
├──────────────────────────────────────────────────┤
│  Your Stats (4 mini cards, horizontal)            │
│  Profile Views │ Catalog Views │ Open RFQs │ Quotes│
│  142 ↑12%      │ 38 ↑5%       │ 3 active  │ 7 new │
├──────────────────────────────────────────────────┤
│  Activity Feed                                    │
│  • Acme Corp viewed your profile          2h ago  │
│  • New quote received on RFQ #142         3h ago  │
│  • TechParts Inc started following you    5h ago  │
│  • Your ISO 9001 cert expires in 14 days          │
├──────────────────────────────────────────────────┤
│  Recommended For You (AI)                         │
│  [Business Card] [Business Card] [Business Card]  │
│  Acme Metals      FastPack Inc    SteelWorks Ltd  │
└──────────────────────────────────────────────────┘
```

#### Discover — The Heart of the App

```
┌──────────────────────────────────────────────────┐
│  ┌─ Hero Search Bar (large, centered) ─────────┐ │
│  │  🔍 "CNC machining, small batch, ISO..."    │ │
│  │  AI-powered • Try: "packaging supplier       │ │
│  │  near Mumbai with food-grade certs"          │ │
│  └──────────────────────────────────────────────┘ │
│                                                   │
│  [Businesses]  [Products]  [Services]  ← Tabs     │
│                                                   │
│  Filters (horizontal):                            │
│  [Industry ▾] [Location ▾] [✓ Verified] [Size ▾] │
│                                                   │
│  247 results  [Grid ▦] [List ☰]                   │
│                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │
│  │  Logo         │ │  Logo         │ │  Logo      │ │
│  │  Acme Metals  │ │  FastPack Inc │ │  SteelCo  │ │
│  │  ✓ Verified   │ │  ★ 4.8 (23)  │ │  ★ 4.5    │ │
│  │  Mumbai, IN   │ │  Delhi, IN   │ │  Pune, IN │ │
│  │  CNC, Sheet.. │ │  Packaging.. │ │  Steel..  │ │
│  │  ★ 4.9 (47)  │ │  12 products │ │  8 prods  │ │
│  │  [View] [Connect]│ [View] [Connect]│ [View]  │ │
│  └──────────────┘ └──────────────┘ └───────────┘ │
│                                                   │
│  3 cols desktop / 2 tablet / 1 mobile             │
└──────────────────────────────────────────────────┘
```

#### Business Profile — The LinkedIn Company Page

```
┌──────────────────────────────────────────────────┐
│  ┌─ Banner Image ──────────────────────────────┐ │
│  │                  ┌──────┐                    │ │
│  │                  │ Logo │                    │ │
│  └──────────────────┴──────┴───────────────────┘ │
│                                                   │
│  Acme Metals Pvt. Ltd.   ✓ Verified               │
│  Industrial metals & precision machining           │
│  📍 Mumbai, India • Est. 2008 • 50-200 employees  │
│  ★ 4.9 (47 reviews) • 98% response rate           │
│                                                   │
│  [Connect]  [Send Message]  [Request Quote]        │
│                                                   │
│  [About] [Products] [Services] [Reviews] [Docs]   │
│                                                   │
│  ── About ──                                      │
│  Company description text...                       │
│                                                   │
│  Capabilities: [CNC] [Sheet Metal] [Welding]       │
│  Certifications: [ISO 9001] [ISO 14001]            │
│  Serves: India, SE Asia, Middle East               │
│                                                   │
│  Key Facts           │  Locations                  │
│  Revenue: $5-10M     │  Mumbai (HQ)               │
│  Employees: 120      │  Pune (Factory)             │
│  Founded: 2008       │                             │
│                                                   │
│  ── Products Tab ──                                │
│  Product card grid (same as catalog)               │
│                                                   │
│  ── Reviews Tab ──                                 │
│  Overall: ★ 4.9                                    │
│  Quality    ████████░░ 4.8                         │
│  Delivery   ███████░░░ 4.7                         │
│  Communication █████████░ 4.9                      │
│                                                   │
│  "Excellent quality, delivered on time"             │
│  — FastPack Inc ★★★★★ • ✓ Verified Purchase       │
└──────────────────────────────────────────────────┘
```

#### My Catalog — Management View (Uses ProcNext Table Pattern)

```
┌──────────────────────────────────────────────────┐
│  My Catalog                     [+ Add] [AI Import]│
│                                                   │
│  [All (42)] [Published (38)] [Draft (3)] [Archived]│
│                                                   │
│  🔍 Search...   [Category ▾] [Type ▾]             │
│                                                   │
│  Table: Image | Title | Category | Price | Status  │
│  (standard ProcNext table with sort, pagination)   │
└──────────────────────────────────────────────────┘
```

#### Messages — Full-Height Chat (LinkedIn Style)

```
┌────────────────┬─────────────────────────────────┐
│  Conversations │  Acme Metals – RFQ #142          │
│                │                                  │
│  🔍 Search     │  Chat messages (scrollable)      │
│                │                                  │
│  ● Acme Metals │  Acme: "Hi, 500 units at $12/kg" │
│    RFQ #142    │  You: "Can you do $11 for 1000+?" │
│                │  Acme: "Yes, sending revised..."  │
│  ○ FastPack    │                                  │
│    General     │  ┌────────────────────┐ [Send]   │
│                │  │ Type a message...  │          │
│                │  └────────────────────┘          │
└────────────────┴─────────────────────────────────┘
```

#### RFQ Pages

- **RFQ list** — ProcNext table pattern with status tabs, filters, pagination
- **RFQ detail** — ProcNext transaction detail pattern: header + content + sidebar (quotes, activity timeline)
- **Quote comparison** — Side-by-side cards with AI summary at top

### UI Differentiators

1. **AI search bar as hero** — prominent on Discover page, not hidden in a corner
2. **Business cards, not table rows** — discovery is visual with logos, ratings, verified badges
3. **Trust signals everywhere** — verified badge, trust score, response rate visible on every card
4. **Public shareable profiles** — SEO-friendly URLs for external sharing
5. **Activity feed as home** — feels alive, not a static dashboard
6. **AI woven in naturally** — catalog builder, smart search, quote comparison are inline features, not separate AI pages
