using MassTransit;
using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;
using NexTrade.Shared.Contracts.Rfq;

namespace NexTrade.Infrastructure.Services;

public class RfqService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant, IPublishEndpoint bus)
{
    // --- DTOs ---
    public record RfqItemDto(
        long Id, string Description, string? Specifications,
        decimal? Quantity, string? UnitOfMeasure, Guid? CategoryUid, int SortOrder);

    public record RfqTargetDto(Guid SupplierBusinessUid, string? SupplierName, DateTime? SentAt);

    public record RfqDto(
        Guid Uid, Guid BuyerBusinessUid, string BuyerBusinessName,
        string Title, string? Description, string Visibility, string Status,
        DateTime? ResponseDeadline, string? DeliveryLocation, string? DeliveryTimeline,
        List<string> Attachments, int ItemCount, int QuoteCount, DateTime CreatedAt);

    public record RfqDetailDto(
        Guid Uid, Guid BuyerBusinessUid, string BuyerBusinessName,
        string Title, string? Description, string Visibility, string Status,
        DateTime? ResponseDeadline, string? DeliveryLocation, string? DeliveryTimeline,
        List<string> Attachments, List<RfqItemDto> Items, List<RfqTargetDto> Targets,
        DateTime CreatedAt);

    public record CreateRfqItemRequest(
        string Description, string? Specifications, decimal? Quantity,
        string? UnitOfMeasure, Guid? CategoryUid, int SortOrder = 0);

    public record CreateRfqRequest(
        string Title, string? Description, RfqVisibility Visibility,
        DateTime? ResponseDeadline, string? DeliveryLocation, string? DeliveryTimeline,
        List<string>? Attachments, List<CreateRfqItemRequest> Items,
        List<Guid>? TargetedSupplierUids);

    public record UpdateRfqRequest(
        string? Title, string? Description, RfqVisibility? Visibility,
        DateTime? ResponseDeadline, string? DeliveryLocation, string? DeliveryTimeline,
        List<string>? Attachments, List<CreateRfqItemRequest>? Items,
        List<Guid>? TargetedSupplierUids);

    public record RfqFilter(int Page = 1, int PageSize = 20, string? Search = null, RfqStatus? Status = null);

    // --- Tenant's own RFQs (as buyer) ---
    public async Task<PagedResult<RfqDto>> GetMineAsync(RfqFilter filter, CancellationToken ct)
    {
        var query = db.Rfqs
            .Include(r => r.Items)
            .Include(r => r.Quotes)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(r => r.Title.ToLower().Contains(filter.Search.ToLower()));
        if (filter.Status is not null)
            query = query.Where(r => r.Status == filter.Status);

        query = query.OrderByDescending(r => r.CreatedAt);

        return await query.ToPagedResultAsync(filter.Page, filter.PageSize, MapToListDto, ct);
    }

    // --- Public RFQ feed (platform-scoped) ---
    public async Task<PagedResult<RfqDto>> GetPublicAsync(RfqFilter filter, CancellationToken ct)
    {
        var query = db.Rfqs
            .IgnoreQueryFilters()
            .Include(r => r.Items)
            .Include(r => r.Quotes)
            .Where(r => r.Visibility == RfqVisibility.Public && r.Status == RfqStatus.Open
                && r.Moderation == ModerationStatus.Active);

        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(r => r.Title.ToLower().Contains(filter.Search.ToLower()));

        query = query.OrderByDescending(r => r.CreatedAt);

        return await query.ToPagedResultAsync(filter.Page, filter.PageSize, MapToListDto, ct);
    }

    // --- RFQs targeted at the current tenant ---
    public async Task<PagedResult<RfqDto>> GetTargetedAsync(RfqFilter filter, CancellationToken ct)
    {
        var query = db.Rfqs
            .IgnoreQueryFilters()
            .Include(r => r.Items)
            .Include(r => r.Quotes)
            .Include(r => r.Targets)
            .Where(r => r.Targets.Any(t => t.TargetBusinessUid == tenant.TenantId)
                        && r.Status != RfqStatus.Draft);

        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(r => r.Title.ToLower().Contains(filter.Search.ToLower()));
        if (filter.Status is not null)
            query = query.Where(r => r.Status == filter.Status);

        query = query.OrderByDescending(r => r.CreatedAt);

        return await query.ToPagedResultAsync(filter.Page, filter.PageSize, MapToListDto, ct);
    }

