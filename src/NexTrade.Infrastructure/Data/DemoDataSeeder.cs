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
/// Seeds a handful of realistic businesses, users, catalog items, compliance docs,
/// and social-graph edges so the app is demo-ready on first run. Dev-only and
/// idempotent — skipped if the marker user already exists.
/// </summary>
public static class DemoDataSeeder
{
    private const string MarkerEmail = "sasha@precision.demo";
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

        // Gate: demo data seeds in Development by default; any environment can opt in
        // via `Seed:DemoData=true` (useful for docker-compose demo stacks).
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

        // --- 1. Suppliers ---
        var precision = await CreateBusinessAsync(db, userManager, roleManager, tenantContext, ct,
            name: "Precision Industries Ltd",
            email: "sasha@precision.demo",
            fullName: "Sasha Kumar",
            industrySlug: "machinery",
            verified: true,
            trustScore: 4.6m,
            profile: new BusinessProfile
            {
                About = "Precision CNC machining and custom component manufacturing. ISO 9001 certified aerospace-grade tolerances, 5-axis capability, and 48-hour prototyping turnaround.",
                City = "Pune", State = "Maharashtra", CountryCode = "IN",
                Capabilities = ["CNC Machining", "5-Axis Milling", "EDM", "Rapid Prototyping", "Aerospace Grade"],
                Certifications = ["ISO 9001:2015", "AS9100D"],
                DeliveryRegions = ["APAC", "EMEA", "NA"],
            },
            yearEstablished: 2008, companySize: CompanySize.Medium,
            website: "https://precision-demo.example.com",
            industries: industries);

        var nordic = await CreateBusinessAsync(db, userManager, roleManager, tenantContext, ct,
            name: "Nordic Electronics AB",
            email: "erik@nordic.demo",
            fullName: "Erik Lindqvist",
            industrySlug: "electronics",
            verified: true,
            trustScore: 4.8m,
            profile: new BusinessProfile
            {
                About = "Turnkey electronics manufacturing — prototype PCB assembly, IoT sensor modules, and EMC-compliant industrial enclosures. From gerber to shelf in 10 days.",
                City = "Stockholm", CountryCode = "SE",
                Capabilities = ["PCB Assembly", "SMT", "IoT Modules", "EMC Testing", "Low-Volume Prototyping"],
                Certifications = ["ISO 9001:2015", "IPC-A-610", "RoHS"],
                DeliveryRegions = ["EMEA", "NA"],
            },
            yearEstablished: 2012, companySize: CompanySize.Small,
            website: "https://nordic-demo.example.com",
            industries: industries);

        var pacific = await CreateBusinessAsync(db, userManager, roleManager, tenantContext, ct,
            name: "Pacific Packaging Co",
            email: "linh@pacific.demo",
            fullName: "Linh Nguyen",
            industrySlug: "packaging",
            verified: false,
            trustScore: 3.9m,
            profile: new BusinessProfile
            {
                About = "Food-grade flexible packaging and sustainable kraft-paper alternatives. Custom printing, FSC-certified materials, MOQ from 5,000 units.",
                City = "Ho Chi Minh City", CountryCode = "VN",
                Capabilities = ["Flexible Packaging", "Kraft Paper", "Food-Grade", "Custom Print", "Sustainable Materials"],
                Certifications = ["FSC Chain of Custody", "FDA 21 CFR"],
                DeliveryRegions = ["APAC"],
            },
            yearEstablished: 2015, companySize: CompanySize.Small,
            website: "https://pacific-demo.example.com",
            industries: industries);

        var greenchem = await CreateBusinessAsync(db, userManager, roleManager, tenantContext, ct,
            name: "GreenChem Solutions GmbH",
            email: "klaus@greenchem.demo",
            fullName: "Klaus Becker",
            industrySlug: "chemicals",
            verified: true,
            trustScore: 4.4m,
            profile: new BusinessProfile
            {
                About = "REACH-compliant specialty chemicals, recyclable polymer resins, and custom synthesis. Trusted by Tier-1 automotive and industrial clients across Europe.",
                City = "Hamburg", CountryCode = "DE",
                Capabilities = ["Polymer Resins", "Specialty Chemicals", "Custom Synthesis", "REACH Compliance"],
                Certifications = ["ISO 14001", "REACH", "Responsible Care"],
                DeliveryRegions = ["EMEA"],
            },
            yearEstablished: 1998, companySize: CompanySize.Large,
            website: "https://greenchem-demo.example.com",
            industries: industries);

