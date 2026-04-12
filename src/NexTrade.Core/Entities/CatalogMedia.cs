using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

public class CatalogMedia : ChildEntity
{
    public long CatalogItemId { get; set; }
    public MediaType MediaType { get; set; }
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public int SortOrder { get; set; }
    public bool IsPrimary { get; set; }

    // Navigation
    public CatalogItem CatalogItem { get; set; } = null!;
}
