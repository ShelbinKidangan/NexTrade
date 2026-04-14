using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services.Admin;

public class AdminContentService(AppDbContext db, IUnitOfWork uow, IAdminAuditLog audit)
{
    public record AdminCatalogItemDto(
        Guid Uid, string Title, string Type, string Status,
        Guid SupplierUid, string SupplierName, DateTime CreatedAt);

    public record AdminRfqDto(
        Guid Uid, string Title, string Status, string Moderation,
        Guid BuyerUid, string BuyerName, DateTime CreatedAt);

    public record AdminReviewDto(
        Guid Uid, int OverallRating, string? Comment, string Moderation,
        Guid ReviewerUid, Guid ReviewedUid, string? ReviewerName, string? ReviewedName,
        DateTime CreatedAt);

    public record ContentFilter(int Page = 1, int PageSize = 25, string? Search = null, string? Status = null);

    // --- Catalog items ---

    public async Task<PagedResult<AdminCatalogItemDto>> ListCatalogItemsAsync(ContentFilter filter, CancellationToken ct)
    {
        var query = db.CatalogItems.IgnoreQueryFilters().AsQueryable();
        if (!string.IsNullOrEmpty(filter.Search))
        {
            var s = filter.Search.ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(s));
        }
        if (!string.IsNullOrEmpty(filter.Status)
            && Enum.TryParse<CatalogItemStatus>(filter.Status, true, out var st))
            query = query.Where(c => c.Status == st);

        query = query.OrderByDescending(c => c.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var rows = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(ct);

        var tenantUids = rows.Select(c => c.TenantId).Distinct().ToList();
        var biz = await db.Businesses.IgnoreQueryFilters()
            .Where(b => tenantUids.Contains(b.Uid))
            .Select(b => new { b.Uid, b.Name })
            .ToListAsync(ct);
        var bizMap = biz.ToDictionary(b => b.Uid, b => b.Name);

        var items = rows.Select(c => new AdminCatalogItemDto(
            c.Uid, c.Title, c.Type.ToString(), c.Status.ToString(),
            c.TenantId, bizMap.GetValueOrDefault(c.TenantId, ""),
            c.CreatedAt)).ToList();

        return new PagedResult<AdminCatalogItemDto>
        {
            Items = items, TotalCount = totalCount,
            Page = filter.Page, PageSize = filter.PageSize,
        };
    }

