using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Enums;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;
using NpgsqlTypes;

namespace NexTrade.Infrastructure.Services;

public class DiscoveryService(AppDbContext db)
{
    public record DiscoverItemDto(
        Guid Uid, string Title, string? Description, string Type, string? Category,
        string PricingType, decimal? PriceMin, decimal? PriceMax, string? CurrencyCode,
        int? LeadTimeDays, string? PrimaryImageUrl,
        Guid SupplierUid, string SupplierName, bool SupplierVerified, string? SupplierCountry,
        DateTime CreatedAt);

    public record DiscoverBusinessDto(
        Guid Uid, string Name, bool IsVerified, decimal TrustScore,
        string? Logo, string? About, string? City, string? CountryCode,
        string? Industry, List<string> Capabilities, int PublishedItemCount,
        DateTime CreatedAt);

    public record DiscoverItemsFilter(
        string? Search = null, Guid? CategoryUid = null, string? Type = null,
        string? Industry = null, string? Country = null,
        int Page = 1, int PageSize = 20);

    public record DiscoverBusinessesFilter(
        string? Search = null, string? Industry = null, string? Country = null,
        bool? VerifiedOnly = null, int Page = 1, int PageSize = 20);

    // --- Items ---
    public async Task<PagedResult<DiscoverItemDto>> SearchItemsAsync(DiscoverItemsFilter filter, CancellationToken ct)
    {
        var query = db.CatalogItems
            .IgnoreQueryFilters()
            .Include(c => c.Category)
            .Include(c => c.Media)
            .Where(c => c.Status == CatalogItemStatus.Published)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            var tsQuery = EF.Functions.WebSearchToTsQuery("english", search);
            query = query
                .Where(c => EF.Property<NpgsqlTsVector>(c, "SearchVector").Matches(tsQuery))
                .OrderByDescending(c => EF.Property<NpgsqlTsVector>(c, "SearchVector").RankCoverDensity(tsQuery))
                .ThenByDescending(c => c.CreatedAt);
        }
        else
        {
            query = query.OrderByDescending(c => c.CreatedAt);
        }

        if (filter.CategoryUid is not null)
            query = query.Where(c => c.Category != null && c.Category.Uid == filter.CategoryUid);

        if (!string.IsNullOrEmpty(filter.Type)
            && Enum.TryParse<CatalogItemType>(filter.Type, true, out var type))
            query = query.Where(c => c.Type == type);

        if (!string.IsNullOrEmpty(filter.Industry) || !string.IsNullOrEmpty(filter.Country))
        {
            var supplierQuery = db.Businesses
                .IgnoreQueryFilters()
                .Where(b => b.IsActive);

            if (!string.IsNullOrEmpty(filter.Industry))
                supplierQuery = supplierQuery.Where(b => b.Industry != null && b.Industry.Slug == filter.Industry);
            if (!string.IsNullOrEmpty(filter.Country))
                supplierQuery = supplierQuery.Where(b => b.Profile != null && b.Profile.CountryCode == filter.Country);

            query = query.Where(c => supplierQuery.Any(b => b.Uid == c.TenantId));
        }

        var totalCount = await query.CountAsync(ct);
        var rawItems = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(c => new
            {
                c.Uid, c.Title, c.Description, c.Type, CategoryName = c.Category != null ? c.Category.Name : null,
                c.PricingType, c.PriceMin, c.PriceMax, c.CurrencyCode, c.LeadTimeDays,
                PrimaryImageUrl = c.Media.Where(m => m.IsPrimary).Select(m => m.Url).FirstOrDefault()
                                  ?? c.Media.OrderBy(m => m.SortOrder).Select(m => m.Url).FirstOrDefault(),
                c.TenantId,
                c.CreatedAt
            })
            .ToListAsync(ct);

        var supplierUids = rawItems.Select(r => r.TenantId).Distinct().ToList();
        var suppliers = await db.Businesses
            .IgnoreQueryFilters()
            .Where(b => supplierUids.Contains(b.Uid))
            .Include(b => b.Profile)
            .Select(b => new
            {
                b.Uid, b.Name, b.IsVerified,
                CountryCode = b.Profile != null ? b.Profile.CountryCode : null
            })
            .ToListAsync(ct);
        var supplierMap = suppliers.ToDictionary(s => s.Uid);

        var items = rawItems.Select(r =>
        {
            supplierMap.TryGetValue(r.TenantId, out var s);
            return new DiscoverItemDto(
                r.Uid, r.Title, r.Description, r.Type.ToString(), r.CategoryName,
                r.PricingType.ToString(), r.PriceMin, r.PriceMax, r.CurrencyCode, r.LeadTimeDays,
                r.PrimaryImageUrl,
                r.TenantId, s?.Name ?? "", s?.IsVerified ?? false, s?.CountryCode,
                r.CreatedAt);
        }).ToList();

