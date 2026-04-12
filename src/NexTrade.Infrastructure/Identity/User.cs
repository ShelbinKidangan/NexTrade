using Microsoft.AspNetCore.Identity;

namespace NexTrade.Infrastructure.Identity;

public class User : IdentityUser<long>
{
    public Guid Uid { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public string? Timezone { get; set; }
    public string? Language { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class Role : IdentityRole<long>
{
    public Guid TenantId { get; set; }
}
