using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NexTrade.Core.Entities;
using NexTrade.Core.Enums;
using NexTrade.Infrastructure.Identity;

namespace NexTrade.Infrastructure.Data;

/// <summary>
/// Seeds three demo tenants wired in a triangle (supplier / buyer / both) plus a full
/// graph of catalog items, RFQs, quotes, awarded deals, reviews, compliance docs,
/// follow edges, saved suppliers, and conversations — so every page has content for
/// every account. Dev-only and idempotent; skipped if the marker user already exists.
/// </summary>
public static class DemoDataSeeder
{
    private const string MarkerEmail = "sasha@supplier.demo";
    private const string BuyerEmail = "maya@buyer.demo";
    private const string TraderEmail = "alex@trader.demo";
    private const string DemoPassword = "Demo123!";

    private static readonly string[] TenantRoles =
        ["Admin", "CatalogManager", "Sales", "Procurement", "Member"];

    public static async Task SeedAsync(IServiceProvider sp, CancellationToken ct = default)
    {
        using var scope = sp.CreateScope();
        var services = scope.ServiceProvider;
        var db = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<Role>>();
        var tenantContext = services.GetRequiredService<TenantContext>();
        var logger = services.GetRequiredService<ILogger<AppDbContext>>();
        var config = services.GetRequiredService<IConfiguration>();
        var env = services.GetRequiredService<IHostEnvironment>();

        var demoEnabled = config.GetValue("Seed:DemoData", env.IsDevelopment());
        if (!demoEnabled)
        {
            logger.LogInformation("Demo data seeding disabled (Seed:DemoData=false, env={Env}).", env.EnvironmentName);
            return;
        }

        if (await userManager.FindByEmailAsync(MarkerEmail) is not null)
        {
            logger.LogInformation("Demo data already present — skipping seed.");
            return;
        }

        logger.LogInformation("Seeding demo data...");

        var industries = await db.Industries.ToDictionaryAsync(i => i.Slug, ct);
        var categories = await db.CatalogCategories.ToDictionaryAsync(c => c.Slug, ct);

        // --- 1. Three tenants forming a supplier / buyer / both triangle ---
        var supplier = await CreateBusinessAsync(db, userManager, roleManager, tenantContext, ct,
            name: "Precision Forge Industries",
            email: MarkerEmail,
            fullName: "Sasha Kumar",
            industrySlug: "machinery",
            verified: true,
            trustScore: 4.7m,
            profile: new BusinessProfile
            {
                About = "Precision CNC machining and custom component manufacturing. ISO 9001 certified " +
                        "aerospace-grade tolerances, 5-axis capability, and 48-hour prototyping turnaround.",
                City = "Pune", State = "Maharashtra", CountryCode = "IN",
                Capabilities = ["CNC Machining", "5-Axis Milling", "EDM", "Rapid Prototyping", "Aerospace Grade"],
                Certifications = ["ISO 9001:2015", "AS9100D"],
                DeliveryRegions = ["APAC", "EMEA", "NA"],
            },
            yearEstablished: 2008, companySize: CompanySize.Medium,
            website: "https://precision-forge.demo",
            industries: industries);

        var buyer = await CreateBusinessAsync(db, userManager, roleManager, tenantContext, ct,
            name: "Atlas Procurement Co",
            email: BuyerEmail,
            fullName: "Maya Patel",
            industrySlug: "automotive",
            verified: true,
            trustScore: 4.6m,
            profile: new BusinessProfile
            {
                About = "Global procurement arm sourcing precision components, PCBs, polymers, and packaging " +
                        "across APAC and EMEA for Tier-1 automotive assembly programs.",
                City = "Detroit", State = "MI", CountryCode = "US",
                Capabilities = ["Strategic Sourcing", "Supplier Qualification", "Vendor Management", "Consulting"],
                Certifications = ["ISO 9001:2015"],
                DeliveryRegions = ["NA", "EMEA", "APAC"],
            },
            yearEstablished: 2005, companySize: CompanySize.Enterprise,
            website: "https://atlas-procurement.demo",
            industries: industries);

        var trader = await CreateBusinessAsync(db, userManager, roleManager, tenantContext, ct,
            name: "Meridian Trade House",
            email: TraderEmail,
            fullName: "Alex Müller",
            industrySlug: "chemicals",
            verified: true,
            trustScore: 4.5m,
            profile: new BusinessProfile
            {
                About = "Specialty polymers and industrial chemicals distributor. Sources raw materials for " +
                        "manufacturers worldwide and resells qualified stock from tier-1 producers. " +
                        "Active on both sides of the network — we buy and we sell.",
                City = "Hamburg", CountryCode = "DE",
                Capabilities = ["Polymer Resins", "Specialty Chemicals", "Import/Export", "Raw Materials Sourcing"],
                Certifications = ["ISO 14001", "REACH", "Responsible Care"],
                DeliveryRegions = ["EMEA", "NA", "APAC"],
            },
            yearEstablished: 2012, companySize: CompanySize.Medium,
            website: "https://meridian-trade.demo",
            industries: industries);

        // --- 2. Catalog items (every tenant has at least one published item) ---
        await SeedCatalogAsync(db, tenantContext, supplier, categories, ct, new CatalogSeed[]
        {
            new("5-Axis CNC Machining — Aerospace Grade", CatalogItemType.Service, "cnc-machining", CatalogItemStatus.Published,
                "Full 5-axis milling on titanium, Inconel, and aluminium 7075. Tolerances to ±0.005 mm, " +
                "first-article inspection with CMM reports.",
                PricingType.ContactForQuote, null, null, null, 1, 14, ["APAC", "EMEA", "NA"]),
            new("Precision Gears — Helical & Spur", CatalogItemType.Product, "cnc-machining", CatalogItemStatus.Published,
                "Custom-cut helical and spur gears from module 0.5 to 10. Case-hardened steel, gear-grinding " +
                "finish, AGMA Q11.",
                PricingType.Range, 45m, 320m, "USD", 50, 21, ["APAC", "EMEA"]),
            new("Rapid Prototype Tooling", CatalogItemType.Service, null, CatalogItemStatus.Published,
                "Injection-mold tooling and jigs for prototype runs. 7–10 day lead time from DFM review.",
                PricingType.ContactForQuote, null, null, null, 1, 10, []),
            new("Draft: Aluminium Extrusions", CatalogItemType.Product, null, CatalogItemStatus.Draft,
                "Standard and custom aluminium extrusion profiles — still finalising MOQ tiers.",
                PricingType.Range, 8m, 32m, "USD", 100, 14, []),
        });

        await SeedCatalogAsync(db, tenantContext, buyer, categories, ct, new CatalogSeed[]
        {
            new("Vendor Qualification Consulting", CatalogItemType.Service, null, CatalogItemStatus.Published,
                "Decades-of-experience supplier vetting — financial due diligence, on-site audits, capability " +
                "scoring, and readiness reports. Delivered by our sourcing team in 4–6 weeks.",
                PricingType.Range, 6_000m, 18_000m, "USD", 1, 30, ["NA", "EMEA", "APAC"]),
        });

        await SeedCatalogAsync(db, tenantContext, trader, categories, ct, new CatalogSeed[]
        {
            new("Polyethylene Resins — Recyclable Grade", CatalogItemType.Product, "polymers-resins", CatalogItemStatus.Published,
                "PE resins formulated for mechanical recycling. Consistent MFI, suitable for blown film and extrusion.",
                PricingType.Range, 1.20m, 2.10m, "EUR", 1000, 14, ["EMEA", "NA"]),
            new("Industrial Solvents — REACH Registered", CatalogItemType.Product, "chemicals", CatalogItemStatus.Published,
                "Full REACH documentation, bulk and drum packaging. Toluene, xylene, IPA, and custom blends.",
                PricingType.ContactForQuote, null, null, null, 200, 10, ["EMEA", "NA"]),
            new("Raw Aluminium Billets — 7075-T6", CatalogItemType.Product, null, CatalogItemStatus.Published,
                "Certified 7075-T6 aluminium billets for machining. Mill test reports included, bulk shipping " +
                "from Hamburg warehouse.",
                PricingType.Range, 4.80m, 7.20m, "EUR", 500, 10, ["EMEA", "APAC"]),
        });

        // --- 3. Compliance documents (supplier has 1 pending → shows in admin queue) ---
        await AddComplianceDocAsync(db, tenantContext, supplier,
            ComplianceDocumentType.IsoCert, "ISO 9001:2015 Certificate", "Bureau Veritas",
            ComplianceDocumentStatus.Verified, ct);
        await AddComplianceDocAsync(db, tenantContext, supplier,
            ComplianceDocumentType.IsoCert, "AS9100D Aerospace Certificate", "DNV",
            ComplianceDocumentStatus.Pending, ct);

        await AddComplianceDocAsync(db, tenantContext, buyer,
            ComplianceDocumentType.BusinessLicense, "Delaware Corporate Registration", "State of Delaware",
            ComplianceDocumentStatus.Verified, ct);

        await AddComplianceDocAsync(db, tenantContext, trader,
            ComplianceDocumentType.IsoCert, "ISO 14001 Environmental Certificate", "TÜV SÜD",
            ComplianceDocumentStatus.Verified, ct);
        await AddComplianceDocAsync(db, tenantContext, trader,
            ComplianceDocumentType.Insurance, "General Liability Insurance", "Allianz",
            ComplianceDocumentStatus.Verified, ct);

        // --- 4. Follow graph — everyone connected to everyone ---
        tenantContext.TenantId = Guid.Empty;
        db.Connections.AddRange(
            Follow(buyer.Uid, supplier.Uid),
            Follow(buyer.Uid, trader.Uid),
            Follow(supplier.Uid, trader.Uid),
            Follow(trader.Uid, supplier.Uid),
            Follow(trader.Uid, buyer.Uid),
            Follow(supplier.Uid, buyer.Uid));
        await db.SaveChangesAsync(ct);

        // --- 5. Saved supplier lists (every tenant has one list + one saved supplier) ---
        await SeedSavedSuppliersAsync(db, tenantContext, ct, buyer,
            listName: "Tier-1 Primary", listDesc: "Hand-picked vendors for core programs.",
            savedSupplierUids: new[]
            {
                (supplier.Uid, "Preferred aerospace-grade machining partner."),
                (trader.Uid, "Reliable raw-material and polymer source."),
            });

        await SeedSavedSuppliersAsync(db, tenantContext, ct, supplier,
            listName: "Raw Materials", listDesc: "Qualified sources for billets and alloys.",
            savedSupplierUids: new[] { (trader.Uid, "7075-T6 billet supplier — fast Hamburg shipping.") });

        await SeedSavedSuppliersAsync(db, tenantContext, ct, trader,
            listName: "Machining Partners", listDesc: "Vetted CNC shops for resale customers.",
            savedSupplierUids: new[] { (supplier.Uid, "5-axis capacity, quick turnaround on prototypes.") });

        // --- 6. RFQs, quotes, and three awarded deals forming a triangle ---
        // D1: Buyer → Supplier  (PCB assembly, awarded)
        var d1Rfq = await CreateRfqAsync(db, tenantContext, ct, buyer,
            title: "PCB assembly — IoT sensor v2 prototype run",
            description: "Turnkey PCB assembly for next-gen industrial IoT sensor. Mixed SMT + through-hole, " +
                         "IPC-A-610 Class 2, 50-piece pilot run with full functional test.",
            visibility: RfqVisibility.Targeted,
            status: RfqStatus.Awarded,
            deadlineOffsetDays: -20,
            deliveryLocation: "Detroit, MI, US",
            deliveryTimeline: "10–14 days from Gerber approval",
            items: new[]
            {
                ("PCB assembly — 4-layer FR4, 120x60 mm, mixed SMT+TH, 50 units", 50m, "pcs"),
            },
            targets: new[] { supplier.Uid });

        var d1Quote = await CreateQuoteAsync(db, tenantContext, ct, supplier, d1Rfq,
            status: QuoteStatus.Accepted,
            total: 8_400m, currency: "USD",
            notes: "Full functional test included, 10-day turnaround from Gerber approval.",
            items: new[] { (d1Rfq.Items.ElementAt(0).Id, 168m, 50m, 8_400m, 10, "DAP") });

        var d1Deal = await CreateDealAsync(db, tenantContext, ct, d1Rfq, d1Quote,
            buyer: buyer, supplierTenant: supplier,
            value: 8_400m, currency: "USD", daysAgo: 7);

        await AddReviewAsync(db, tenantContext, ct,
            reviewer: buyer, reviewed: supplier, deal: d1Deal,
            overall: 5, quality: 5, comms: 5, delivery: 5, value: 4,
            comment: "Prototype landed a day early. Test reports were thorough and the team proactively " +
                     "flagged a Gerber footprint issue. Will reuse for production.");

        await AddReviewAsync(db, tenantContext, ct,
            reviewer: supplier, reviewed: buyer, deal: d1Deal,
            overall: 5, quality: 5, comms: 5, delivery: 5, value: 5,
            comment: "Clean specs, prompt POs, and paid on terms. Textbook buyer engagement.");

        // D2: Supplier → Trader (raw aluminium billets, awarded)
        var d2Rfq = await CreateRfqAsync(db, tenantContext, ct, supplier,
            title: "Raw 7075-T6 aluminium billets — quarterly supply",
            description: "Recurring quarterly volume of 7075-T6 aluminium billets for our machining program. " +
                         "Mill test reports required, consistent chemistry across batches.",
            visibility: RfqVisibility.Targeted,
            status: RfqStatus.Awarded,
            deadlineOffsetDays: -15,
            deliveryLocation: "Pune, India",
            deliveryTimeline: "Quarterly shipments from Hamburg",
            items: new[] { ("7075-T6 billet, 100 mm dia x 500 mm, mill-test certified", 2_000m, "kg") },
            targets: new[] { trader.Uid });

        var d2Quote = await CreateQuoteAsync(db, tenantContext, ct, trader, d2Rfq,
            status: QuoteStatus.Accepted,
            total: 12_400m, currency: "EUR",
            notes: "Full MTRs included. First shipment ex-Hamburg within 10 days.",
            items: new[] { (d2Rfq.Items.ElementAt(0).Id, 6.20m, 2_000m, 12_400m, 10, "FOB") });

        var d2Deal = await CreateDealAsync(db, tenantContext, ct, d2Rfq, d2Quote,
            buyer: supplier, supplierTenant: trader,
            value: 12_400m, currency: "EUR", daysAgo: 12);

        await AddReviewAsync(db, tenantContext, ct,
            reviewer: supplier, reviewed: trader, deal: d2Deal,
            overall: 5, quality: 5, comms: 4, delivery: 5, value: 4,
            comment: "Billets arrived exactly to spec. MTRs matched the chemistry lab check. " +
                     "Our preferred raw-material source from now on.");

        await AddReviewAsync(db, tenantContext, ct,
            reviewer: trader, reviewed: supplier, deal: d2Deal,
            overall: 5, quality: 5, comms: 5, delivery: 5, value: 5,
            comment: "Very clear technical specs and fast acceptance. Repeat customer — love to see it.");

        // D3: Trader → Buyer (vendor qualification consulting, awarded)
        var d3Rfq = await CreateRfqAsync(db, tenantContext, ct, trader,
            title: "Vendor qualification for 20 new APAC suppliers",
            description: "Need an independent qualification sweep of 20 potential suppliers across APAC: " +
                         "financial health, on-site audit, capability scoring, and go/no-go recommendation.",
            visibility: RfqVisibility.Targeted,
            status: RfqStatus.Awarded,
            deadlineOffsetDays: -25,
            deliveryLocation: "Hamburg, DE",
            deliveryTimeline: "6 weeks from kick-off",
            items: new[] { ("Vendor qualification engagement — 20 suppliers, APAC", 1m, "engagement") },
            targets: new[] { buyer.Uid });

        var d3Quote = await CreateQuoteAsync(db, tenantContext, ct, buyer, d3Rfq,
            status: QuoteStatus.Accepted,
            total: 14_800m, currency: "USD",
            notes: "Full audit reports + vendor scorecards. 6-week delivery with weekly check-ins.",
            items: new[] { (d3Rfq.Items.ElementAt(0).Id, 14_800m, 1m, 14_800m, 42, "N/A") });

        var d3Deal = await CreateDealAsync(db, tenantContext, ct, d3Rfq, d3Quote,
            buyer: trader, supplierTenant: buyer,
            value: 14_800m, currency: "USD", daysAgo: 21);

        await AddReviewAsync(db, tenantContext, ct,
            reviewer: trader, reviewed: buyer, deal: d3Deal,
            overall: 4, quality: 5, comms: 4, delivery: 4, value: 4,
            comment: "Excellent audit depth and clear go/no-go rationale. Delivery ran a few days long but " +
                     "the team flagged it early. Would engage again.");

        await AddReviewAsync(db, tenantContext, ct,
            reviewer: buyer, reviewed: trader, deal: d3Deal,
            overall: 5, quality: 5, comms: 5, delivery: 5, value: 5,
            comment: "Crystal-clear scope from day one. Alex and team were pleasure to work with.");

        // Open RFQs: one per buyer relationship so every tenant has pending quote activity.
        var openRfqBs = await CreateRfqAsync(db, tenantContext, ct, buyer,
            title: "500 units — Aluminium CNC brackets, annual contract",
            description: "Recurring monthly volume of precision-machined aluminium brackets (7075-T6). " +
                         "Tolerance ±0.01 mm, CMM first-article inspection required. ISO 9001 vendors only.",
            visibility: RfqVisibility.Targeted,
            status: RfqStatus.Open,
            deadlineOffsetDays: 12,
            deliveryLocation: "Detroit, MI, US",
            deliveryTimeline: "Monthly batches, first delivery within 6 weeks of PO",
            items: new[]
            {
                ("CNC bracket — aluminium 7075-T6, 120x80x24 mm, 5-axis profile", 500m, "pcs"),
                ("First-article inspection with CMM report", 1m, "batch"),
            },
            targets: new[] { supplier.Uid });

        await CreateQuoteAsync(db, tenantContext, ct, supplier, openRfqBs,
            status: QuoteStatus.Submitted,
            total: 11_800m, currency: "USD",
            notes: "ISO 9001 certified, 18-day delivery from PO. Full CMM inspection included.",
            items: new[] { (openRfqBs.Items.First().Id, 23.60m, 500m, 11_800m, 18, "DDP") });

        var openRfqBt = await CreateRfqAsync(db, tenantContext, ct, buyer,
            title: "Polymer resins — quarterly supply, recyclable grade",
            description: "Looking for consistent PE resin supply for blown-film tooling runs. Recyclable grade " +
                         "preferred, MFI stability critical. 10 tonnes per quarter.",
            visibility: RfqVisibility.Targeted,
            status: RfqStatus.Open,
            deadlineOffsetDays: 18,
            deliveryLocation: "Detroit, MI, US",
            deliveryTimeline: "Quarterly, 30 days from PO",
            items: new[] { ("PE resin, recyclable grade, 10 tonnes per quarter", 10_000m, "kg") },
            targets: new[] { trader.Uid });

        await CreateQuoteAsync(db, tenantContext, ct, trader, openRfqBt,
            status: QuoteStatus.Submitted,
            total: 16_500m, currency: "EUR",
            notes: "Stable MFI across quarterly lots, lot-level COAs included. Hamburg ex-works.",
            items: new[] { (openRfqBt.Items.First().Id, 1.65m, 10_000m, 16_500m, 30, "EXW") });

        var openRfqTs = await CreateRfqAsync(db, tenantContext, ct, trader,
            title: "Precision machined fixtures — custom tooling",
            description: "One-off set of machined fixtures for a customer assembly line. 12 unique parts, " +
                         "detailed drawings provided on NDA.",
            visibility: RfqVisibility.Targeted,
            status: RfqStatus.Open,
            deadlineOffsetDays: 14,
            deliveryLocation: "Hamburg, DE",
            deliveryTimeline: "4 weeks from drawing release",
            items: new[] { ("Custom machined fixtures — 12 unique parts, tool steel", 12m, "pcs") },
            targets: new[] { supplier.Uid });

        await CreateQuoteAsync(db, tenantContext, ct, supplier, openRfqTs,
            status: QuoteStatus.Submitted,
            total: 9_600m, currency: "EUR",
            notes: "Per-part CMM reports. 4-week lead time from signed drawings.",
            items: new[] { (openRfqTs.Items.First().Id, 800m, 12m, 9_600m, 28, "DAP") });

        var openRfqTb = await CreateRfqAsync(db, tenantContext, ct, trader,
            title: "Market research — EU automotive tier-2 suppliers",
            description: "Need a short market-research engagement on EU automotive tier-2 suppliers: " +
                         "capacity, pricing benchmarks, and risk outlook. 4-week scope.",
            visibility: RfqVisibility.Targeted,
            status: RfqStatus.Open,
            deadlineOffsetDays: 10,
            deliveryLocation: "Hamburg, DE",
            deliveryTimeline: "4 weeks",
            items: new[] { ("Market research engagement — EU automotive tier-2", 1m, "engagement") },
            targets: new[] { buyer.Uid });

        await CreateQuoteAsync(db, tenantContext, ct, buyer, openRfqTb,
            status: QuoteStatus.Submitted,
            total: 7_500m, currency: "USD",
            notes: "Benchmarked database + qualitative interviews. Executive summary and data pack.",
            items: new[] { (openRfqTb.Items.First().Id, 7_500m, 1m, 7_500m, 28, "N/A") });

        // Public RFQ so the anonymous feed and dashboard network section have content.
        await CreateRfqAsync(db, tenantContext, ct, buyer,
            title: "Food-grade flexible pouches — 50k units, recurring",
            description: "Looking for sustainable, food-grade flexible stand-up pouches with reclosable zipper. " +
                         "50,000-unit initial run, quarterly reorder cadence. FSC/FDA compliance required.",
            visibility: RfqVisibility.Public,
            status: RfqStatus.Open,
            deadlineOffsetDays: 21,
            deliveryLocation: "Detroit, MI, US",
            deliveryTimeline: "First batch within 30 days of PO",
            items: new[] { ("Flexible stand-up pouch, 250 ml, reclosable zipper, 4-colour print", 50_000m, "pcs") },
            targets: Array.Empty<Guid>());

        // --- 7. Conversations — each tenant participates in at least one thread ---
        var supplierUser = await userManager.FindByEmailAsync(MarkerEmail)
            ?? throw new InvalidOperationException("Supplier demo user missing after seed.");
        var buyerUser = await userManager.FindByEmailAsync(BuyerEmail)
            ?? throw new InvalidOperationException("Buyer demo user missing after seed.");
        var traderUser = await userManager.FindByEmailAsync(TraderEmail)
            ?? throw new InvalidOperationException("Trader demo user missing after seed.");

        await SeedConversationAsync(db, tenantContext, ct,
            b1: buyer, b2: supplier, context: ConversationContext.Rfq, contextId: openRfqBs.Id,
            messages: new[]
            {
                (buyerUser.Id, buyer.Uid, "Hi Sasha — received your quote, looks solid. Can you hold 250 units in buffer stock for us between batches?"),
                (supplierUser.Id, supplier.Uid, "Hi Maya, yes — we can dedicate a bonded-stock slot for 250 units. Would you prefer a service agreement or handle it through PO terms?"),
                (buyerUser.Id, buyer.Uid, "PO terms work for us. I'll circulate the draft PO tomorrow."),
            });

        await SeedConversationAsync(db, tenantContext, ct,
            b1: supplier, b2: trader, context: ConversationContext.General, contextId: null,
            messages: new[]
            {
                (supplierUser.Id, supplier.Uid, "Alex — any chance of earlier delivery on the next billet shipment? We're picking up a rush order."),
                (traderUser.Id, trader.Uid, "Sasha, I can push your lot forward by 3–4 days. Give me the PO and I'll have logistics move it up the queue."),
                (supplierUser.Id, supplier.Uid, "Perfect. PO coming today."),
            });

        await SeedConversationAsync(db, tenantContext, ct,
            b1: buyer, b2: trader, context: ConversationContext.Rfq, contextId: openRfqBt.Id,
            messages: new[]
            {
                (buyerUser.Id, buyer.Uid, "Alex, your quote on the PE resin RFQ is within range. Can you commit to lot-level COAs from day one?"),
                (traderUser.Id, trader.Uid, "Maya, absolutely — lot-level COAs are standard on quarterly contracts. I'll attach a sample COA when I revise the quote."),
            });

        tenantContext.TenantId = Guid.Empty;
        logger.LogInformation(
            "Demo data seed complete. Logins (password {Password}): {Supplier} (supplier), {Buyer} (buyer), {Trader} (both).",
            DemoPassword, MarkerEmail, BuyerEmail, TraderEmail);
    }