    // --- Single RFQ ---
    public async Task<ServiceResult<RfqDetailDto>> GetByUidAsync(Guid uid, CancellationToken ct)
    {
        var rfq = await db.Rfqs
            .IgnoreQueryFilters()
            .Include(r => r.Items)
            .Include(r => r.Targets)
            .FirstOrDefaultAsync(r => r.Uid == uid, ct);

        if (rfq is null)
            return ServiceResult<RfqDetailDto>.Fail("RFQ not found.", 404);

        // Access check: buyer (owner), targeted supplier, or public + open
        var isOwner = rfq.TenantId == tenant.TenantId;
        var isTarget = rfq.Targets.Any(t => t.TargetBusinessUid == tenant.TenantId);
        var isPublicOpen = rfq.Visibility == RfqVisibility.Public && rfq.Status == RfqStatus.Open;
        if (!isOwner && !isTarget && !isPublicOpen)
            return ServiceResult<RfqDetailDto>.Fail("RFQ not found.", 404);

        var buyer = await db.Businesses.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == rfq.TenantId, ct);

        var targetUids = rfq.Targets.Select(t => t.TargetBusinessUid).ToList();
        var targetBusinesses = await db.Businesses.IgnoreQueryFilters()
            .Where(b => targetUids.Contains(b.Uid))
            .ToDictionaryAsync(b => b.Uid, b => b.Name, ct);

