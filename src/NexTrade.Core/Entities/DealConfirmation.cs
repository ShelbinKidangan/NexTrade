namespace NexTrade.Core.Entities;

/// <summary>
/// Mutual acknowledgment that a deal happened off-platform between two businesses.
/// NexTrade's terminal state — execution and invoicing live in the buyer's own systems.
/// Anchors reviews: a Review requires a DealConfirmation with both sides confirmed.
/// </summary>
public class DealConfirmation : BaseEntity
{
    // A deal can originate from an RFQ + winning Quote, or be recorded off-platform with no prior RFQ.
    public long? RfqId { get; set; }
    public long? QuoteId { get; set; }

    public Guid BuyerBusinessUid { get; set; }
    public Guid SupplierBusinessUid { get; set; }

    public bool BuyerConfirmed { get; set; }
    public DateTime? BuyerConfirmedAt { get; set; }
    public bool SupplierConfirmed { get; set; }
    public DateTime? SupplierConfirmedAt { get; set; }

    public DateTime? ConfirmedAt { get; set; }

    // Optional, for analytics
    public decimal? DealValue { get; set; }
    public string? CurrencyCode { get; set; }

    // Navigation
    public Rfq? Rfq { get; set; }
    public Quote? Quote { get; set; }
}
