namespace NexTrade.Core.Entities;

public class Industry : PlatformEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public long? ParentId { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation
    public Industry? Parent { get; set; }
    public ICollection<Industry> Children { get; set; } = [];
}