        return ServiceResult<RfqDetailDto>.Ok(new RfqDetailDto(
            rfq.Uid, rfq.TenantId, buyer?.Name ?? "",
            rfq.Title, rfq.Description, rfq.Visibility.ToString(), rfq.Status.ToString(),
            rfq.ResponseDeadline, rfq.DeliveryLocation, rfq.DeliveryTimeline,
            rfq.Attachments,
            rfq.Items.OrderBy(i => i.SortOrder).Select(i => new RfqItemDto(
                i.Id, i.Description, i.Specifications, i.Quantity, i.UnitOfMeasure, null, i.SortOrder)).ToList(),
            rfq.Targets.Select(t => new RfqTargetDto(
                t.TargetBusinessUid,
                targetBusinesses.GetValueOrDefault(t.TargetBusinessUid),
                t.SentAt)).ToList(),
            rfq.CreatedAt));
    }

    // --- Create ---
    public async Task<ServiceResult<RfqDto>> CreateAsync(CreateRfqRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return ServiceResult<RfqDto>.Fail("Title is required.");
        if (req.Items is null || req.Items.Count == 0)
            return ServiceResult<RfqDto>.Fail("At least one line item is required.");

        var rfq = new Rfq
        {
            Title = req.Title,
            Description = req.Description,
            Visibility = req.Visibility,
            Status = RfqStatus.Draft,
            ResponseDeadline = req.ResponseDeadline,
            DeliveryLocation = req.DeliveryLocation,
            DeliveryTimeline = req.DeliveryTimeline,
            Attachments = req.Attachments ?? []
        };

        foreach (var i in req.Items)
            rfq.Items.Add(new RfqItem
            {
                Description = i.Description,
                Specifications = i.Specifications,
                Quantity = i.Quantity,
                UnitOfMeasure = i.UnitOfMeasure,
                SortOrder = i.SortOrder
            });

        if (req.Visibility == RfqVisibility.Targeted && req.TargetedSupplierUids is { Count: > 0 })
        {
            var uids = req.TargetedSupplierUids.Distinct().ToList();
            var validation = await ValidateSupplierUidsAsync(uids, ct);
            if (validation is not null) return validation.ToTyped<RfqDto>();
            foreach (var supplierUid in uids)
                rfq.Targets.Add(new RfqTarget { TargetBusinessUid = supplierUid });
        }

        db.Rfqs.Add(rfq);
        await uow.SaveChangesAsync(ct);

        return ServiceResult<RfqDto>.Created(MapToListDto(rfq));
    }

    // --- Update (Draft only) ---
    public async Task<ServiceResult<RfqDto>> UpdateAsync(Guid uid, UpdateRfqRequest req, CancellationToken ct)
    {
        var rfq = await db.Rfqs
            .Include(r => r.Items)
            .Include(r => r.Targets)
            .Include(r => r.Quotes)
            .FirstOrDefaultAsync(r => r.Uid == uid, ct);
        if (rfq is null) return ServiceResult<RfqDto>.Fail("RFQ not found.", 404);
        if (rfq.Status != RfqStatus.Draft) return ServiceResult<RfqDto>.Fail("Only Draft RFQs can be edited.", 409);

        if (req.Title is not null) rfq.Title = req.Title;
        if (req.Description is not null) rfq.Description = req.Description;
        if (req.Visibility is not null) rfq.Visibility = req.Visibility.Value;
        if (req.ResponseDeadline is not null) rfq.ResponseDeadline = req.ResponseDeadline;
        if (req.DeliveryLocation is not null) rfq.DeliveryLocation = req.DeliveryLocation;
        if (req.DeliveryTimeline is not null) rfq.DeliveryTimeline = req.DeliveryTimeline;
        if (req.Attachments is not null) rfq.Attachments = req.Attachments;

        if (req.Items is not null)
        {
            db.RfqItems.RemoveRange(rfq.Items);
            rfq.Items.Clear();
            foreach (var i in req.Items)
                rfq.Items.Add(new RfqItem
                {
                    Description = i.Description,
                    Specifications = i.Specifications,
                    Quantity = i.Quantity,
                    UnitOfMeasure = i.UnitOfMeasure,
                    SortOrder = i.SortOrder
                });
        }

        if (req.TargetedSupplierUids is not null)
        {
            var uids = req.TargetedSupplierUids.Distinct().ToList();
            if (uids.Count > 0)
            {
                var validation = await ValidateSupplierUidsAsync(uids, ct);
                if (validation is not null) return validation.ToTyped<RfqDto>();
            }
            db.RfqTargets.RemoveRange(rfq.Targets);
            rfq.Targets.Clear();
            foreach (var sUid in uids)
                rfq.Targets.Add(new RfqTarget { TargetBusinessUid = sUid });
        }

        await uow.SaveChangesAsync(ct);
        return ServiceResult<RfqDto>.Ok(MapToListDto(rfq));
    }

    // --- Publish ---
    public async Task<ServiceResult> PublishAsync(Guid uid, CancellationToken ct)
    {
        var rfq = await db.Rfqs
            .Include(r => r.Targets)
            .FirstOrDefaultAsync(r => r.Uid == uid, ct);
        if (rfq is null) return ServiceResult.Fail("RFQ not found.", 404);
        if (rfq.Status != RfqStatus.Draft) return ServiceResult.Fail("Only Draft RFQs can be published.", 409);
        if (rfq.Visibility == RfqVisibility.Targeted && rfq.Targets.Count == 0)
            return ServiceResult.Fail("Targeted RFQs must have at least one supplier.", 400);

        rfq.Status = RfqStatus.Open;
        var now = DateTime.UtcNow;
        foreach (var t in rfq.Targets) t.SentAt = now;

        await uow.SaveChangesAsync(ct);

        var buyer = await db.Businesses.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == rfq.TenantId, ct);

        await bus.Publish(new RfqPublishedEvent(
            rfq.Uid, rfq.TenantId, buyer?.Name ?? "",
            rfq.Title, rfq.Description, rfq.Visibility.ToString(), rfq.ResponseDeadline,
            rfq.Targets.Select(t => t.TargetBusinessUid).ToList()), ct);

        return ServiceResult.Ok();
    }

    // --- Close ---
    public async Task<ServiceResult> CloseAsync(Guid uid, CancellationToken ct)
    {
        var rfq = await db.Rfqs.FirstOrDefaultAsync(r => r.Uid == uid, ct);
        if (rfq is null) return ServiceResult.Fail("RFQ not found.", 404);
        if (rfq.Status != RfqStatus.Open) return ServiceResult.Fail("Only Open RFQs can be closed.", 409);
        rfq.Status = RfqStatus.Closed;
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    // --- Cancel ---
    public async Task<ServiceResult> CancelAsync(Guid uid, CancellationToken ct)
    {
        var rfq = await db.Rfqs.FirstOrDefaultAsync(r => r.Uid == uid, ct);
        if (rfq is null) return ServiceResult.Fail("RFQ not found.", 404);
        if (rfq.Status is RfqStatus.Awarded or RfqStatus.Cancelled)
            return ServiceResult.Fail("Cannot cancel an RFQ in its terminal state.", 409);
        rfq.Status = RfqStatus.Cancelled;
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    private async Task<ServiceResult?> ValidateSupplierUidsAsync(List<Guid> uids, CancellationToken ct)
    {
        var found = await db.Businesses.IgnoreQueryFilters()
            .Where(b => uids.Contains(b.Uid) && b.IsActive)
            .Select(b => b.Uid)
            .ToListAsync(ct);
        var missing = uids.Except(found).ToList();
        if (missing.Count == 0) return null;
        return ServiceResult.Fail(new Dictionary<string, string[]>
        {
            ["targetedSupplierUids"] = missing.Select(m => $"Supplier {m} not found.").ToArray()
        }, 400);
    }

    internal static RfqDto MapToListDto(Rfq r) => new(
        r.Uid, r.TenantId, "",
        r.Title, r.Description, r.Visibility.ToString(), r.Status.ToString(),
        r.ResponseDeadline, r.DeliveryLocation, r.DeliveryTimeline,
        r.Attachments, r.Items.Count, r.Quotes.Count, r.CreatedAt);
}
