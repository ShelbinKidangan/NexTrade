namespace NexTrade.Core.Entities;

public abstract class BaseEntity
{
    public long Id { get; set; }
    public Guid Uid { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public abstract class TenantEntity : BaseEntity
{
    public Guid TenantId { get; set; }
    public long? CreatedBy { get; set; }
    public long? UpdatedBy { get; set; }
}

/// <summary>
/// Child entities have no Uid or TenantId — isolated via parent FK.
/// </summary>
public abstract class ChildEntity
{
    public long Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Platform-scoped entities visible across all tenants (e.g. Industry, Country).
/// </summary>
public abstract class PlatformEntity
{
    public long Id { get; set; }
    public Guid Uid { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
