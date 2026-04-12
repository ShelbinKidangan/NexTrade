using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services;

public static class QueryExtensions
{
    public static async Task<PagedResult<TDto>> ToPagedResultAsync<T, TDto>(
        this IQueryable<T> query,
        int page,
        int pageSize,
        Func<T, TDto> map,
        CancellationToken ct = default)
    {
        var totalCount = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<TDto>
        {
            Items = items.Select(map).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public static async Task<ServiceResult> CheckDuplicateAsync<T>(
        this IQueryable<T> query,
        string fieldName) where T : class
    {
        var exists = await query.AnyAsync();
        return exists
            ? ServiceResult.Fail(new Dictionary<string, string[]>
                { { fieldName, [$"A record with this {fieldName} already exists."] } }, 409)
            : ServiceResult.Ok();
    }

    public static async Task<(T? Entity, ServiceResult? Error)> ResolveRefAsync<T>(
        this DbSet<T> dbSet,
        Guid uid,
        string fieldName,
        CancellationToken ct = default) where T : TenantEntity
    {
        var entity = await dbSet.FirstOrDefaultAsync(e => e.Uid == uid, ct);
        if (entity is null)
            return (null, ServiceResult.Fail($"{fieldName} not found.", 400));
        return (entity, null);
    }

    public static async Task<(T? Entity, ServiceResult? Error)> ResolveOptionalRefAsync<T>(
        this DbSet<T> dbSet,
        Guid? uid,
        string fieldName,
        CancellationToken ct = default) where T : TenantEntity
    {
        if (uid is null) return (null, null);
        return await dbSet.ResolveRefAsync(uid.Value, fieldName, ct);
    }
}
