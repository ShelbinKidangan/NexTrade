using MassTransit;
using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared.Contracts.Rfq;

namespace NexTrade.Infrastructure.Services;

public class QuoteService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant, IPublishEndpoint bus)
{
    // --- DTOs ---
    public record QuoteItemDto(
        long Id, long? RfqItemId, decimal UnitPrice, decimal Quantity,
        decimal TotalPrice, int? LeadTimeDays,
        decimal? MinOrderQuantity, string? Incoterms,
        string? Notes, int SortOrder);

    public record QuoteDto(
        Guid Uid, Guid RfqUid, Guid SupplierBusinessUid, string SupplierBusinessName,
        bool SupplierVerified, decimal SupplierTrustScore,
        string Status, decimal? TotalAmount, string? CurrencyCode,
        DateTime? ValidUntil, string? Notes, List<string> Attachments,
        List<QuoteItemDto> Items, DateTime CreatedAt, DateTime UpdatedAt);

    public record CreateQuoteItemRequest(
        long? RfqItemId, decimal UnitPrice, decimal Quantity,
        decimal TotalPrice, int? LeadTimeDays,
        decimal? MinOrderQuantity, string? Incoterms,
        string? Notes, int SortOrder = 0);

    public record CreateQuoteRequest(
        decimal? TotalAmount, string? CurrencyCode, DateTime? ValidUntil, string? Notes,
        List<string>? Attachments, List<CreateQuoteItemRequest> Items);

    public record UpdateQuoteRequest(
        decimal? TotalAmount, string? CurrencyCode, DateTime? ValidUntil, string? Notes,
        List<string>? Attachments, List<CreateQuoteItemRequest>? Items);

    public record AwardRequest(Guid QuoteUid);

    public record ComparisonDto(
        Guid RfqUid, string RfqTitle, List<QuoteDto> Quotes, List<ComparisonRowDto> Rows);

    public record ComparisonRowDto(long? RfqItemId, string Description, List<ComparisonCellDto> Cells);

    public record ComparisonCellDto(Guid QuoteUid, decimal? UnitPrice, decimal? TotalPrice, int? LeadTimeDays);

    // --- Quotes on an RFQ: buyer sees all, supplier sees only own ---
    public async Task<List<QuoteDto>> GetForRfqAsync(Guid rfqUid, CancellationToken ct)
    {
        var rfq = await db.Rfqs.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Uid == rfqUid, ct);
        if (rfq is null) return [];

        var isBuyer = rfq.TenantId == tenant.TenantId;

        var query = db.Quotes.IgnoreQueryFilters()
            .Include(q => q.Items)
            .Where(q => q.RfqId == rfq.Id);

        if (!isBuyer)
            query = query.Where(q => q.TenantId == tenant.TenantId);
        else
            query = query.Where(q => q.Status != QuoteStatus.Draft && q.Status != QuoteStatus.Withdrawn);

