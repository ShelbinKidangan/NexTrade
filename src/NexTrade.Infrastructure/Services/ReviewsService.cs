using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services;

public class ReviewsService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant, TrustScoreService trustScore)
{
    public record ReviewDto(
        Guid Uid, Guid ReviewerBusinessUid, string ReviewerBusinessName,
        Guid ReviewedBusinessUid, Guid DealConfirmationUid,
        int OverallRating, int? QualityRating, int? CommunicationRating,
        int? DeliveryRating, int? ValueRating, string? Comment,
        bool IsVerifiedDeal, DateTime CreatedAt);

    public record CreateReviewRequest(
        Guid DealConfirmationUid,
        int OverallRating, int? QualityRating, int? CommunicationRating,
        int? DeliveryRating, int? ValueRating, string? Comment);

    // Post a review — requires confirmed deal between reviewer (current tenant) and reviewee
    public async Task<ServiceResult<ReviewDto>> CreateAsync(CreateReviewRequest req, CancellationToken ct)
    {
        if (req.OverallRating < 1 || req.OverallRating > 5)
            return ServiceResult<ReviewDto>.Fail("Overall rating must be 1–5.", 400);

        var deal = await db.DealConfirmations
            .FirstOrDefaultAsync(d => d.Uid == req.DealConfirmationUid, ct);
        if (deal is null)
            return ServiceResult<ReviewDto>.Fail("Deal confirmation not found.", 404);

        // Reviewer must be a party to the deal
        var isBuyer = deal.BuyerBusinessUid == tenant.TenantId;
        var isSupplier = deal.SupplierBusinessUid == tenant.TenantId;
        if (!isBuyer && !isSupplier)
            return ServiceResult<ReviewDto>.Fail("You are not a party to this deal.", 403);

        // Deal must be fully confirmed
        if (deal.ConfirmedAt is null)
            return ServiceResult<ReviewDto>.Fail("Deal must be confirmed by both parties before a review.", 409);

        var reviewedUid = isBuyer ? deal.SupplierBusinessUid : deal.BuyerBusinessUid;

        // One review per (reviewer, deal) enforced by unique index
        var existing = await db.Reviews
            .AnyAsync(r => r.ReviewerBusinessUid == tenant.TenantId
                && r.DealConfirmationId == deal.Id, ct);
        if (existing)
            return ServiceResult<ReviewDto>.Fail("You have already reviewed this deal.", 409);

        var review = new Review
        {
            ReviewerBusinessUid = tenant.TenantId,
            ReviewedBusinessUid = reviewedUid,
            DealConfirmationId = deal.Id,
            OverallRating = req.OverallRating,
            QualityRating = req.QualityRating,
            CommunicationRating = req.CommunicationRating,
            DeliveryRating = req.DeliveryRating,
            ValueRating = req.ValueRating,
            Comment = req.Comment,
            IsVerifiedDeal = true,
        };
        db.Reviews.Add(review);
        await uow.SaveChangesAsync(ct);

        // Recompute the reviewed business's trust score inline so the new
        // review reflects immediately; the nightly job still keeps things
        // fresh for businesses whose stats changed without a new review.
        await trustScore.RecomputeOneAsync(reviewedUid, ct);

        var reviewer = await db.Businesses.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == tenant.TenantId, ct);

        return ServiceResult<ReviewDto>.Created(new ReviewDto(
            review.Uid, review.ReviewerBusinessUid, reviewer?.Name ?? "",
            review.ReviewedBusinessUid, deal.Uid,
            review.OverallRating, review.QualityRating, review.CommunicationRating,
            review.DeliveryRating, review.ValueRating, review.Comment,
            review.IsVerifiedDeal, review.CreatedAt));
    }

    // List reviews for a business (platform-scoped)
    public async Task<PagedResult<ReviewDto>> GetForBusinessAsync(
        Guid businessUid, int page, int pageSize, CancellationToken ct)
    {
        var query = db.Reviews
            .Where(r => r.ReviewedBusinessUid == businessUid)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var reviews = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var reviewerUids = reviews.Select(r => r.ReviewerBusinessUid).Distinct().ToList();
        var reviewers = await db.Businesses.IgnoreQueryFilters()
            .Where(b => reviewerUids.Contains(b.Uid))
            .ToDictionaryAsync(b => b.Uid, b => b.Name, ct);

        var dealIds = reviews.Select(r => r.DealConfirmationId).Distinct().ToList();
        var deals = await db.DealConfirmations
            .Where(d => dealIds.Contains(d.Id))
            .ToDictionaryAsync(d => d.Id, d => d.Uid, ct);

        return new PagedResult<ReviewDto>
        {
            Items = reviews.Select(r => new ReviewDto(
                r.Uid, r.ReviewerBusinessUid,
                reviewers.GetValueOrDefault(r.ReviewerBusinessUid, ""),
                r.ReviewedBusinessUid,
                deals.GetValueOrDefault(r.DealConfirmationId),
                r.OverallRating, r.QualityRating, r.CommunicationRating,
                r.DeliveryRating, r.ValueRating, r.Comment,
                r.IsVerifiedDeal, r.CreatedAt)).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}
