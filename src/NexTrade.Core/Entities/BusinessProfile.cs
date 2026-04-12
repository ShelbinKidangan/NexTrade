using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

public class BusinessProfile : ChildEntity
{
    public long BusinessId { get; set; }

    public string? Logo { get; set; }
    public string? BannerImage { get; set; }
    public string? About { get; set; }
    public string? Website { get; set; }
    public string? LinkedInUrl { get; set; }
    public int? YearEstablished { get; set; }
    public CompanySize? CompanySize { get; set; }

    // Address
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string? CountryCode { get; set; }

    // Stored as JSONB
    public List<string> Capabilities { get; set; } = [];
    public List<string> Certifications { get; set; } = [];
    public List<string> DeliveryRegions { get; set; } = [];

    // Computed / updated periodically
    public decimal ResponseRate { get; set; }
    public int AvgResponseTimeHours { get; set; }

    // Navigation
    public Business Business { get; set; } = null!;
    public long? IndustryId { get; set; }
    public Industry? Industry { get; set; }
}
