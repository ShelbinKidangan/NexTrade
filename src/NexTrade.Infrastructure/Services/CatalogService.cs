using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services;

public class CatalogService(AppDbContext db, IUnitOfWork uow)
{
    // --- DTOs ---
    public record CatalogItemDto(
        Guid Uid, string Type, string Title, string? Description, string? Category,
        string PricingType, decimal? PriceMin, decimal? PriceMax, string? CurrencyCode,
        int? MinOrderQuantity, int? LeadTimeDays, string Status,
        int ViewCount, int InquiryCount, string? PrimaryImageUrl, DateTime CreatedAt);

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

    // --- Get own catalog (tenant-scoped) ---
    public async Task<PagedResult<CatalogItemDto>> GetAllAsync(CatalogFilter filter, CancellationToken ct)
    {
        var query = db.CatalogItems
            .Include(c => c.Category)
            .Include(c => c.Media)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(c => c.Title.ToLower().Contains(filter.Search.ToLower()));

        if (filter.Type is not null)
            query = query.Where(c => c.Type == filter.Type);

        if (filter.Status is not null)
            query = query.Where(c => c.Status == filter.Status);

        query = query.OrderByDescending(c => c.CreatedAt);

        return await query.ToPagedResultAsync(filter.Page, filter.PageSize, MapToDto, ct);
    }

    // --- Create ---
    public async Task<ServiceResult<CatalogItemDto>> CreateAsync(CreateCatalogItemRequest req, CancellationToken ct)
    {
        var item = new CatalogItem
        {
            Type = req.Type,
            Title = req.Title,
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

        if (req.Title is not null) item.Title = req.Title;
        if (req.Description is not null) item.Description = req.Description;
        if (req.Specifications is not null) item.Specifications = req.Specifications;
        if (req.PricingType is not null) item.PricingType = req.PricingType.Value;
        if (req.PriceMin is not null) item.PriceMin = req.PriceMin;
        if (req.PriceMax is not null) item.PriceMax = req.PriceMax;
        if (req.CurrencyCode is not null) item.CurrencyCode = req.CurrencyCode;
        if (req.MinOrderQuantity is not null) item.MinOrderQuantity = req.MinOrderQuantity;
        if (req.LeadTimeDays is not null) item.LeadTimeDays = req.LeadTimeDays;
        if (req.DeliveryRegions is not null) item.DeliveryRegions = req.DeliveryRegions;

        await uow.SaveChangesAsync(ct);
        return ServiceResult<CatalogItemDto>.Ok(MapToDto(item));
    }

    // --- Publish / Archive ---
    public async Task<ServiceResult> SetStatusAsync(Guid uid, CatalogItemStatus status, CancellationToken ct)
    {
        var item = await db.CatalogItems.FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (item is null) return ServiceResult.Fail("Catalog item not found.", 404);

        item.Status = status;
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    private static CatalogItemDto MapToDto(CatalogItem c) => new(
        c.Uid, c.Type.ToString(), c.Title, c.Description, c.Category?.Name,
        c.PricingType.ToString(), c.PriceMin, c.PriceMax, c.CurrencyCode,
        c.MinOrderQuantity, c.LeadTimeDays, c.Status.ToString(),
        c.ViewCount, c.InquiryCount,
        c.Media.FirstOrDefault(m => m.IsPrimary)?.Url, c.CreatedAt);
}
