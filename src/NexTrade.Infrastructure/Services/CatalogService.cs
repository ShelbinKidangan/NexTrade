using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services;

public class CatalogService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant)
{
    // --- DTOs ---
    public record CatalogItemDto(
        Guid Uid, string Type, string Title, string? Description, string? Category, Guid? CategoryUid,
        string PricingType, decimal? PriceMin, decimal? PriceMax, string? CurrencyCode,
        int? MinOrderQuantity, int? LeadTimeDays, List<string> DeliveryRegions, string Status,
        int ViewCount, int InquiryCount, string? PrimaryImageUrl, List<CatalogMediaDto> Media,
        DateTime CreatedAt);

    public record CatalogMediaDto(long Id, string Url, string FileName, long FileSize, bool IsPrimary, int SortOrder);

    public record CreateCatalogItemRequest(
        CatalogItemType Type, string Title, string? Description, string? Specifications,
        Guid? CategoryUid, PricingType PricingType, decimal? PriceMin, decimal? PriceMax,
        string? CurrencyCode, int? MinOrderQuantity, int? LeadTimeDays, List<string>? DeliveryRegions);

    public record UpdateCatalogItemRequest(
        string? Title, string? Description, string? Specifications,
        Guid? CategoryUid, PricingType? PricingType, decimal? PriceMin, decimal? PriceMax,
        string? CurrencyCode, int? MinOrderQuantity, int? LeadTimeDays, List<string>? DeliveryRegions);

    public record CatalogFilter(int Page = 1, int PageSize = 20, string? Search = null,
        CatalogItemType? Type = null, CatalogItemStatus? Status = null, Guid? CategoryUid = null);

    public record SetStatusRequest(CatalogItemStatus Status);

