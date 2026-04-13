using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Infrastructure.Services;

public class ConnectionsService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant)
{
    public record ConnectionDto(
        Guid Uid, Guid RequesterUid, Guid TargetUid, string Type, string Status,
        Guid OtherUid, string OtherName, bool OtherVerified, string? OtherLogo, string? OtherCountry,
        DateTime CreatedAt);

    public record FollowStatusDto(bool IsFollowing, int FollowerCount);

    public async Task<ServiceResult<ConnectionDto>> FollowAsync(Guid targetUid, CancellationToken ct)
    {
        if (targetUid == tenant.TenantId)
            return ServiceResult<ConnectionDto>.Fail("Cannot follow yourself.", 400);

        var target = await db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Profile)
            .FirstOrDefaultAsync(b => b.Uid == targetUid && b.IsActive, ct);
        if (target is null)
            return ServiceResult<ConnectionDto>.Fail("Business not found.", 404);

        var existing = await db.Connections
            .FirstOrDefaultAsync(c => c.RequesterBusinessUid == tenant.TenantId
                                        && c.TargetBusinessUid == targetUid
                                        && c.Type == ConnectionType.Follow, ct);
        if (existing is not null)
            return ServiceResult<ConnectionDto>.Ok(ToDto(existing, target));

        var conn = new Connection
        {
            RequesterBusinessUid = tenant.TenantId,
            TargetBusinessUid = targetUid,
            Type = ConnectionType.Follow,
            Status = ConnectionStatus.Accepted
        };
        db.Connections.Add(conn);
        await uow.SaveChangesAsync(ct);

        return ServiceResult<ConnectionDto>.Created(ToDto(conn, target));
    }

    public async Task<ServiceResult> UnfollowAsync(Guid targetUid, CancellationToken ct)
    {
        var conn = await db.Connections
            .FirstOrDefaultAsync(c => c.RequesterBusinessUid == tenant.TenantId
                                        && c.TargetBusinessUid == targetUid
                                        && c.Type == ConnectionType.Follow, ct);
        if (conn is null) return ServiceResult.Fail("Not following.", 404);

        db.Connections.Remove(conn);
        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    public async Task<List<ConnectionDto>> FollowingAsync(CancellationToken ct)
    {
        var conns = await db.Connections
            .Where(c => c.RequesterBusinessUid == tenant.TenantId && c.Type == ConnectionType.Follow)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

        return await EnrichAsync(conns, c => c.TargetBusinessUid, ct);
    }

    public async Task<List<ConnectionDto>> FollowersAsync(CancellationToken ct)
    {
        var conns = await db.Connections
            .Where(c => c.TargetBusinessUid == tenant.TenantId && c.Type == ConnectionType.Follow)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

        return await EnrichAsync(conns, c => c.RequesterBusinessUid, ct);
    }

    public async Task<FollowStatusDto> GetFollowStatusAsync(Guid targetUid, CancellationToken ct)
    {
        var isFollowing = await db.Connections
            .AnyAsync(c => c.RequesterBusinessUid == tenant.TenantId
                            && c.TargetBusinessUid == targetUid
                            && c.Type == ConnectionType.Follow, ct);
        var count = await db.Connections
            .CountAsync(c => c.TargetBusinessUid == targetUid && c.Type == ConnectionType.Follow, ct);
        return new FollowStatusDto(isFollowing, count);
    }

    private async Task<List<ConnectionDto>> EnrichAsync(List<Connection> conns, Func<Connection, Guid> otherSelector, CancellationToken ct)
    {
        var otherUids = conns.Select(otherSelector).Distinct().ToList();
        var businesses = await db.Businesses
            .IgnoreQueryFilters()
            .Where(b => otherUids.Contains(b.Uid))
            .Include(b => b.Profile)
            .ToListAsync(ct);
        var map = businesses.ToDictionary(b => b.Uid);

        return conns.Select(c =>
        {
            var otherUid = otherSelector(c);
            map.TryGetValue(otherUid, out var b);
            return new ConnectionDto(
                c.Uid, c.RequesterBusinessUid, c.TargetBusinessUid, c.Type.ToString(), c.Status.ToString(),
                otherUid, b?.Name ?? "Unknown", b?.IsVerified ?? false,
                b?.Profile?.Logo, b?.Profile?.CountryCode,
                c.CreatedAt);
        }).ToList();
    }

    private ConnectionDto ToDto(Connection c, Business other) => new(
        c.Uid, c.RequesterBusinessUid, c.TargetBusinessUid, c.Type.ToString(), c.Status.ToString(),
        other.Uid, other.Name, other.IsVerified,
        other.Profile?.Logo, other.Profile?.CountryCode,
        c.CreatedAt);
}
