using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NexTrade.Infrastructure.Data;
using NexTrade.Infrastructure.Identity;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services.Admin;

public class AdminUserService(AppDbContext db, UserManager<User> userManager, IAdminAuditLog audit)
{
    public record AdminUserDto(
        Guid Uid, string Email, string FullName, bool IsActive, bool IsPlatformAdmin,
        bool IsLockedOut, Guid? TenantId, string? TenantName,
        DateTime? LastLoginAt, DateTime CreatedAt);

    public record AdminUserFilter(
        int Page = 1, int PageSize = 25, string? Search = null,
        Guid? TenantUid = null, bool? LockedOnly = null);

    public record ResetPasswordRequest(string NewPassword);

    public async Task<PagedResult<AdminUserDto>> ListAsync(AdminUserFilter filter, CancellationToken ct)
    {
        var query = db.Users.AsQueryable();

        if (!string.IsNullOrEmpty(filter.Search))
        {
            var s = filter.Search.ToLower();
            query = query.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(s))
                || u.FullName.ToLower().Contains(s));
        }
        if (filter.TenantUid is not null)
            query = query.Where(u => u.TenantId == filter.TenantUid);
        if (filter.LockedOnly == true)
            query = query.Where(u => u.LockoutEnd > DateTimeOffset.UtcNow);

        query = query.OrderByDescending(u => u.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var rows = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(ct);

        var tenantUids = rows.Select(u => u.TenantId).Where(t => t != Guid.Empty).Distinct().ToList();
        var tenants = await db.Businesses.IgnoreQueryFilters()
            .Where(b => tenantUids.Contains(b.Uid))
            .Select(b => new { b.Uid, b.Name })
            .ToListAsync(ct);
        var tenantMap = tenants.ToDictionary(t => t.Uid, t => t.Name);

        var items = rows.Select(u =>
        {
            tenantMap.TryGetValue(u.TenantId, out var tenantName);
            return new AdminUserDto(
                u.Uid, u.Email ?? "", u.FullName, u.IsActive, u.IsPlatformAdmin,
                u.LockoutEnd > DateTimeOffset.UtcNow,
                u.TenantId == Guid.Empty ? null : u.TenantId,
                tenantName,
                u.LastLoginAt, u.CreatedAt);
        }).ToList();

        return new PagedResult<AdminUserDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize,
        };
    }

    public async Task<ServiceResult> UnlockAsync(Guid uid, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Uid == uid, ct);
        if (user is null) return ServiceResult.Fail("User not found.", 404);

        await userManager.SetLockoutEndDateAsync(user, null);
        await userManager.ResetAccessFailedCountAsync(user);
        await audit.RecordAsync("user.unlock", "User", uid, new { user.Email }, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> ResetPasswordAsync(Guid uid, string newPassword, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Uid == uid, ct);
        if (user is null) return ServiceResult.Fail("User not found.", 404);

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var result = await userManager.ResetPasswordAsync(user, token, newPassword);
        if (!result.Succeeded)
        {
            var errors = result.Errors.ToDictionary(e => e.Code, e => new[] { e.Description });
            return ServiceResult.Fail(errors);
        }

        await audit.RecordAsync("user.resetPassword", "User", uid, new { user.Email }, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> PromoteAsync(Guid uid, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Uid == uid, ct);
        if (user is null) return ServiceResult.Fail("User not found.", 404);

        user.IsPlatformAdmin = true;
        await userManager.UpdateAsync(user);
        await audit.RecordAsync("user.promote", "User", uid, new { user.Email }, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DemoteAsync(Guid uid, CancellationToken ct)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Uid == uid, ct);
        if (user is null) return ServiceResult.Fail("User not found.", 404);

        user.IsPlatformAdmin = false;
        await userManager.UpdateAsync(user);
        await audit.RecordAsync("user.demote", "User", uid, new { user.Email }, ct: ct);
        return ServiceResult.Ok();
    }
}