    // --- Get own catalog (tenant-scoped) ---
    public async Task<PagedResult<CatalogItemDto>> GetAllAsync(CatalogFilter filter, CancellationToken ct)
    {
        var query = db.CatalogItems
            .Include(c => c.Category)
            .Include(c => c.Media)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.Search))
        {
            var s = filter.Search.ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(s)
                                    || (c.Description != null && c.Description.ToLower().Contains(s)));
        }

        if (filter.Type is not null)
            query = query.Where(c => c.Type == filter.Type);

        if (filter.Status is not null)
            query = query.Where(c => c.Status == filter.Status);

        if (filter.CategoryUid is not null)
            query = query.Where(c => c.Category != null && c.Category.Uid == filter.CategoryUid);

        query = query.OrderByDescending(c => c.CreatedAt);

        return await query.ToPagedResultAsync(filter.Page, filter.PageSize, MapToDto, ct);
    }

    // --- Get single item (tenant-scoped) ---
    public async Task<ServiceResult<CatalogItemDto>> GetByUidAsync(Guid uid, CancellationToken ct)
    {
        var item = await db.CatalogItems
            .Include(c => c.Category)
            .Include(c => c.Media)
            .FirstOrDefaultAsync(c => c.Uid == uid, ct);

        if (item is null)
            return ServiceResult<CatalogItemDto>.Fail("Catalog item not found.", 404);

        return ServiceResult<CatalogItemDto>.Ok(MapToDto(item));
    }

    // --- Create ---
    public async Task<ServiceResult<CatalogItemDto>> CreateAsync(CreateCatalogItemRequest req, CancellationToken ct)
    {
        var item = new CatalogItem
        {
            Type = req.Type,
            Title = req.Title,
            Slug = await GenerateUniqueSlugAsync(req.Title, null, ct),
            Description = req.Description,
            Specifications = req.Specifications,
            PricingType = req.PricingType,
            PriceMin = req.PriceMin,
            PriceMax = req.PriceMax,
            CurrencyCode = req.CurrencyCode,
            MinOrderQuantity = req.MinOrderQuantity,
            LeadTimeDays = req.LeadTimeDays,
            DeliveryRegions = req.DeliveryRegions ?? [],
            Status = CatalogItemStatus.Draft
        };

        if (req.CategoryUid is not null)
        {
            var category = await db.CatalogCategories.FirstOrDefaultAsync(c => c.Uid == req.CategoryUid, ct);
            if (category is not null) item.CategoryId = category.Id;
        }

        db.CatalogItems.Add(item);
        await uow.SaveChangesAsync(ct);

        return ServiceResult<CatalogItemDto>.Created(MapToDto(item));
    }

    // --- Update ---
    public async Task<ServiceResult<CatalogItemDto>> UpdateAsync(Guid uid, UpdateCatalogItemRequest req, CancellationToken ct)
    {
        var item = await db.CatalogItems
            .Include(c => c.Category)
            .Include(c => c.Media)
            .FirstOrDefaultAsync(c => c.Uid == uid, ct);

        if (item is null)
            return ServiceResult<CatalogItemDto>.Fail("Catalog item not found.", 404);

        if (req.Title is not null && req.Title != item.Title)
        {
            item.Title = req.Title;
            item.Slug = await GenerateUniqueSlugAsync(req.Title, item.Id, ct);
        }
        if (req.Description is not null) item.Description = req.Description;
        if (req.Specifications is not null) item.Specifications = req.Specifications;
        if (req.PricingType is not null) item.PricingType = req.PricingType.Value;
        if (req.PriceMin is not null) item.PriceMin = req.PriceMin;
        if (req.PriceMax is not null) item.PriceMax = req.PriceMax;
        if (req.CurrencyCode is not null) item.CurrencyCode = req.CurrencyCode;
        if (req.MinOrderQuantity is not null) item.MinOrderQuantity = req.MinOrderQuantity;
        if (req.LeadTimeDays is not null) item.LeadTimeDays = req.LeadTimeDays;
        if (req.DeliveryRegions is not null) item.DeliveryRegions = req.DeliveryRegions;

        if (req.CategoryUid is not null)
        {
            var category = await db.CatalogCategories.FirstOrDefaultAsync(c => c.Uid == req.CategoryUid, ct);
            if (category is not null) item.CategoryId = category.Id;
        }

        await uow.SaveChangesAsync(ct);
        return ServiceResult<CatalogItemDto>.Ok(MapToDto(item));
    }

    // --- Status transition (Draft → Published → Archived) ---
    public async Task<ServiceResult> SetStatusAsync(Guid uid, CatalogItemStatus status, CancellationToken ct)
    {
        var item = await db.CatalogItems.FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (item is null) return ServiceResult.Fail("Catalog item not found.", 404);

        item.Status = status;
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    // --- Delete ---
    public async Task<ServiceResult> DeleteAsync(Guid uid, CancellationToken ct)
    {
        var item = await db.CatalogItems
            .Include(c => c.Media)
            .FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (item is null) return ServiceResult.Fail("Catalog item not found.", 404);

        db.CatalogMedia.RemoveRange(item.Media);
        db.CatalogItems.Remove(item);
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    private async Task<string> GenerateUniqueSlugAsync(string title, long? excludeId, CancellationToken ct)
    {
        var baseSlug = Slugify(title);
        if (string.IsNullOrEmpty(baseSlug)) baseSlug = "item";

        var slug = baseSlug;
        var suffix = 1;
        while (await db.CatalogItems.AnyAsync(
            c => c.TenantId == tenant.TenantId && c.Slug == slug && (excludeId == null || c.Id != excludeId), ct))
        {
            slug = $"{baseSlug}-{++suffix}";
        }
        return slug;
    }

    private static string Slugify(string input)
    {
        var lower = input.ToLowerInvariant().Trim();
        var sb = new StringBuilder(lower.Length);
        foreach (var ch in lower)
        {
            if (char.IsLetterOrDigit(ch)) sb.Append(ch);
            else if (ch is ' ' or '-' or '_') sb.Append('-');
        }
        var collapsed = Regex.Replace(sb.ToString(), "-+", "-").Trim('-');
        return collapsed.Length > 180 ? collapsed[..180] : collapsed;
    }

    internal static CatalogItemDto MapToDto(CatalogItem c) => new(
        c.Uid, c.Type.ToString(), c.Title, c.Description,
        c.Category?.Name, c.Category?.Uid,
        c.PricingType.ToString(), c.PriceMin, c.PriceMax, c.CurrencyCode,
        c.MinOrderQuantity, c.LeadTimeDays, c.DeliveryRegions, c.Status.ToString(),
        c.ViewCount, c.InquiryCount,
        c.Media.FirstOrDefault(m => m.IsPrimary)?.Url ?? c.Media.FirstOrDefault()?.Url,
        c.Media.OrderBy(m => m.SortOrder)
            .Select(m => new CatalogMediaDto(m.Id, m.Url, m.FileName, m.FileSize, m.IsPrimary, m.SortOrder))
            .ToList(),
        c.CreatedAt);
}
