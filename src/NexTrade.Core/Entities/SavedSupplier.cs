namespace NexTrade.Core.Entities;

/// <summary>
/// A buyer tenant bookmarks a supplier business. Optionally grouped into a SupplierList.
/// Tenant-scoped: TenantId on the base type is the buyer tenant's business uid.
/// </summary>
public class SavedSupplier : TenantEntity
{
    public Guid SupplierBusinessUid { get; set; }
    public long? SupplierListId { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public SupplierList? SupplierList { get; set; }
}

public class SupplierList : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation
    public ICollection<SavedSupplier> Suppliers { get; set; } = [];
}
