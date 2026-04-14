using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

public class Quote : TenantEntity
{
    public long RfqId { get; set; }
    public QuoteStatus Status { get; set; } = QuoteStatus.Draft;
    public decimal? TotalAmount { get; set; }
    public string? CurrencyCode { get; set; }
    public DateTime? ValidUntil { get; set; }
    public string? Notes { get; set; }

    /// <summary>JSONB list of attachment blob URLs.</summary>
    public List<string> Attachments { get; set; } = [];

    // Navigation
    public Rfq Rfq { get; set; } = null!;
    public ICollection<QuoteItem> Items { get; set; } = [];
}

public class QuoteItem : ChildEntity
{
    public long QuoteId { get; set; }
    public long? RfqItemId { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public int? LeadTimeDays { get; set; }
    public decimal? MinOrderQuantity { get; set; }
    public string? Incoterms { get; set; }
    public string? Notes { get; set; }
    public int SortOrder { get; set; }

    // Navigation
    public Quote Quote { get; set; } = null!;
    public RfqItem? RfqItem { get; set; }
}
