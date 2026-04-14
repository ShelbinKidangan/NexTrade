using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services.Admin;

public interface IAdminAuditLog
{
    Task RecordAsync(
        string action, string? targetEntity = null, Guid? targetUid = null,
        object? payload = null, int? statusCode = null,
        string? route = null, string? method = null, string? ipAddress = null,
        CancellationToken ct = default);

    Task<PagedResult<AdminAuditLog.AdminAuditEntryDto>> ListAsync(
        AdminAuditLog.AdminAuditFilter filter, CancellationToken ct);
}

public class AdminAuditLog(AppDbContext db, IUnitOfWork uow, ITenantContext tenant, IHttpContextAccessor http)
    : IAdminAuditLog
{
    public record AdminAuditEntryDto(
        Guid Uid, long AdminUserId, string AdminEmail, string Action,
        string? TargetEntity, Guid? TargetUid, string? Payload,
        string? Route, string? Method, int? StatusCode, string? IpAddress,
        DateTime CreatedAt);

    public record AdminAuditFilter(
        int Page = 1, int PageSize = 50,
        long? AdminUserId = null, string? Action = null,
        string? TargetEntity = null, Guid? TargetUid = null);

    public async Task RecordAsync(
        string action, string? targetEntity = null, Guid? targetUid = null,
        object? payload = null, int? statusCode = null,
        string? route = null, string? method = null, string? ipAddress = null,
        CancellationToken ct = default)
    {
        var userId = tenant.UserId ?? 0L;
        var email = http.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "";

        var entry = new AdminAuditEntry
        {
            AdminUserId = userId,
            AdminEmail = email,
            Action = action,
            TargetEntity = targetEntity,
            TargetUid = targetUid,
            Payload = payload is null ? null : JsonSerializer.Serialize(payload),
            Route = route,
            Method = method,
            StatusCode = statusCode,
            IpAddress = ipAddress,
        };
        db.AdminAuditEntries.Add(entry);
        await uow.SaveChangesAsync(ct);
    }

    public async Task<PagedResult<AdminAuditEntryDto>> ListAsync(AdminAuditFilter filter, CancellationToken ct)
    {
        var query = db.AdminAuditEntries.AsQueryable();

        if (filter.AdminUserId is not null)
            query = query.Where(a => a.AdminUserId == filter.AdminUserId);
        if (!string.IsNullOrEmpty(filter.Action))
            query = query.Where(a => a.Action.Contains(filter.Action));
        if (!string.IsNullOrEmpty(filter.TargetEntity))
            query = query.Where(a => a.TargetEntity == filter.TargetEntity);
        if (filter.TargetUid is not null)
            query = query.Where(a => a.TargetUid == filter.TargetUid);

        query = query.OrderByDescending(a => a.CreatedAt);

        return await query.ToPagedResultAsync(filter.Page, filter.PageSize, a => new AdminAuditEntryDto(
            a.Uid, a.AdminUserId, a.AdminEmail, a.Action,
            a.TargetEntity, a.TargetUid, a.Payload,
            a.Route, a.Method, a.StatusCode, a.IpAddress,
            a.CreatedAt), ct);
    }
}