    // ─── Helpers ──────────────────────────────────────────────

    private static Connection Follow(Guid from, Guid to) => new()
    {
        RequesterBusinessUid = from,
        TargetBusinessUid = to,
        Type = ConnectionType.Follow,
        Status = ConnectionStatus.Accepted,
    };

    private static async Task<Business> CreateBusinessAsync(
        AppDbContext db, UserManager<User> userManager, RoleManager<Role> roleManager,
        TenantContext tenantContext, CancellationToken ct,
        string name, string email, string fullName, string industrySlug,
        bool verified, decimal trustScore, BusinessProfile profile,
        int yearEstablished, CompanySize companySize, string website,
        IReadOnlyDictionary<string, Industry> industries)
    {
        tenantContext.TenantId = Guid.Empty;
        tenantContext.UserId = null;

        var business = new Business
        {
            Name = name,
            Subdomain = Slugify(name) + "-demo",
            IndustryId = industries.TryGetValue(industrySlug, out var industry) ? industry.Id : null,
            CompanySize = companySize,
            YearEstablished = yearEstablished,
            Website = website,
            IsVerified = verified,
            VerifiedAt = verified ? DateTime.UtcNow.AddDays(-30) : null,
            TrustScore = trustScore,
            ProfileSource = ProfileSource.SelfRegistered,
            IsActive = true,
        };
        db.Businesses.Add(business);
        await db.SaveChangesAsync(ct);

        profile.BusinessId = business.Id;
        profile.ProfileCompleteness = 0.9m;
        db.BusinessProfiles.Add(profile);
        await db.SaveChangesAsync(ct);

        foreach (var role in TenantRoles)
        {
            var scoped = $"{business.Uid}:{role}";
            if (!await roleManager.RoleExistsAsync(scoped))
                await roleManager.CreateAsync(new Role { Name = scoped, TenantId = business.Uid });
        }

        var user = new User
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            TenantId = business.Uid,
            IsActive = true,
            EmailConfirmed = true,
        };
        var result = await userManager.CreateAsync(user, DemoPassword);
        if (!result.Succeeded)
            throw new InvalidOperationException(
                $"Failed to seed demo user {email}: {string.Join("; ", result.Errors.Select(e => e.Description))}");

