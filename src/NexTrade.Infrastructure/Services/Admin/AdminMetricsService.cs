using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Enums;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Infrastructure.Services.Admin;

public class AdminMetricsService(AppDbContext db)
{
    public record OverviewDto(
        int BusinessesTotal, int BusinessesLast30d,
        int VerifiedBusinesses, decimal VerifiedRate,
        int PublishedItems, int OpenRfqs, int DealsConfirmed,
        int ActiveUsersMonthly,
        decimal AvgQuoteResponseHours,
        List<TrustBucket> TrustDistribution);

    public record TrustBucket(string Range, int Count);

    public record TimeseriesPoint(string Date, int Value);

    public async Task<OverviewDto> GetOverviewAsync(CancellationToken ct)
    {
        var cutoff = DateTime.UtcNow.AddDays(-30);

        var businessesTotal = await db.Businesses.IgnoreQueryFilters()
            .CountAsync(b => b.IsActive, ct);
        var businessesLast30d = await db.Businesses.IgnoreQueryFilters()
            .CountAsync(b => b.IsActive && b.CreatedAt >= cutoff, ct);
        var verifiedBusinesses = await db.Businesses.IgnoreQueryFilters()
            .CountAsync(b => b.IsActive && b.IsVerified, ct);

        var publishedItems = await db.CatalogItems.IgnoreQueryFilters()
            .CountAsync(c => c.Status == CatalogItemStatus.Published, ct);
        var openRfqs = await db.Rfqs.IgnoreQueryFilters()
            .CountAsync(r => r.Status == RfqStatus.Open, ct);
        var dealsConfirmed = await db.DealConfirmations.CountAsync(ct);

        var activeUsersMonthly = await db.Users
            .CountAsync(u => u.LastLoginAt != null && u.LastLoginAt >= cutoff, ct);

        // Avg quote response time (hours) = avg delta between Rfq.CreatedAt and first Quote.CreatedAt.
        var avgResponseHours = 0m;
        var quoteSamples = await db.Quotes.IgnoreQueryFilters()
            .Include(q => q.Rfq)
            .Where(q => q.Rfq != null && q.Status == QuoteStatus.Submitted)
            .Select(q => new { QuotedAt = q.CreatedAt, RfqAt = q.Rfq!.CreatedAt })
            .Take(500)
            .ToListAsync(ct);
        if (quoteSamples.Count > 0)
            avgResponseHours = (decimal)quoteSamples.Average(x => (x.QuotedAt - x.RfqAt).TotalHours);

        var allScores = await db.Businesses.IgnoreQueryFilters()
            .Where(b => b.IsActive)
            .Select(b => b.TrustScore)
            .ToListAsync(ct);

        var buckets = new List<TrustBucket>
        {
            new("0-20", allScores.Count(s => s < 20)),
            new("20-40", allScores.Count(s => s >= 20 && s < 40)),
            new("40-60", allScores.Count(s => s >= 40 && s < 60)),
            new("60-80", allScores.Count(s => s >= 60 && s < 80)),
            new("80-100", allScores.Count(s => s >= 80)),
        };

        var verifiedRate = businessesTotal == 0
            ? 0m
            : Math.Round((decimal)verifiedBusinesses * 100 / businessesTotal, 2);

        return new OverviewDto(
            businessesTotal, businessesLast30d, verifiedBusinesses, verifiedRate,
            publishedItems, openRfqs, dealsConfirmed,
            activeUsersMonthly,
            Math.Round(avgResponseHours, 2),
            buckets);
    }

    public async Task<List<TimeseriesPoint>> GetTimeseriesAsync(string metric, int days, CancellationToken ct)
    {
        var since = DateTime.UtcNow.Date.AddDays(-days + 1);
        var buckets = Enumerable.Range(0, days)
            .Select(i => since.AddDays(i))
            .ToDictionary(d => d.ToString("yyyy-MM-dd"), _ => 0);

        switch (metric)
        {
            case "businesses":
            {
                var rows = await db.Businesses.IgnoreQueryFilters()
                    .Where(b => b.CreatedAt >= since)
                    .Select(b => b.CreatedAt.Date)
                    .ToListAsync(ct);
                foreach (var d in rows)
                    if (buckets.ContainsKey(d.ToString("yyyy-MM-dd")))
                        buckets[d.ToString("yyyy-MM-dd")]++;
                break;
            }
            case "catalog":
            {
                var rows = await db.CatalogItems.IgnoreQueryFilters()
                    .Where(c => c.CreatedAt >= since)
                    .Select(c => c.CreatedAt.Date)
                    .ToListAsync(ct);
                foreach (var d in rows)
                    if (buckets.ContainsKey(d.ToString("yyyy-MM-dd")))
                        buckets[d.ToString("yyyy-MM-dd")]++;
                break;
            }
            case "rfqs":
            {
                var rows = await db.Rfqs.IgnoreQueryFilters()
                    .Where(r => r.CreatedAt >= since)
                    .Select(r => r.CreatedAt.Date)
                    .ToListAsync(ct);
                foreach (var d in rows)
                    if (buckets.ContainsKey(d.ToString("yyyy-MM-dd")))
                        buckets[d.ToString("yyyy-MM-dd")]++;
                break;
            }
        }

        return buckets.Select(kv => new TimeseriesPoint(kv.Key, kv.Value)).ToList();
    }
}
