using NexTrade.Core.Enums;
using Pgvector;

namespace NexTrade.Core.Entities;

public class CatalogItem : TenantEntity
{
    public CatalogItemType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Specifications { get; set; } // JSONB
    public long? CategoryId { get; set; }

    public PricingType PricingType { get; set; }
    public decimal? PriceMin { get; set; }
    public decimal? PriceMax { get; set; }
    public string? CurrencyCode { get; set; }

    public int? MinOrderQuantity { get; set; }
    public int? LeadTimeDays { get; set; }
    public List<string> DeliveryRegions { get; set; } = [];

    public CatalogItemStatus Status { get; set; } = CatalogItemStatus.Draft;
    public int ViewCount { get; set; }
    public int InquiryCount { get; set; }

    public Vector? Embedding { get; set; } // pgvector for semantic search

    // Navigation
    public CatalogCategory? Category { get; set; }
    public ICollection<CatalogMedia> Media { get; set; } = [];
}
