using NexTrade.Core.Interfaces;

namespace NexTrade.Infrastructure.Data;

public class TenantContext : ITenantContext
{
    public Guid TenantId { get; set; }
    public long? UserId { get; set; }
    public bool IsPlatformAdmin { get; set; }
}
