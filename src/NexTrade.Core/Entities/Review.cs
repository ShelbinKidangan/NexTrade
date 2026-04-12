namespace NexTrade.Core.Entities;

/// <summary>
/// Cross-tenant review — one business reviews another after a completed transaction.
/// </summary>
public class Review : BaseEntity
{
    public Guid ReviewerBusinessUid { get; set; }
    public Guid ReviewedBusinessUid { get; set; }
    public long? OrderId { get; set; }
    public int OverallRating { get; set; } // 1-5
    public int? QualityRating { get; set; }
    public int? CommunicationRating { get; set; }
    public int? DeliveryRating { get; set; }
    public int? ValueRating { get; set; }
    public string? Comment { get; set; }
    public bool IsVerifiedPurchase { get; set; }
}
