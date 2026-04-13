namespace NexTrade.Core.Interfaces;

public interface ITenantContext
{
    Guid TenantId { get; }
    long? UserId { get; }
    bool IsPlatformAdmin { get; }
}
