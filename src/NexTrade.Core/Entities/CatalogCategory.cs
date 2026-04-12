namespace NexTrade.Core.Entities;

public class CatalogCategory : PlatformEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public long? ParentCategoryId { get; set; }
    public int Level { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public CatalogCategory? ParentCategory { get; set; }
    public ICollection<CatalogCategory> SubCategories { get; set; } = [];
}
