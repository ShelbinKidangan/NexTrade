namespace NexTrade.Core.Entities;

/// <summary>
/// Every platform-admin write is captured here by the AdminAuditMiddleware or
/// recorded explicitly via IAdminAuditLog.Record. Cross-tenant by design.
/// </summary>
public class AdminAuditEntry : BaseEntity
{
    public long AdminUserId { get; set; }
    public string AdminEmail { get; set; } = string.Empty;

    public string Action { get; set; } = string.Empty;
    public string? TargetEntity { get; set; }
    public Guid? TargetUid { get; set; }

    public string? Payload { get; set; }
    public string? Route { get; set; }
    public string? Method { get; set; }
    public int? StatusCode { get; set; }
    public string? IpAddress { get; set; }
}
