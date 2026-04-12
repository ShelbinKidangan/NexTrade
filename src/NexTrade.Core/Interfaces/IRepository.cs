using System.Linq.Expressions;
using NexTrade.Core.Entities;

namespace NexTrade.Core.Interfaces;

public interface IRepository<T> where T : TenantEntity
{
    Task<T?> GetByIdAsync(long id, CancellationToken ct = default);
    Task<T?> GetByUidAsync(Guid uid, CancellationToken ct = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task<T> AddAsync(T entity, CancellationToken ct = default);
    Task UpdateAsync(T entity, CancellationToken ct = default);
    Task DeleteAsync(T entity, CancellationToken ct = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken ct = default);
}
