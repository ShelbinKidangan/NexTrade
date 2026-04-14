using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

/// <summary>
/// The core tenant entity. Every registered company on the platform.
/// In NexTrade, Tenant = Business. Cross-tenant discovery is the core feature.
/// </summary>
public class Business : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Subdomain { get; set; }

    // Structured filterable attributes — PRD §8 places these on Business, not BusinessProfile.
    public long? IndustryId { get; set; }
    public long? SubIndustryId { get; set; }
    public CompanySize? CompanySize { get; set; }
    public int? YearEstablished { get; set; }
    public string? Website { get; set; }
    public string? LinkedInUrl { get; set; }

    // Trust + verification
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public decimal TrustScore { get; set; }

    // Provenance — load-bearing for the S2P seeding flywheel.
    public ProfileSource ProfileSource { get; set; } = ProfileSource.SelfRegistered;
    public DateTime? ClaimedAt { get; set; }

    public bool IsActive { get; set; } = true;

    // Suspension (admin action). Separate from IsActive: IsActive is the tenant's
    // own soft-delete, IsSuspended is a platform-admin enforcement action.
    public bool IsSuspended { get; set; }
    public DateTime? SuspendedAt { get; set; }
    public string? SuspensionReason { get; set; }

    // Navigation
    public Industry? Industry { get; set; }
    public Industry? SubIndustry { get; set; }
    public BusinessProfile? Profile { get; set; }
    public ICollection<CatalogItem> CatalogItems { get; set; } = [];
    public ICollection<ComplianceDocument> ComplianceDocuments { get; set; } = [];
}