        return new PagedResult<DiscoverItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    // --- Businesses ---
    public async Task<PagedResult<DiscoverBusinessDto>> SearchBusinessesAsync(DiscoverBusinessesFilter filter, CancellationToken ct)
    {
        var query = db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Industry)
            .Include(b => b.Profile)
            .Where(b => b.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            var tsQuery = EF.Functions.WebSearchToTsQuery("english", search);
            query = query
                .Where(b => EF.Property<NpgsqlTsVector>(b, "SearchVector").Matches(tsQuery))
                .OrderByDescending(b => EF.Property<NpgsqlTsVector>(b, "SearchVector").RankCoverDensity(tsQuery))
                .ThenByDescending(b => b.TrustScore);
        }
        else
        {
            query = query.OrderByDescending(b => b.TrustScore).ThenByDescending(b => b.CreatedAt);
        }

        if (filter.VerifiedOnly == true)
            query = query.Where(b => b.IsVerified);

        if (!string.IsNullOrEmpty(filter.Industry))
            query = query.Where(b => b.Industry != null && b.Industry.Slug == filter.Industry);

        if (!string.IsNullOrEmpty(filter.Country))
            query = query.Where(b => b.Profile != null && b.Profile.CountryCode == filter.Country);

        return await query.ToPagedResultAsync(filter.Page, filter.PageSize, b => new DiscoverBusinessDto(
            b.Uid, b.Name, b.IsVerified, b.TrustScore,
            b.Profile != null ? b.Profile.Logo : null,
            b.Profile != null ? b.Profile.About : null,
            b.Profile != null ? b.Profile.City : null,
            b.Profile != null ? b.Profile.CountryCode : null,
            b.Industry != null ? b.Industry.Name : null,
            b.Profile != null ? b.Profile.Capabilities : new List<string>(),
            b.CatalogItems.Count(c => c.Status == CatalogItemStatus.Published),
            b.CreatedAt), ct);
    }

    // --- Public business profile + published items ---
    public record PublicBusinessProfileDto(
        Guid Uid, string Name, bool IsVerified, decimal TrustScore,
        string? Logo, string? BannerImage, string? About, string? Industry,
        string? City, string? CountryCode,
        List<string> Capabilities, List<string> Certifications, List<string> DeliveryRegions,
        int YearEstablished, string? CompanySize, string? Website,
        int FollowerCount, int PublishedItemCount, bool HasComplianceDocs,
        List<DiscoverItemDto> Items);

    public async Task<ServiceResult<PublicBusinessProfileDto>> GetPublicProfileAsync(Guid uid, CancellationToken ct)
    {
        var business = await db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Industry)
            .Include(b => b.Profile)
            .FirstOrDefaultAsync(b => b.Uid == uid && b.IsActive, ct);

        if (business is null)
            return ServiceResult<PublicBusinessProfileDto>.Fail("Business not found.", 404);

        var items = await db.CatalogItems
            .IgnoreQueryFilters()
            .Include(c => c.Category)
            .Include(c => c.Media)
            .Where(c => c.TenantId == uid && c.Status == CatalogItemStatus.Published)
            .OrderByDescending(c => c.CreatedAt)
            .Take(50)
            .Select(c => new DiscoverItemDto(
                c.Uid, c.Title, c.Description, c.Type.ToString(),
                c.Category != null ? c.Category.Name : null,
                c.PricingType.ToString(), c.PriceMin, c.PriceMax, c.CurrencyCode, c.LeadTimeDays,
                c.Media.Where(m => m.IsPrimary).Select(m => m.Url).FirstOrDefault()
                    ?? c.Media.OrderBy(m => m.SortOrder).Select(m => m.Url).FirstOrDefault(),
                uid, business.Name, business.IsVerified,
                business.Profile != null ? business.Profile.CountryCode : null,
                c.CreatedAt))
            .ToListAsync(ct);

        var followerCount = await db.Connections
            .Where(c => c.TargetBusinessUid == uid && c.Type == ConnectionType.Follow)
            .CountAsync(ct);

        var hasCompliance = await db.ComplianceDocuments
            .IgnoreQueryFilters()
            .AnyAsync(d => d.TenantId == uid && d.Status == ComplianceDocumentStatus.Verified, ct);

        var p = business.Profile;
        return ServiceResult<PublicBusinessProfileDto>.Ok(new PublicBusinessProfileDto(
            business.Uid, business.Name, business.IsVerified, business.TrustScore,
            p?.Logo, p?.BannerImage, p?.About, business.Industry?.Name,
            p?.City, p?.CountryCode,
            p?.Capabilities ?? [], p?.Certifications ?? [], p?.DeliveryRegions ?? [],
            business.YearEstablished ?? 0, business.CompanySize?.ToString(), business.Website,
            followerCount, items.Count, hasCompliance, items));
    }
}