        // --- 2. Buyer tenant ---
        var buyer = await CreateBusinessAsync(db, userManager, roleManager, tenantContext, ct,
            name: "BuyerCo Global Inc",
            email: "maya@buyerco.demo",
            fullName: "Maya Patel",
            industrySlug: "automotive",
            verified: true,
            trustScore: 4.7m,
            profile: new BusinessProfile
            {
                About = "Global procurement arm sourcing precision components, PCBs, and packaging across APAC and EMEA for Tier-1 automotive assembly.",
                City = "Detroit", State = "MI", CountryCode = "US",
                Capabilities = ["Strategic Sourcing", "Supplier Qualification", "Vendor Management"],
                DeliveryRegions = ["NA", "EMEA", "APAC"],
            },
            yearEstablished: 2005, companySize: CompanySize.Enterprise,
            website: "https://buyerco-demo.example.com",
            industries: industries);

        // --- 3. Catalog items per supplier ---
        await SeedCatalogAsync(db, tenantContext, precision, categories, ct, new CatalogSeed[]
        {
            new("5-Axis CNC Machining — Aerospace Grade", CatalogItemType.Service, "cnc-machining", CatalogItemStatus.Published,
                "Full 5-axis milling on titanium, Inconel, and aluminium 7075. Tolerances to ±0.005 mm, first-article inspection with CMM reports.",
                PricingType.ContactForQuote, null, null, null, 1, 14,
                ["APAC", "EMEA", "NA"]),
            new("Precision Gear Manufacturing — Helical & Spur", CatalogItemType.Product, "cnc-machining", CatalogItemStatus.Published,
                "Custom-cut helical and spur gears from module 0.5 to 10. Case-hardened steel, gear-grinding finish, AGMA Q11.",
                PricingType.Range, 45m, 320m, "USD", 50, 21,
                ["APAC", "EMEA"]),
            new("Custom Prototype Tooling", CatalogItemType.Service, null, CatalogItemStatus.Published,
                "Rapid injection-mold tooling and jigs for prototype runs. 7–10 day lead time from DFM review.",
                PricingType.ContactForQuote, null, null, null, 1, 10, []),
            new("Legacy Fixture Line (archived)", CatalogItemType.Product, null, CatalogItemStatus.Archived,
                "Older fixture catalogue retained for historical lookups.",
                PricingType.Fixed, 120m, null, "USD", 10, 30, []),
        });

        await SeedCatalogAsync(db, tenantContext, nordic, categories, ct, new CatalogSeed[]
        {
            new("Turnkey PCB Assembly — Prototype to Production", CatalogItemType.Service, "pcb-assembly", CatalogItemStatus.Published,
                "SMT, through-hole, and mixed assembly from 1 piece to 10k. Gerber-to-shelf in 10 days, IPC-A-610 Class 2/3.",
                PricingType.ContactForQuote, null, null, null, 1, 10,
                ["EMEA", "NA"]),
            new("Industrial IoT Sensor Module — NB-IoT", CatalogItemType.Product, "sensors", CatalogItemStatus.Published,
                "Battery-powered temperature + vibration sensor, NB-IoT radio, 10-year battery life. Certified for industrial environments.",
                PricingType.Fixed, 89m, null, "EUR", 100, 14,
                ["EMEA"]),
            new("EMC Pre-Compliance Testing", CatalogItemType.Service, null, CatalogItemStatus.Published,
                "Full-service EMC testing at our Stockholm facility. Pre-compliance sweeps with report before you head to a notified body.",
                PricingType.Fixed, 1800m, null, "EUR", 1, 5,
                ["EMEA"]),
            new("Draft: High-Density Connector Board", CatalogItemType.Product, "pcb-assembly", CatalogItemStatus.Draft,
                "High-pin-count connector breakout board — still finalising specs.",
                PricingType.Range, 120m, 180m, "EUR", 10, 21, []),
        });

        await SeedCatalogAsync(db, tenantContext, pacific, categories, ct, new CatalogSeed[]
        {
            new("Food-Grade Flexible Pouches — Stand-Up", CatalogItemType.Product, "flexible-packaging", CatalogItemStatus.Published,
                "FDA-compliant laminated pouches with reclosable zipper. Digital print, 5k MOQ, 21-day lead time.",
                PricingType.Range, 0.12m, 0.38m, "USD", 5000, 21,
                ["APAC"]),
            new("Sustainable Kraft Paper Shopping Bags", CatalogItemType.Product, null, CatalogItemStatus.Published,
                "FSC-certified kraft paper, twisted-handle retail bags. Flexo print up to 4 colours.",
                PricingType.Fixed, 0.09m, null, "USD", 10000, 18,
                ["APAC"]),
            new("Branded Retail Boxes — Custom Print", CatalogItemType.Product, "rigid-packaging", CatalogItemStatus.Draft,
                "Corrugated retail boxes, offset-printed, still refining the die-cut library.",
                PricingType.Range, 0.45m, 1.20m, "USD", 2000, 25,
                ["APAC"]),
        });