        var quotes = await query.OrderByDescending(q => q.CreatedAt).ToListAsync(ct);
        return await MapQuotesWithSuppliersAsync(quotes, ct);
    }

    // --- Submit / create a quote for an RFQ ---
    public async Task<ServiceResult<QuoteDto>> CreateForRfqAsync(Guid rfqUid, CreateQuoteRequest req, CancellationToken ct)
    {
        var rfq = await db.Rfqs.IgnoreQueryFilters()
            .Include(r => r.Targets)
            .FirstOrDefaultAsync(r => r.Uid == rfqUid, ct);
        if (rfq is null) return ServiceResult<QuoteDto>.Fail("RFQ not found.", 404);
        if (rfq.Status != RfqStatus.Open) return ServiceResult<QuoteDto>.Fail("RFQ is not open for quotes.", 409);

        // Cannot quote your own RFQ
        if (rfq.TenantId == tenant.TenantId)
            return ServiceResult<QuoteDto>.Fail("You cannot submit a quote on your own RFQ.", 400);

        // If targeted, must be a target
        if (rfq.Visibility == RfqVisibility.Targeted
            && !rfq.Targets.Any(t => t.TargetBusinessUid == tenant.TenantId))
            return ServiceResult<QuoteDto>.Fail("This RFQ is not open to you.", 403);

        // Uniqueness: one quote per (rfq, supplier tenant)
        var existing = await db.Quotes.IgnoreQueryFilters()
            .FirstOrDefaultAsync(q => q.RfqId == rfq.Id && q.TenantId == tenant.TenantId, ct);
        if (existing is not null)
            return ServiceResult<QuoteDto>.Fail("You already have a quote on this RFQ — update it instead.", 409);

        var quote = new Quote
        {
            RfqId = rfq.Id,
            Status = QuoteStatus.Draft,
            TotalAmount = req.TotalAmount,
            CurrencyCode = req.CurrencyCode,
            ValidUntil = req.ValidUntil,
            Notes = req.Notes,
            Attachments = req.Attachments ?? []
        };
        foreach (var i in req.Items)
            quote.Items.Add(new QuoteItem
            {
                RfqItemId = i.RfqItemId,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                TotalPrice = i.TotalPrice,
                LeadTimeDays = i.LeadTimeDays,
                MinOrderQuantity = i.MinOrderQuantity,
                Incoterms = i.Incoterms,
                Notes = i.Notes,
                SortOrder = i.SortOrder
            });

        db.Quotes.Add(quote);
        await uow.SaveChangesAsync(ct);

        return ServiceResult<QuoteDto>.Created(
            (await MapQuotesWithSuppliersAsync([quote], ct)).First());
    }

    // --- Update a quote while RFQ is Open ---
    public async Task<ServiceResult<QuoteDto>> UpdateAsync(Guid uid, UpdateQuoteRequest req, CancellationToken ct)
    {
        var quote = await db.Quotes
            .Include(q => q.Items)
            .Include(q => q.Rfq)
            .FirstOrDefaultAsync(q => q.Uid == uid, ct);
        if (quote is null) return ServiceResult<QuoteDto>.Fail("Quote not found.", 404);
        if (quote.Rfq.Status != RfqStatus.Open)
            return ServiceResult<QuoteDto>.Fail("RFQ is not open — quote cannot be edited.", 409);
        if (quote.Status is QuoteStatus.Accepted or QuoteStatus.Rejected or QuoteStatus.Withdrawn)
            return ServiceResult<QuoteDto>.Fail("Quote is locked in its current state.", 409);

        if (req.TotalAmount is not null) quote.TotalAmount = req.TotalAmount;
        if (req.CurrencyCode is not null) quote.CurrencyCode = req.CurrencyCode;
        if (req.ValidUntil is not null) quote.ValidUntil = req.ValidUntil;
        if (req.Notes is not null) quote.Notes = req.Notes;
        if (req.Attachments is not null) quote.Attachments = req.Attachments;

        if (req.Items is not null)
        {
            db.QuoteItems.RemoveRange(quote.Items);
            quote.Items.Clear();
            foreach (var i in req.Items)
                quote.Items.Add(new QuoteItem
                {
                    RfqItemId = i.RfqItemId,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    TotalPrice = i.TotalPrice,
                    LeadTimeDays = i.LeadTimeDays,
                    MinOrderQuantity = i.MinOrderQuantity,
                    Incoterms = i.Incoterms,
                    Notes = i.Notes,
                    SortOrder = i.SortOrder
                });
        }

        // Revising a previously-submitted quote
        if (quote.Status == QuoteStatus.Submitted) quote.Status = QuoteStatus.Revised;

        await uow.SaveChangesAsync(ct);
        return ServiceResult<QuoteDto>.Ok(
            (await MapQuotesWithSuppliersAsync([quote], ct)).First());
    }

    // --- Submit (Draft → Submitted) ---
    public async Task<ServiceResult> SubmitAsync(Guid uid, CancellationToken ct)
    {
        var quote = await db.Quotes
            .Include(q => q.Rfq)
            .FirstOrDefaultAsync(q => q.Uid == uid, ct);
        if (quote is null) return ServiceResult.Fail("Quote not found.", 404);
        if (quote.Rfq.Status != RfqStatus.Open) return ServiceResult.Fail("RFQ is not open.", 409);
        if (quote.Status != QuoteStatus.Draft && quote.Status != QuoteStatus.Revised)
            return ServiceResult.Fail("Only Draft or Revised quotes can be submitted.", 409);

        quote.Status = QuoteStatus.Submitted;
        await uow.SaveChangesAsync(ct);

        var supplier = await db.Businesses.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == quote.TenantId, ct);

        await bus.Publish(new QuoteSubmittedEvent(
            quote.Uid, quote.Rfq.Uid, quote.Rfq.Title,
            quote.Rfq.TenantId, quote.TenantId, supplier?.Name ?? "",
            quote.TotalAmount, quote.CurrencyCode), ct);

        return ServiceResult.Ok();
    }

    // --- Withdraw ---
    public async Task<ServiceResult> WithdrawAsync(Guid uid, CancellationToken ct)
    {
        var quote = await db.Quotes.FirstOrDefaultAsync(q => q.Uid == uid, ct);
        if (quote is null) return ServiceResult.Fail("Quote not found.", 404);
        if (quote.Status is QuoteStatus.Accepted or QuoteStatus.Rejected)
            return ServiceResult.Fail("Cannot withdraw a quote in its terminal state.", 409);
        quote.Status = QuoteStatus.Withdrawn;
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    // --- Side-by-side comparison (buyer only) ---
    public async Task<ServiceResult<ComparisonDto>> GetComparisonAsync(Guid rfqUid, CancellationToken ct)
    {
        var rfq = await db.Rfqs.IgnoreQueryFilters()
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Uid == rfqUid, ct);
        if (rfq is null) return ServiceResult<ComparisonDto>.Fail("RFQ not found.", 404);
        if (rfq.TenantId != tenant.TenantId)
            return ServiceResult<ComparisonDto>.Fail("Only the buyer can view the comparison.", 403);

        var quotes = await db.Quotes.IgnoreQueryFilters()
            .Include(q => q.Items)
            .Where(q => q.RfqId == rfq.Id
                && q.Status != QuoteStatus.Draft
                && q.Status != QuoteStatus.Withdrawn)
            .ToListAsync(ct);

        var quoteDtos = await MapQuotesWithSuppliersAsync(quotes, ct);

        var rows = rfq.Items.OrderBy(i => i.SortOrder).Select(item => new ComparisonRowDto(
            item.Id, item.Description,
            quotes.Select(q =>
            {
                var qi = q.Items.FirstOrDefault(x => x.RfqItemId == item.Id);
                return new ComparisonCellDto(q.Uid,
                    qi?.UnitPrice, qi?.TotalPrice, qi?.LeadTimeDays);
            }).ToList())).ToList();

        return ServiceResult<ComparisonDto>.Ok(new ComparisonDto(rfq.Uid, rfq.Title, quoteDtos, rows));
    }

    // --- Award ---
    public async Task<ServiceResult> AwardAsync(Guid rfqUid, AwardRequest req, CancellationToken ct)
    {
        var rfq = await db.Rfqs
            .Include(r => r.Quotes)
            .FirstOrDefaultAsync(r => r.Uid == rfqUid, ct);
        if (rfq is null) return ServiceResult.Fail("RFQ not found.", 404);
        if (rfq.Status != RfqStatus.Open && rfq.Status != RfqStatus.Closed)
            return ServiceResult.Fail("RFQ must be Open or Closed to award.", 409);

        // Load all quotes for this RFQ (buyer owns the RFQ so they're in-tenant)
        var winning = await db.Quotes.IgnoreQueryFilters()
            .FirstOrDefaultAsync(q => q.Uid == req.QuoteUid && q.RfqId == rfq.Id, ct);
        if (winning is null) return ServiceResult.Fail("Quote not found on this RFQ.", 404);

        var allQuotes = await db.Quotes.IgnoreQueryFilters()
            .Where(q => q.RfqId == rfq.Id).ToListAsync(ct);

        foreach (var q in allQuotes)
        {
            q.Status = q.Id == winning.Id ? QuoteStatus.Accepted : QuoteStatus.Rejected;
        }
        rfq.Status = RfqStatus.Awarded;

        // Create deal confirmation (platform-scoped, cross-tenant)
        var deal = new DealConfirmation
        {
            RfqId = rfq.Id,
            QuoteId = winning.Id,
            BuyerBusinessUid = rfq.TenantId,
            SupplierBusinessUid = winning.TenantId,
            CurrencyCode = winning.CurrencyCode,
            DealValue = winning.TotalAmount
        };
        db.DealConfirmations.Add(deal);

        await uow.SaveChangesAsync(ct);

        var supplier = await db.Businesses.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == winning.TenantId, ct);

        await bus.Publish(new RfqAwardedEvent(
            rfq.Uid, rfq.Title, rfq.TenantId,
            winning.Uid, winning.TenantId, supplier?.Name ?? "",
            allQuotes.Where(q => q.Id != winning.Id).Select(q => q.TenantId).Distinct().ToList()), ct);

        return ServiceResult.Ok();
    }

    // --- helpers ---

    private async Task<List<QuoteDto>> MapQuotesWithSuppliersAsync(List<Quote> quotes, CancellationToken ct)
    {
        if (quotes.Count == 0) return [];

        var rfqIds = quotes.Select(q => q.RfqId).Distinct().ToList();
        var rfqs = await db.Rfqs.IgnoreQueryFilters()
            .Where(r => rfqIds.Contains(r.Id))
            .ToDictionaryAsync(r => r.Id, r => r.Uid, ct);

        var supplierUids = quotes.Select(q => q.TenantId).Distinct().ToList();
        var suppliers = await db.Businesses.IgnoreQueryFilters()
            .Where(b => supplierUids.Contains(b.Uid))
            .ToDictionaryAsync(b => b.Uid, b => b, ct);

        return quotes.Select(q =>
        {
            suppliers.TryGetValue(q.TenantId, out var s);
            return new QuoteDto(
                q.Uid, rfqs.GetValueOrDefault(q.RfqId),
                q.TenantId, s?.Name ?? "", s?.IsVerified ?? false, s?.TrustScore ?? 0m,
                q.Status.ToString(), q.TotalAmount, q.CurrencyCode,
                q.ValidUntil, q.Notes, q.Attachments,
                q.Items.OrderBy(i => i.SortOrder).Select(i => new QuoteItemDto(
                    i.Id, i.RfqItemId, i.UnitPrice, i.Quantity, i.TotalPrice,
                    i.LeadTimeDays, i.MinOrderQuantity, i.Incoterms,
                    i.Notes, i.SortOrder)).ToList(),
                q.CreatedAt, q.UpdatedAt);
        }).ToList();
    }
}
