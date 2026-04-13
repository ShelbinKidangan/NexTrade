namespace NexTrade.Core.Entities;

/// <summary>
/// Cross-tenant review — one business reviews another. Gated on a confirmed
/// DealConfirmation between the two parties.
/// </summary>
public class Review : BaseEntity
{
    public Guid ReviewerBusinessUid { get; set; }
    public Guid ReviewedBusinessUid { get; set; }

    public long DealConfirmationId { get; set; }

    public int OverallRating { get; set; } // 1-5
    public int? QualityRating { get; set; }
    public int? CommunicationRating { get; set; }
    public int? DeliveryRating { get; set; }
    public int? ValueRating { get; set; }
    public string? Comment { get; set; }

    /// <summary>True when both parties confirmed the deal on DealConfirmation.</summary>
    public bool IsVerifiedDeal { get; set; }

    // Navigation
    public DealConfirmation DealConfirmation { get; set; } = null!;
}