        await SeedCatalogAsync(db, tenantContext, greenchem, categories, ct, new CatalogSeed[]
        {
            new("Polyethylene Resins — Recyclable Grade", CatalogItemType.Product, "polymers-resins", CatalogItemStatus.Published,
                "PE resins formulated for mechanical recycling. Consistent MFI, suitable for blown film and extrusion.",
                PricingType.Range, 1.20m, 2.10m, "EUR", 1000, 14,
                ["EMEA"]),
            new("Industrial Solvents — REACH Registered", CatalogItemType.Product, "chemicals", CatalogItemStatus.Published,
                "Full REACH documentation, bulk and drum packaging. Toluene, xylene, IPA, and custom blends.",
                PricingType.ContactForQuote, null, null, null, 200, 10,
                ["EMEA"]),
            new("Custom Chemical Synthesis — mg to kg scale", CatalogItemType.Service, null, CatalogItemStatus.Published,
                "Contract synthesis for specialty intermediates. NDA-first engagements, pilot scale to 10 kg.",
                PricingType.ContactForQuote, null, null, null, 1, 30,
                ["EMEA"]),
        });

        // --- 4. Compliance documents (placeholders so badge renders) ---
        await AddComplianceDocAsync(db, tenantContext, precision,
            ComplianceDocumentType.IsoCert, "ISO 9001:2015 Certificate", "Bureau Veritas", ct);
        await AddComplianceDocAsync(db, tenantContext, nordic,
            ComplianceDocumentType.IsoCert, "ISO 9001:2015 Certificate", "DNV", ct);
        await AddComplianceDocAsync(db, tenantContext, greenchem,
            ComplianceDocumentType.IsoCert, "ISO 14001 Certificate", "TÜV SÜD", ct);

        // --- 5. Follow graph (Connections are cross-tenant) ---
        tenantContext.TenantId = Guid.Empty;
        db.Connections.AddRange(
            Follow(buyer.Uid, precision.Uid),
            Follow(buyer.Uid, nordic.Uid),
            Follow(buyer.Uid, pacific.Uid),
            Follow(precision.Uid, nordic.Uid),
            Follow(greenchem.Uid, precision.Uid));
        await db.SaveChangesAsync(ct);

        // --- 6. Saved suppliers for the buyer ---
        tenantContext.TenantId = buyer.Uid;
        var verifiedList = new SupplierList { Name = "Verified Primary Suppliers", Description = "Hand-picked tier-1 vendors." };
        var prototypeList = new SupplierList { Name = "Prototype Partners", Description = "Fast-turnaround shops for early-stage work." };
        db.SupplierLists.AddRange(verifiedList, prototypeList);
        await db.SaveChangesAsync(ct);

        db.SavedSuppliers.AddRange(
            new SavedSupplier
            {
                SupplierBusinessUid = precision.Uid,
                SupplierListId = verifiedList.Id,
                Notes = "Preferred for aerospace parts — responsive sales team.",
            },
            new SavedSupplier
            {
                SupplierBusinessUid = nordic.Uid,
                SupplierListId = verifiedList.Id,
                Notes = "Our go-to for PCB prototyping.",
            },
            new SavedSupplier
            {
                SupplierBusinessUid = pacific.Uid,
                SupplierListId = prototypeList.Id,
                Notes = "Packaging supplier under evaluation.",
            });
        await db.SaveChangesAsync(ct);

        tenantContext.TenantId = Guid.Empty;
        logger.LogInformation("Demo data seed complete. Login with {Email} / {Password}.", MarkerEmail, DemoPassword);
    }

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
        // Create the business under a neutral tenant context so CreatedBy stays null.
        tenantContext.TenantId = Guid.Empty;
        tenantContext.UserId = null;

        var business = new Business
        {
            Name = name,
            Subdomain = name.ToLowerInvariant().Replace(" ", "-").Replace(",", "").Replace(".", "") + "-demo",
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
        profile.ProfileCompleteness = 0.85m;
        db.BusinessProfiles.Add(profile);
        await db.SaveChangesAsync(ct);

        // Tenant-scoped roles (mirrors AuthService.RegisterAsync).
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
        ComplianceDocumentType type, string title, string issuingBody, CancellationToken ct)
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
            Status = ComplianceDocumentStatus.Verified,
            VerifiedAt = DateTime.UtcNow.AddMonths(-1),
            Visibility = DocumentVisibility.Public,
        });
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
