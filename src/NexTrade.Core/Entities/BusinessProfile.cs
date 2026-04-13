using Pgvector;

namespace NexTrade.Core.Entities;

public class BusinessProfile : ChildEntity
{
    public long BusinessId { get; set; }

    // Display content
    public string? Logo { get; set; }
    public string? BannerImage { get; set; }
    public string? About { get; set; }

    // Headquarters address (embedded)
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? CountryCode { get; set; }

    // Stored as JSONB
    public List<string> AdditionalLocations { get; set; } = [];
    public List<string> Capabilities { get; set; } = [];
    public List<string> Certifications { get; set; } = [];
    public List<string> DeliveryRegions { get; set; } = [];
    public Dictionary<string, string> SocialLinks { get; set; } = [];

    // Computed / updated periodically
    public decimal ResponseRate { get; set; }
    public int AvgResponseTimeHours { get; set; }
    public decimal ProfileCompleteness { get; set; }

    // Semantic search over the profile (populated by the AI layer in Phase 6).
    public Vector? Embedding { get; set; }

    // Navigation
    public Business Business { get; set; } = null!;
}
