using NexTrade.Core.Enums;

namespace NexTrade.Core.Entities;

/// <summary>
/// Cross-tenant relationship between two businesses.
/// Not tenant-scoped — platform entity linking two business UIDs.
/// </summary>
public class Connection : BaseEntity
{
    public Guid RequesterBusinessUid { get; set; }
    public Guid TargetBusinessUid { get; set; }
    public ConnectionType Type { get; set; } = ConnectionType.Follow;
    public ConnectionStatus Status { get; set; } = ConnectionStatus.Pending;
    public bool IsPreferredPartner { get; set; }
}