    public async Task<ServiceResult> HideCatalogItemAsync(Guid uid, CancellationToken ct)
    {
        var item = await db.CatalogItems.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (item is null) return ServiceResult.Fail("Item not found.", 404);
        item.Status = CatalogItemStatus.Hidden;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("catalog.hide", "CatalogItem", uid, new { item.Title }, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> FlagCatalogItemAsync(Guid uid, CancellationToken ct)
    {
        var item = await db.CatalogItems.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (item is null) return ServiceResult.Fail("Item not found.", 404);
        item.Status = CatalogItemStatus.Flagged;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("catalog.flag", "CatalogItem", uid, new { item.Title }, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteCatalogItemAsync(Guid uid, CancellationToken ct)
    {
        var item = await db.CatalogItems.IgnoreQueryFilters().FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (item is null) return ServiceResult.Fail("Item not found.", 404);
        item.Status = CatalogItemStatus.Archived;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("catalog.delete", "CatalogItem", uid, new { item.Title }, ct: ct);
        return ServiceResult.Ok();
    }

    // --- RFQs ---

    public async Task<PagedResult<AdminRfqDto>> ListRfqsAsync(ContentFilter filter, CancellationToken ct)
    {
        var query = db.Rfqs.IgnoreQueryFilters().AsQueryable();
        if (!string.IsNullOrEmpty(filter.Search))
        {
            var s = filter.Search.ToLower();
            query = query.Where(r => r.Title.ToLower().Contains(s));
        }
        if (!string.IsNullOrEmpty(filter.Status)
            && Enum.TryParse<RfqStatus>(filter.Status, true, out var st))
            query = query.Where(r => r.Status == st);

        query = query.OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var rows = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(ct);

        var tenantUids = rows.Select(r => r.TenantId).Distinct().ToList();
        var biz = await db.Businesses.IgnoreQueryFilters()
            .Where(b => tenantUids.Contains(b.Uid))
            .Select(b => new { b.Uid, b.Name })
            .ToListAsync(ct);
        var bizMap = biz.ToDictionary(b => b.Uid, b => b.Name);

        var items = rows.Select(r => new AdminRfqDto(
            r.Uid, r.Title, r.Status.ToString(), r.Moderation.ToString(),
            r.TenantId, bizMap.GetValueOrDefault(r.TenantId, ""),
            r.CreatedAt)).ToList();

        return new PagedResult<AdminRfqDto>
        {
            Items = items, TotalCount = totalCount,
            Page = filter.Page, PageSize = filter.PageSize,
        };
    }

    public async Task<ServiceResult> HideRfqAsync(Guid uid, CancellationToken ct)
        => await ModerateRfqAsync(uid, ModerationStatus.Hidden, "rfq.hide", ct);
    public async Task<ServiceResult> FlagRfqAsync(Guid uid, CancellationToken ct)
        => await ModerateRfqAsync(uid, ModerationStatus.Flagged, "rfq.flag", ct);
    public async Task<ServiceResult> DeleteRfqAsync(Guid uid, CancellationToken ct)
    {
        var rfq = await db.Rfqs.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Uid == uid, ct);
        if (rfq is null) return ServiceResult.Fail("RFQ not found.", 404);
        rfq.Status = RfqStatus.Cancelled;
        rfq.Moderation = ModerationStatus.Hidden;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("rfq.delete", "Rfq", uid, new { rfq.Title }, ct: ct);
        return ServiceResult.Ok();
    }

    private async Task<ServiceResult> ModerateRfqAsync(Guid uid, ModerationStatus status, string action, CancellationToken ct)
    {
        var rfq = await db.Rfqs.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Uid == uid, ct);
        if (rfq is null) return ServiceResult.Fail("RFQ not found.", 404);
        rfq.Moderation = status;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync(action, "Rfq", uid, new { rfq.Title }, ct: ct);
        return ServiceResult.Ok();
    }

    // --- Reviews ---

    public async Task<PagedResult<AdminReviewDto>> ListReviewsAsync(ContentFilter filter, CancellationToken ct)
    {
        var query = db.Reviews.AsQueryable();

        query = query.OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var rows = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(ct);

        var bizUids = rows.SelectMany(r => new[] { r.ReviewerBusinessUid, r.ReviewedBusinessUid }).Distinct().ToList();
        var biz = await db.Businesses.IgnoreQueryFilters()
            .Where(b => bizUids.Contains(b.Uid))
            .Select(b => new { b.Uid, b.Name })
            .ToListAsync(ct);
        var bizMap = biz.ToDictionary(b => b.Uid, b => b.Name);

        var items = rows.Select(r => new AdminReviewDto(
            r.Uid, r.OverallRating, r.Comment, r.Moderation.ToString(),
            r.ReviewerBusinessUid, r.ReviewedBusinessUid,
            bizMap.GetValueOrDefault(r.ReviewerBusinessUid),
            bizMap.GetValueOrDefault(r.ReviewedBusinessUid),
            r.CreatedAt)).ToList();

        return new PagedResult<AdminReviewDto>
        {
            Items = items, TotalCount = totalCount,
            Page = filter.Page, PageSize = filter.PageSize,
        };
    }

    public async Task<ServiceResult> HideReviewAsync(Guid uid, CancellationToken ct)
        => await ModerateReviewAsync(uid, ModerationStatus.Hidden, "review.hide", ct);
    public async Task<ServiceResult> FlagReviewAsync(Guid uid, CancellationToken ct)
        => await ModerateReviewAsync(uid, ModerationStatus.Flagged, "review.flag", ct);
    public async Task<ServiceResult> DeleteReviewAsync(Guid uid, CancellationToken ct)
    {
        var review = await db.Reviews.FirstOrDefaultAsync(r => r.Uid == uid, ct);
        if (review is null) return ServiceResult.Fail("Review not found.", 404);
        review.Moderation = ModerationStatus.Hidden;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("review.delete", "Review", uid, ct: ct);
        return ServiceResult.Ok();
    }

    private async Task<ServiceResult> ModerateReviewAsync(Guid uid, ModerationStatus status, string action, CancellationToken ct)
    {
        var review = await db.Reviews.FirstOrDefaultAsync(r => r.Uid == uid, ct);
        if (review is null) return ServiceResult.Fail("Review not found.", 404);
        review.Moderation = status;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync(action, "Review", uid, ct: ct);
        return ServiceResult.Ok();
    }
}
