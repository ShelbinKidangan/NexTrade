using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NexTrade.Core.Entities;
using NexTrade.Infrastructure.Identity;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(IServiceProvider services, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var logger = sp.GetRequiredService<ILogger<AppDbContext>>();
        var db = sp.GetRequiredService<AppDbContext>();

        logger.LogInformation("Applying database migrations...");
        await db.Database.MigrateAsync(ct);

        await SeedIndustriesAsync(db, ct);
        await SeedCountriesAsync(db, ct);
        await SeedCurrenciesAsync(db, ct);
        await db.SaveChangesAsync(ct);

        await SeedPlatformAdminAsync(sp, ct);

        logger.LogInformation("Database initialization complete.");
    }

    // Level-1 industries (UNSPSC segments — widely used B2B taxonomy).
    private static readonly (string Slug, string Name, int Sort)[] DefaultIndustries =
    [
        ("agriculture", "Agriculture, Forestry & Fishing", 10),
        ("mining", "Mining & Quarrying", 20),
        ("manufacturing", "Manufacturing", 30),
        ("chemicals", "Chemicals & Plastics", 40),
        ("metals", "Metals & Metalworking", 50),
        ("machinery", "Industrial Machinery & Equipment", 60),
        ("electronics", "Electronics & Electrical", 70),
        ("automotive", "Automotive & Transport Equipment", 80),
        ("textiles", "Textiles & Apparel", 90),
        ("food-beverage", "Food & Beverage", 100),
        ("pharmaceuticals", "Pharmaceuticals & Healthcare", 110),
        ("construction", "Construction & Building Materials", 120),
        ("energy", "Energy & Utilities", 130),
        ("logistics", "Logistics, Freight & Warehousing", 140),
        ("software-it", "Software, IT & Business Services", 150),
        ("packaging", "Packaging & Materials", 160),
        ("paper", "Paper, Pulp & Printing", 170),
        ("rubber", "Rubber & Leather Products", 180),
        ("environmental", "Environmental Services", 190),
        ("other", "Other", 999),
    ];

    private static async Task SeedIndustriesAsync(AppDbContext db, CancellationToken ct)
    {
        var existing = await db.Industries.Select(i => i.Slug).ToListAsync(ct);
        foreach (var (slug, name, sort) in DefaultIndustries)
        {
            if (!existing.Contains(slug))
                db.Industries.Add(new Industry { Slug = slug, Name = name, SortOrder = sort, IsActive = true });
        }
    }

    // ISO 3166-1 — abbreviated core list; S2P seeding can top this up later.
    private static readonly (string Code, string Code3, string Name)[] DefaultCountries =
    [
        ("AE", "ARE", "United Arab Emirates"),
        ("AU", "AUS", "Australia"),
        ("BD", "BGD", "Bangladesh"),
        ("BR", "BRA", "Brazil"),
        ("CA", "CAN", "Canada"),
        ("CH", "CHE", "Switzerland"),
        ("CN", "CHN", "China"),
        ("DE", "DEU", "Germany"),
        ("EG", "EGY", "Egypt"),
        ("ES", "ESP", "Spain"),
        ("FR", "FRA", "France"),
        ("GB", "GBR", "United Kingdom"),
        ("ID", "IDN", "Indonesia"),
        ("IN", "IND", "India"),
        ("IT", "ITA", "Italy"),
        ("JP", "JPN", "Japan"),
        ("KE", "KEN", "Kenya"),
        ("KR", "KOR", "South Korea"),
        ("LK", "LKA", "Sri Lanka"),
        ("MX", "MEX", "Mexico"),
        ("MY", "MYS", "Malaysia"),
        ("NG", "NGA", "Nigeria"),
        ("NL", "NLD", "Netherlands"),
        ("NP", "NPL", "Nepal"),
        ("NZ", "NZL", "New Zealand"),
        ("PH", "PHL", "Philippines"),
        ("PK", "PAK", "Pakistan"),
        ("PL", "POL", "Poland"),
        ("SA", "SAU", "Saudi Arabia"),
        ("SG", "SGP", "Singapore"),
        ("TH", "THA", "Thailand"),
        ("TR", "TUR", "Turkey"),
        ("US", "USA", "United States"),
        ("VN", "VNM", "Vietnam"),
        ("ZA", "ZAF", "South Africa"),
    ];

    private static async Task SeedCountriesAsync(AppDbContext db, CancellationToken ct)
    {
        var existing = await db.Countries.Select(c => c.Code).ToListAsync(ct);
        foreach (var (code, code3, name) in DefaultCountries)
        {
            if (!existing.Contains(code))
                db.Countries.Add(new Country { Code = code, Code3 = code3, Name = name, IsActive = true });
        }
    }

    // ISO 4217 — the subset our seeded countries transact in.
    private static readonly (string Code, string Name, string Symbol, int Decimals)[] DefaultCurrencies =
    [
        ("AED", "UAE Dirham", "د.إ", 2),
        ("AUD", "Australian Dollar", "A$", 2),
        ("BDT", "Bangladeshi Taka", "৳", 2),
        ("BRL", "Brazilian Real", "R$", 2),
        ("CAD", "Canadian Dollar", "C$", 2),
        ("CHF", "Swiss Franc", "CHF", 2),
        ("CNY", "Chinese Yuan", "¥", 2),
        ("EGP", "Egyptian Pound", "E£", 2),
        ("EUR", "Euro", "€", 2),
        ("GBP", "British Pound", "£", 2),
        ("IDR", "Indonesian Rupiah", "Rp", 2),
        ("INR", "Indian Rupee", "₹", 2),
        ("JPY", "Japanese Yen", "¥", 0),
        ("KES", "Kenyan Shilling", "KSh", 2),
        ("KRW", "South Korean Won", "₩", 0),
        ("LKR", "Sri Lankan Rupee", "Rs", 2),
        ("MXN", "Mexican Peso", "Mex$", 2),
        ("MYR", "Malaysian Ringgit", "RM", 2),
        ("NGN", "Nigerian Naira", "₦", 2),
        ("NPR", "Nepalese Rupee", "Rs", 2),
        ("NZD", "New Zealand Dollar", "NZ$", 2),
        ("PHP", "Philippine Peso", "₱", 2),
        ("PKR", "Pakistani Rupee", "Rs", 2),
        ("PLN", "Polish Złoty", "zł", 2),
        ("SAR", "Saudi Riyal", "ر.س", 2),
        ("SGD", "Singapore Dollar", "S$", 2),
        ("THB", "Thai Baht", "฿", 2),
        ("TRY", "Turkish Lira", "₺", 2),
        ("USD", "US Dollar", "$", 2),
        ("VND", "Vietnamese Dong", "₫", 0),
        ("ZAR", "South African Rand", "R", 2),
    ];

    private static async Task SeedCurrenciesAsync(AppDbContext db, CancellationToken ct)
    {
        var existing = await db.Currencies.Select(c => c.Code).ToListAsync(ct);
        foreach (var (code, name, symbol, decimals) in DefaultCurrencies)
        {
            if (!existing.Contains(code))
                db.Currencies.Add(new Currency { Code = code, Name = name, Symbol = symbol, DecimalPlaces = decimals, IsActive = true });
        }
    }

    private static async Task SeedPlatformAdminAsync(IServiceProvider sp, CancellationToken ct)
    {
        var config = sp.GetRequiredService<IConfiguration>();
        var userManager = sp.GetRequiredService<UserManager<User>>();
        var roleManager = sp.GetRequiredService<RoleManager<Role>>();
        var logger = sp.GetRequiredService<ILogger<AppDbContext>>();

        var email = config["Admin:Email"]
            ?? Environment.GetEnvironmentVariable("ADMIN_EMAIL")
            ?? "admin@nextrade.local";
        var password = config["Admin:Password"]
            ?? Environment.GetEnvironmentVariable("ADMIN_PASSWORD")
            ?? "Admin123!";

        const string platformAdminRole = "PlatformAdmin";
        if (!await roleManager.RoleExistsAsync(platformAdminRole))
            await roleManager.CreateAsync(new Role { Name = platformAdminRole, TenantId = Guid.Empty });

        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null)
        {
            if (!existing.IsPlatformAdmin)
            {
                existing.IsPlatformAdmin = true;
                await userManager.UpdateAsync(existing);
            }
            return;
        }

        var admin = new User
        {
            UserName = email,
            Email = email,
            FullName = "Platform Administrator",
            IsPlatformAdmin = true,
            IsActive = true,
            TenantId = Guid.Empty,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(admin, password);
        if (!result.Succeeded)
        {
            logger.LogError("Failed to seed platform admin: {Errors}",
                string.Join("; ", result.Errors.Select(e => e.Description)));
            return;
        }

        await userManager.AddToRoleAsync(admin, platformAdminRole);
        logger.LogInformation("Seeded platform admin {Email}", email);
    }
}