        await userManager.AddToRoleAsync(user, $"{business.Uid}:Admin");

        return business;
    }

    private record CatalogSeed(
        string Title, CatalogItemType Type, string? CategorySlug, CatalogItemStatus Status,
        string Description, PricingType Pricing, decimal? PriceMin, decimal? PriceMax,
        string? Currency, int? Moq, int? LeadDays, List<string> Regions);

    private static async Task SeedCatalogAsync(
        AppDbContext db, TenantContext tenantContext, Business business,
        IReadOnlyDictionary<string, CatalogCategory> categories, CancellationToken ct,
        IEnumerable<CatalogSeed> items)
    {
        tenantContext.TenantId = business.Uid;

        var index = 0;
        foreach (var it in items)
        {
            long? categoryId = it.CategorySlug is not null && categories.TryGetValue(it.CategorySlug, out var c)
                ? c.Id : null;

            db.CatalogItems.Add(new CatalogItem
            {
                Type = it.Type,
                Title = it.Title,
                Slug = Slugify(it.Title) + "-" + (++index),
                Description = it.Description,
                CategoryId = categoryId,
                PricingType = it.Pricing,
                PriceMin = it.PriceMin,
                PriceMax = it.PriceMax,
                CurrencyCode = it.Currency,
                MinOrderQuantity = it.Moq,
                LeadTimeDays = it.LeadDays,
                DeliveryRegions = it.Regions,
                Status = it.Status,
            });
        }

        await db.SaveChangesAsync(ct);
    }

    private static async Task AddComplianceDocAsync(
        AppDbContext db, TenantContext tenantContext, Business business,
        ComplianceDocumentType type, string title, string issuingBody,
        ComplianceDocumentStatus status, CancellationToken ct)
    {
        tenantContext.TenantId = business.Uid;

        db.ComplianceDocuments.Add(new ComplianceDocument
        {
            Type = type,
            Title = title,
            IssuingBody = issuingBody,
            FileUrl = "https://demo.example.com/placeholder.pdf",
            FileName = "placeholder.pdf",
            IssueDate = DateTime.UtcNow.AddMonths(-6),
            ExpiryDate = DateTime.UtcNow.AddMonths(18),
            Status = status,
            VerifiedAt = status == ComplianceDocumentStatus.Verified ? DateTime.UtcNow.AddMonths(-1) : null,
            Visibility = DocumentVisibility.Public,
        });
        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedSavedSuppliersAsync(
        AppDbContext db, TenantContext tenantContext, CancellationToken ct, Business owner,
        string listName, string listDesc, IEnumerable<(Guid SupplierUid, string Notes)> savedSupplierUids)
    {
        tenantContext.TenantId = owner.Uid;

        var list = new SupplierList { Name = listName, Description = listDesc };
        db.SupplierLists.Add(list);
        await db.SaveChangesAsync(ct);

        foreach (var (supplierUid, notes) in savedSupplierUids)
        {
            db.SavedSuppliers.Add(new SavedSupplier
            {
                SupplierBusinessUid = supplierUid,
                SupplierListId = list.Id,
                Notes = notes,
            });
        }
        await db.SaveChangesAsync(ct);
    }

    private static async Task<Rfq> CreateRfqAsync(
        AppDbContext db, TenantContext tenantContext, CancellationToken ct, Business createdBy,
        string title, string description, RfqVisibility visibility, RfqStatus status,
        int deadlineOffsetDays, string deliveryLocation, string deliveryTimeline,
        IEnumerable<(string Description, decimal Quantity, string UnitOfMeasure)> items,
        IEnumerable<Guid> targets)
    {
        tenantContext.TenantId = createdBy.Uid;
        tenantContext.UserId = null;

        var rfq = new Rfq
        {
            Title = title,
            Description = description,
            Visibility = visibility,
            Status = status,
            ResponseDeadline = DateTime.UtcNow.AddDays(deadlineOffsetDays),
            DeliveryLocation = deliveryLocation,
            DeliveryTimeline = deliveryTimeline,
        };

        var sort = 0;
        foreach (var (desc, qty, uom) in items)
        {
            rfq.Items.Add(new RfqItem
            {
                Description = desc,
                Quantity = qty,
                UnitOfMeasure = uom,
                SortOrder = sort++,
            });
        }

        foreach (var targetUid in targets)
        {
            rfq.Targets.Add(new RfqTarget
            {
                TargetBusinessUid = targetUid,
                SentAt = DateTime.UtcNow.AddDays(-2),
            });
        }

        db.Rfqs.Add(rfq);
        await db.SaveChangesAsync(ct);
        return rfq;
    }

    private static async Task<Quote> CreateQuoteAsync(
        AppDbContext db, TenantContext tenantContext, CancellationToken ct,
        Business supplier, Rfq rfq, QuoteStatus status,
        decimal total, string currency, string notes,
        IEnumerable<(long RfqItemId, decimal UnitPrice, decimal Qty, decimal Line, int LeadDays, string Incoterms)> items)
    {
        tenantContext.TenantId = supplier.Uid;

        var quote = new Quote
        {
            RfqId = rfq.Id,
            Status = status,
            TotalAmount = total,
            CurrencyCode = currency,
            ValidUntil = DateTime.UtcNow.AddDays(30),
            Notes = notes,
        };

        var sort = 0;
        foreach (var (rfqItemId, unitPrice, qty, line, lead, incoterms) in items)
        {
            quote.Items.Add(new QuoteItem
            {
                RfqItemId = rfqItemId,
                UnitPrice = unitPrice,
                Quantity = qty,
                TotalPrice = line,
                LeadTimeDays = lead,
                Incoterms = incoterms,
                SortOrder = sort++,
            });
        }

        db.Quotes.Add(quote);
        await db.SaveChangesAsync(ct);
        return quote;
    }

    private static async Task<DealConfirmation> CreateDealAsync(
        AppDbContext db, TenantContext tenantContext, CancellationToken ct,
        Rfq rfq, Quote quote, Business buyer, Business supplierTenant,
        decimal value, string currency, int daysAgo)
    {
        tenantContext.TenantId = Guid.Empty;

        var deal = new DealConfirmation
        {
            RfqId = rfq.Id,
            QuoteId = quote.Id,
            BuyerBusinessUid = buyer.Uid,
            SupplierBusinessUid = supplierTenant.Uid,
            BuyerConfirmed = true,
            BuyerConfirmedAt = DateTime.UtcNow.AddDays(-daysAgo),
            SupplierConfirmed = true,
            SupplierConfirmedAt = DateTime.UtcNow.AddDays(-daysAgo + 1),
            ConfirmedAt = DateTime.UtcNow.AddDays(-daysAgo + 1),
            DealValue = value,
            CurrencyCode = currency,
        };
        db.DealConfirmations.Add(deal);
        await db.SaveChangesAsync(ct);
        return deal;
    }

    private static async Task AddReviewAsync(
        AppDbContext db, TenantContext tenantContext, CancellationToken ct,
        Business reviewer, Business reviewed, DealConfirmation deal,
        int overall, int quality, int comms, int delivery, int value, string comment)
    {
        tenantContext.TenantId = Guid.Empty;

        db.Reviews.Add(new Review
        {
            ReviewerBusinessUid = reviewer.Uid,
            ReviewedBusinessUid = reviewed.Uid,
            DealConfirmationId = deal.Id,
            OverallRating = overall,
            QualityRating = quality,
            CommunicationRating = comms,
            DeliveryRating = delivery,
            ValueRating = value,
            Comment = comment,
            IsVerifiedDeal = true,
        });
        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedConversationAsync(
        AppDbContext db, TenantContext tenantContext, CancellationToken ct,
        Business b1, Business b2, ConversationContext context, long? contextId,
        IEnumerable<(long SenderUserId, Guid SenderBusinessUid, string Content)> messages)
    {
        tenantContext.TenantId = Guid.Empty;

        var participants = new[] { b1.Uid, b2.Uid }.OrderBy(u => u.ToString()).ToList();
        var conversation = new Conversation
        {
            ParticipantBusinessUids = participants,
            ContextType = context,
            ContextId = contextId,
            ConversationKey = $"{context}:{contextId?.ToString() ?? "-"}:{string.Join(",", participants)}",
        };
        db.Conversations.Add(conversation);
        await db.SaveChangesAsync(ct);

        foreach (var (senderUserId, senderBusinessUid, content) in messages)
        {
            db.Messages.Add(new Message
            {
                ConversationId = conversation.Id,
                SenderUserId = senderUserId,
                SenderBusinessUid = senderBusinessUid,
                Content = content,
            });
        }
        await db.SaveChangesAsync(ct);
    }

    private static string Slugify(string input)
    {
        var lower = input.ToLowerInvariant();
        var chars = lower.Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray();
        var collapsed = string.Join('-', new string(chars).Split('-', StringSplitOptions.RemoveEmptyEntries));
        return collapsed.Length > 150 ? collapsed[..150] : collapsed;
    }
}
