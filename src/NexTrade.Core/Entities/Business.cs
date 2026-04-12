namespace NexTrade.Core.Entities;

/// <summary>
/// The core tenant entity. Every registered company on the platform.
/// In NexTrade, Tenant = Business. Cross-tenant discovery is the core feature.
/// </summary>
public class Business : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Subdomain { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public decimal TrustScore { get; set; }

    // Navigation
    public BusinessProfile? Profile { get; set; }
    public ICollection<User> Users { get; set; } = [];
    public ICollection<CatalogItem> CatalogItems { get; set; } = [];
    public ICollection<ComplianceDocument> ComplianceDocuments { get; set; } = [];
}
