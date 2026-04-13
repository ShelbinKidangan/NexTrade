namespace NexTrade.Core.Entities;

/// <summary>
/// A stored discovery search belonging to a tenant. When NotifyOnNewResults is true,
/// the Smart Alerts consumer re-runs the search and emails the owner about new matches.
/// </summary>
public class SavedSearch : TenantEntity
{
    public string Name { get; set; } = string.Empty;

    // JSONB — filters, query text, sort key, etc. Opaque to the DB.
    public string SearchCriteria { get; set; } = "{}";

    public bool NotifyOnNewResults { get; set; }
    public DateTime? LastNotifiedAt { get; set; }
}
