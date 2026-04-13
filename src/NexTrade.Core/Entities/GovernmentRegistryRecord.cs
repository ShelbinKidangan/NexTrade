using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

/// <summary>
/// Cache of records fetched from public government registries (MCA, GST, DGFT, GeM, Udyam, MSME).
/// Powers the public Vendor Due Diligence tool and AI profile enrichment. Cross-tenant, platform-scoped.
/// </summary>
public class GovernmentRegistryRecord : PlatformEntity
{
    public GovernmentRegistrySource Source { get; set; }

    /// <summary>The registry's own identifier — GSTIN, CIN, DGFT IEC, Udyam number, etc.</summary>
    public string RegistryId { get; set; } = string.Empty;

    /// <summary>JSONB payload as returned by the source. Shape is source-specific.</summary>
    public string Payload { get; set; } = "{}";

    public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }

    /// <summary>When set, this record has been linked to a Business on the platform.</summary>
    public Guid? LinkedBusinessUid { get; set; }
}
