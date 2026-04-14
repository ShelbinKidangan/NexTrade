using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services.Admin;

public class AdminBusinessService(AppDbContext db, IUnitOfWork uow, IAdminAuditLog audit)
{
    public record AdminBusinessDto(
        Guid Uid, string Name, bool IsVerified, decimal TrustScore,
        bool IsActive, bool IsSuspended, DateTime? SuspendedAt,
        string? Industry, string? Country, string? Logo,
        int PublishedItemCount, int OpenRfqCount, int ComplianceDocCount,
        string ProfileSource, DateTime CreatedAt);

    public record AdminBusinessDetailDto(
        Guid Uid, string Name, string? Subdomain, bool IsVerified, DateTime? VerifiedAt,
        decimal TrustScore, bool IsActive, bool IsSuspended, DateTime? SuspendedAt,
        string? SuspensionReason, string? Industry, int? YearEstablished,
        string? CompanySize, string? Website, string? LinkedInUrl,
        string? About, string? City, string? CountryCode,
        int UserCount, int PublishedItemCount, int OpenRfqCount,
        int ComplianceVerifiedCount, int ComplianceTotalCount,
        string ProfileSource, DateTime CreatedAt);

    public record AdminBusinessFilter(
        int Page = 1, int PageSize = 20, string? Search = null,
        string? Status = null, bool? VerifiedOnly = null,
        string? Country = null);

    public record SuspendRequest(string Reason);

    public async Task<PagedResult<AdminBusinessDto>> ListAsync(AdminBusinessFilter filter, CancellationToken ct)
    {
        var query = db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Industry)
            .Include(b => b.Profile)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.Search))
        {
            var s = filter.Search.ToLower();
            query = query.Where(b => b.Name.ToLower().Contains(s));
        }

        if (filter.VerifiedOnly == true)
            query = query.Where(b => b.IsVerified);

        if (!string.IsNullOrEmpty(filter.Country))
            query = query.Where(b => b.Profile != null && b.Profile.CountryCode == filter.Country);

        if (!string.IsNullOrEmpty(filter.Status))
        {
            query = filter.Status.ToLowerInvariant() switch
            {
                "active" => query.Where(b => b.IsActive && !b.IsSuspended),
                "suspended" => query.Where(b => b.IsSuspended),
                "deleted" => query.Where(b => !b.IsActive),
                "verified" => query.Where(b => b.IsVerified),
                "unverified" => query.Where(b => !b.IsVerified),
                _ => query
            };
        }

        query = query.OrderByDescending(b => b.CreatedAt);

        return await query.ToPagedResultAsync(filter.Page, filter.PageSize, b => new AdminBusinessDto(
            b.Uid, b.Name, b.IsVerified, b.TrustScore,
            b.IsActive, b.IsSuspended, b.SuspendedAt,
            b.Industry != null ? b.Industry.Name : null,
            b.Profile != null ? b.Profile.CountryCode : null,
            b.Profile != null ? b.Profile.Logo : null,
            db.CatalogItems.IgnoreQueryFilters().Count(c => c.TenantId == b.Uid && c.Status == NexTrade.Core.Enums.CatalogItemStatus.Published),
            db.Rfqs.IgnoreQueryFilters().Count(r => r.TenantId == b.Uid && r.Status == NexTrade.Core.Enums.RfqStatus.Open),
            db.ComplianceDocuments.IgnoreQueryFilters().Count(d => d.TenantId == b.Uid),
            b.ProfileSource.ToString(),
            b.CreatedAt), ct);
    }

    public async Task<ServiceResult<AdminBusinessDetailDto>> GetDetailAsync(Guid uid, CancellationToken ct)
    {
        var b = await db.Businesses
            .IgnoreQueryFilters()
            .Include(x => x.Industry)
            .Include(x => x.Profile)
            .FirstOrDefaultAsync(x => x.Uid == uid, ct);

        if (b is null) return ServiceResult<AdminBusinessDetailDto>.Fail("Business not found.", 404);

        var userCount = await db.Users.CountAsync(u => u.TenantId == uid, ct);
        var published = await db.CatalogItems.IgnoreQueryFilters()
            .CountAsync(c => c.TenantId == uid && c.Status == NexTrade.Core.Enums.CatalogItemStatus.Published, ct);
        var openRfqs = await db.Rfqs.IgnoreQueryFilters()
            .CountAsync(r => r.TenantId == uid && r.Status == NexTrade.Core.Enums.RfqStatus.Open, ct);
        var complianceTotal = await db.ComplianceDocuments.IgnoreQueryFilters()
            .CountAsync(d => d.TenantId == uid, ct);
        var complianceVerified = await db.ComplianceDocuments.IgnoreQueryFilters()
            .CountAsync(d => d.TenantId == uid && d.Status == NexTrade.Core.Enums.ComplianceDocumentStatus.Verified, ct);

        var p = b.Profile;
        return ServiceResult<AdminBusinessDetailDto>.Ok(new AdminBusinessDetailDto(
            b.Uid, b.Name, b.Subdomain, b.IsVerified, b.VerifiedAt,
            b.TrustScore, b.IsActive, b.IsSuspended, b.SuspendedAt, b.SuspensionReason,
            b.Industry?.Name, b.YearEstablished, b.CompanySize?.ToString(),
            b.Website, b.LinkedInUrl,
            p?.About, p?.City, p?.CountryCode,
            userCount, published, openRfqs,
            complianceVerified, complianceTotal,
            b.ProfileSource.ToString(), b.CreatedAt));
    }

    public async Task<ServiceResult> VerifyAsync(Guid uid, CancellationToken ct)
    {
        var b = await db.Businesses.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Uid == uid, ct);
        if (b is null) return ServiceResult.Fail("Business not found.", 404);

        b.IsVerified = true;
        b.VerifiedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("business.verify", "Business", uid, new { b.Name }, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> SuspendAsync(Guid uid, string reason, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(reason))
            return ServiceResult.Fail("Suspension reason is required.");

        var b = await db.Businesses.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Uid == uid, ct);
        if (b is null) return ServiceResult.Fail("Business not found.", 404);

        b.IsSuspended = true;
        b.SuspendedAt = DateTime.UtcNow;
        b.SuspensionReason = reason;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("business.suspend", "Business", uid, new { reason }, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> UnsuspendAsync(Guid uid, CancellationToken ct)
    {
        var b = await db.Businesses.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Uid == uid, ct);
        if (b is null) return ServiceResult.Fail("Business not found.", 404);

        b.IsSuspended = false;
        b.SuspendedAt = null;
        b.SuspensionReason = null;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("business.unsuspend", "Business", uid, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> SoftDeleteAsync(Guid uid, CancellationToken ct)
    {
        var b = await db.Businesses.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Uid == uid, ct);
        if (b is null) return ServiceResult.Fail("Business not found.", 404);

        b.IsActive = false;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("business.delete", "Business", uid, new { b.Name }, ct: ct);
        return ServiceResult.Ok();
    }
}
