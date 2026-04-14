using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Infrastructure.Services;

public class DealConfirmationsService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant)
{
    public record DealConfirmationDto(
        Guid Uid, Guid? RfqUid, string? RfqTitle, Guid? QuoteUid,
        Guid BuyerBusinessUid, string BuyerBusinessName,
        Guid SupplierBusinessUid, string SupplierBusinessName,
        bool BuyerConfirmed, DateTime? BuyerConfirmedAt,
        bool SupplierConfirmed, DateTime? SupplierConfirmedAt,
        DateTime? ConfirmedAt, decimal? DealValue, string? CurrencyCode,
        DateTime CreatedAt);

    public record CreateStandaloneRequest(
        Guid CounterpartyBusinessUid, bool CurrentTenantIsBuyer,
        decimal? DealValue, string? CurrencyCode);

    // --- Pending confirmations where current tenant still needs to confirm ---
    public async Task<List<DealConfirmationDto>> GetPendingAsync(CancellationToken ct)
    {
        var deals = await db.DealConfirmations
            .Where(d => (d.BuyerBusinessUid == tenant.TenantId && !d.BuyerConfirmed)
                     || (d.SupplierBusinessUid == tenant.TenantId && !d.SupplierConfirmed))
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(ct);

        return await MapManyAsync(deals, ct);
    }

    // --- All deals involving current tenant ---
    public async Task<List<DealConfirmationDto>> GetMineAsync(CancellationToken ct)
    {
        var deals = await db.DealConfirmations
            .Where(d => d.BuyerBusinessUid == tenant.TenantId
                     || d.SupplierBusinessUid == tenant.TenantId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(ct);
        return await MapManyAsync(deals, ct);
    }

    public async Task<ServiceResult<DealConfirmationDto>> GetByUidAsync(Guid uid, CancellationToken ct)
    {
        var deal = await db.DealConfirmations.FirstOrDefaultAsync(d => d.Uid == uid, ct);
        if (deal is null)
            return ServiceResult<DealConfirmationDto>.Fail("Deal confirmation not found.", 404);
        if (deal.BuyerBusinessUid != tenant.TenantId && deal.SupplierBusinessUid != tenant.TenantId)
            return ServiceResult<DealConfirmationDto>.Fail("Not authorized.", 403);

        return ServiceResult<DealConfirmationDto>.Ok((await MapManyAsync([deal], ct)).First());
    }

    // --- Confirm ---
    public async Task<ServiceResult> ConfirmAsync(Guid uid, CancellationToken ct)
    {
        var deal = await db.DealConfirmations.FirstOrDefaultAsync(d => d.Uid == uid, ct);
        if (deal is null) return ServiceResult.Fail("Deal confirmation not found.", 404);

        var now = DateTime.UtcNow;

        if (deal.BuyerBusinessUid == tenant.TenantId)
        {
            if (deal.BuyerConfirmed) return ServiceResult.Fail("Already confirmed.", 409);
            deal.BuyerConfirmed = true;
            deal.BuyerConfirmedAt = now;
        }
        else if (deal.SupplierBusinessUid == tenant.TenantId)
        {
            if (deal.SupplierConfirmed) return ServiceResult.Fail("Already confirmed.", 409);
            deal.SupplierConfirmed = true;
            deal.SupplierConfirmedAt = now;
        }
        else
        {
            return ServiceResult.Fail("Not a party to this deal.", 403);
        }

        if (deal.BuyerConfirmed && deal.SupplierConfirmed && deal.ConfirmedAt is null)
            deal.ConfirmedAt = now;

        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    // --- Standalone (off-platform) confirmation ---
    public async Task<ServiceResult<DealConfirmationDto>> CreateStandaloneAsync(
        CreateStandaloneRequest req, CancellationToken ct)
    {
        var counterparty = await db.Businesses.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == req.CounterpartyBusinessUid, ct);
        if (counterparty is null)
            return ServiceResult<DealConfirmationDto>.Fail("Counterparty not found.", 404);

        var deal = new DealConfirmation
        {
            BuyerBusinessUid = req.CurrentTenantIsBuyer ? tenant.TenantId : counterparty.Uid,
            SupplierBusinessUid = req.CurrentTenantIsBuyer ? counterparty.Uid : tenant.TenantId,
            DealValue = req.DealValue,
            CurrencyCode = req.CurrencyCode
        };
        db.DealConfirmations.Add(deal);
        await uow.SaveChangesAsync(ct);

        return ServiceResult<DealConfirmationDto>.Created(
            (await MapManyAsync([deal], ct)).First());
    }

    private async Task<List<DealConfirmationDto>> MapManyAsync(List<DealConfirmation> deals, CancellationToken ct)
    {
        if (deals.Count == 0) return [];

        var partyUids = deals.SelectMany(d => new[] { d.BuyerBusinessUid, d.SupplierBusinessUid })
            .Distinct().ToList();
        var businesses = await db.Businesses.IgnoreQueryFilters()
            .Where(b => partyUids.Contains(b.Uid))
            .ToDictionaryAsync(b => b.Uid, b => b.Name, ct);

        var rfqIds = deals.Where(d => d.RfqId.HasValue).Select(d => d.RfqId!.Value).Distinct().ToList();
        var rfqs = await db.Rfqs.IgnoreQueryFilters()
            .Where(r => rfqIds.Contains(r.Id))
            .ToDictionaryAsync(r => r.Id, r => new { r.Uid, r.Title }, ct);

        var quoteIds = deals.Where(d => d.QuoteId.HasValue).Select(d => d.QuoteId!.Value).Distinct().ToList();
        var quotes = await db.Quotes.IgnoreQueryFilters()
            .Where(q => quoteIds.Contains(q.Id))
            .ToDictionaryAsync(q => q.Id, q => q.Uid, ct);

        return deals.Select(d => new DealConfirmationDto(
            d.Uid,
            d.RfqId.HasValue && rfqs.ContainsKey(d.RfqId.Value) ? rfqs[d.RfqId.Value].Uid : null,
            d.RfqId.HasValue && rfqs.ContainsKey(d.RfqId.Value) ? rfqs[d.RfqId.Value].Title : null,
            d.QuoteId.HasValue && quotes.ContainsKey(d.QuoteId.Value) ? quotes[d.QuoteId.Value] : null,
            d.BuyerBusinessUid, businesses.GetValueOrDefault(d.BuyerBusinessUid, ""),
            d.SupplierBusinessUid, businesses.GetValueOrDefault(d.SupplierBusinessUid, ""),
            d.BuyerConfirmed, d.BuyerConfirmedAt,
            d.SupplierConfirmed, d.SupplierConfirmedAt,
            d.ConfirmedAt, d.DealValue, d.CurrencyCode,
            d.CreatedAt)).ToList();
    }
}
