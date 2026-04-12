using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

public class Rfq : TenantEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public RfqVisibility Visibility { get; set; } = RfqVisibility.Public;
    public RfqStatus Status { get; set; } = RfqStatus.Draft;
    public DateTime? ResponseDeadline { get; set; }
    public string? DeliveryLocation { get; set; }
    public string? DeliveryTimeline { get; set; }

    // Navigation
    public ICollection<RfqItem> Items { get; set; } = [];
    public ICollection<RfqTarget> Targets { get; set; } = [];
    public ICollection<Quote> Quotes { get; set; } = [];
}

public class RfqItem : ChildEntity
{
    public long RfqId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Specifications { get; set; } // JSONB
    public decimal? Quantity { get; set; }
    public string? UnitOfMeasure { get; set; }
    public long? CategoryId { get; set; }
    public int SortOrder { get; set; }

    // Navigation
    public Rfq Rfq { get; set; } = null!;
    public CatalogCategory? Category { get; set; }
}

public class RfqTarget : ChildEntity
{
    public long RfqId { get; set; }
    public Guid TargetBusinessUid { get; set; }
    public DateTime? SentAt { get; set; }

    // Navigation
    public Rfq Rfq { get; set; } = null!;
}
