using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Infrastructure.Services;

/// <summary>
/// Composite trust score over reviews + compliance + RFQ activity + recency.
/// Weights are tuned for MVP; revisit once we have real data in Sprint 7+.
/// </summary>
public class TrustScoreService(AppDbContext db, IUnitOfWork uow)
{
    // Weights sum to 1.0
    private const double ReviewWeight = 0.45;
    private const double ComplianceWeight = 0.25;
    private const double ResponseWeight = 0.20;
    private const double RecencyWeight = 0.10;

    public record TrustScoreBreakdown(
        decimal Total,
        decimal ReviewScore, int ReviewCount,
        decimal ComplianceScore, int ComplianceVerifiedCount, int ComplianceTotalCount,
        decimal ResponseScore, int RfqQuotedCount, int RfqInvitedCount,
        decimal RecencyScore, DateTime? LastActivityAt);

    public async Task<TrustScoreBreakdown> ComputeAsync(Guid businessUid, CancellationToken ct)
    {
        // --- Reviews (0-1 from average * rating/5) ---
        var reviewAggregates = await db.Reviews
            .Where(r => r.ReviewedBusinessUid == businessUid)
            .GroupBy(r => 1)
            .Select(g => new { Avg = g.Average(r => (double)r.OverallRating), Count = g.Count() })
            .FirstOrDefaultAsync(ct);

        var reviewScore = reviewAggregates is null ? 0.0 : reviewAggregates.Avg / 5.0;
        var reviewCount = reviewAggregates?.Count ?? 0;

        // --- Compliance ratio of verified / total ---
        var totalDocs = await db.ComplianceDocuments.IgnoreQueryFilters()
            .CountAsync(d => d.TenantId == businessUid, ct);
        var verifiedDocs = await db.ComplianceDocuments.IgnoreQueryFilters()
            .CountAsync(d => d.TenantId == businessUid && d.Status == ComplianceDocumentStatus.Verified, ct);
        var complianceScore = totalDocs == 0 ? 0.0 : (double)verifiedDocs / totalDocs;

        // --- RFQ response rate: quotes submitted / RFQs invited to ---
        var invitedCount = await db.RfqTargets
            .CountAsync(t => t.TargetBusinessUid == businessUid, ct);
        var quotedCount = await db.Quotes.IgnoreQueryFilters()
            .CountAsync(q => q.TenantId == businessUid
                && q.Status != QuoteStatus.Draft
                && q.Status != QuoteStatus.Withdrawn, ct);
        var responseScore = invitedCount == 0 ? 0.0 : Math.Min(1.0, (double)quotedCount / Math.Max(invitedCount, 1));

        // --- Recency: decays from 1.0 (today) to 0 after 90 days since last activity ---
        var latest = await GetLastActivityAsync(businessUid, ct);
        var recencyScore = 0.0;
        if (latest is not null)
        {
            var ageDays = (DateTime.UtcNow - latest.Value).TotalDays;
            recencyScore = Math.Max(0.0, 1.0 - (ageDays / 90.0));
        }

        var total = ReviewWeight * reviewScore
                  + ComplianceWeight * complianceScore
                  + ResponseWeight * responseScore
                  + RecencyWeight * recencyScore;

        // Scale 0..1 to 0..5 for display consistency with review average
        var total5 = Math.Round(total * 5.0, 2);

        return new TrustScoreBreakdown(
            (decimal)total5,
            (decimal)Math.Round(reviewScore * 5.0, 2), reviewCount,
            (decimal)Math.Round(complianceScore * 5.0, 2), verifiedDocs, totalDocs,
            (decimal)Math.Round(responseScore * 5.0, 2), quotedCount, invitedCount,
            (decimal)Math.Round(recencyScore * 5.0, 2), latest);
    }

    public async Task RecomputeAllAsync(CancellationToken ct)
    {
        var businessUids = await db.Businesses.IgnoreQueryFilters()
            .Where(b => b.IsActive)
            .Select(b => b.Uid)
            .ToListAsync(ct);

        foreach (var uid in businessUids)
        {
            var breakdown = await ComputeAsync(uid, ct);
            var business = await db.Businesses.IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.Uid == uid, ct);
            if (business is null) continue;
            business.TrustScore = breakdown.Total;
        }
        await uow.SaveChangesAsync(ct);
    }

    public async Task<decimal> RecomputeOneAsync(Guid businessUid, CancellationToken ct)
    {
        var business = await db.Businesses.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == businessUid, ct);
        if (business is null) return 0m;

        var breakdown = await ComputeAsync(businessUid, ct);
        business.TrustScore = breakdown.Total;
        await uow.SaveChangesAsync(ct);
        return breakdown.Total;
    }

    private async Task<DateTime?> GetLastActivityAsync(Guid businessUid, CancellationToken ct)
    {
        var candidates = new List<DateTime>();

        var lastQuote = await db.Quotes.IgnoreQueryFilters()
            .Where(q => q.TenantId == businessUid)
            .OrderByDescending(q => q.UpdatedAt)
            .Select(q => (DateTime?)q.UpdatedAt)
            .FirstOrDefaultAsync(ct);
        if (lastQuote.HasValue) candidates.Add(lastQuote.Value);

        var lastRfq = await db.Rfqs.IgnoreQueryFilters()
            .Where(r => r.TenantId == businessUid)
            .OrderByDescending(r => r.UpdatedAt)
            .Select(r => (DateTime?)r.UpdatedAt)
            .FirstOrDefaultAsync(ct);
        if (lastRfq.HasValue) candidates.Add(lastRfq.Value);

        var lastCatalog = await db.CatalogItems.IgnoreQueryFilters()
            .Where(c => c.TenantId == businessUid)
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => (DateTime?)c.UpdatedAt)
            .FirstOrDefaultAsync(ct);
        if (lastCatalog.HasValue) candidates.Add(lastCatalog.Value);

        return candidates.Count == 0 ? null : candidates.Max();
    }
}
