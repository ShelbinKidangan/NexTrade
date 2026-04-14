using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services.Admin;

public class AdminVerificationService(AppDbContext db, IUnitOfWork uow, IAdminAuditLog audit, ITenantContext tenant)
{
    public record AdminComplianceDocDto(
        Guid Uid, Guid BusinessUid, string BusinessName,
        string Type, string Title, string? Description, string FileUrl, string FileName,
        string? IssuingBody, DateTime? IssueDate, DateTime? ExpiryDate,
        string Status, string Visibility, DateTime CreatedAt);

    public record AdminVerificationFilter(
        int Page = 1, int PageSize = 25, string? Status = "Pending",
        string? Type = null, string? Country = null, Guid? TenantUid = null,
        int? AgeDays = null);

    public record RejectRequest(string Reason);
    public record BulkApproveRequest(List<Guid> Uids);

    public async Task<PagedResult<AdminComplianceDocDto>> ListAsync(AdminVerificationFilter filter, CancellationToken ct)
    {
        var query = db.ComplianceDocuments
            .IgnoreQueryFilters()
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.Status)
            && Enum.TryParse<ComplianceDocumentStatus>(filter.Status, true, out var status))
            query = query.Where(d => d.Status == status);

        if (!string.IsNullOrEmpty(filter.Type)
            && Enum.TryParse<ComplianceDocumentType>(filter.Type, true, out var type))
            query = query.Where(d => d.Type == type);

        if (filter.TenantUid is not null)
            query = query.Where(d => d.TenantId == filter.TenantUid);

        if (filter.AgeDays is not null)
        {
            var cutoff = DateTime.UtcNow.AddDays(-filter.AgeDays.Value);
            query = query.Where(d => d.CreatedAt <= cutoff);
        }

        query = query.OrderBy(d => d.CreatedAt);

        var totalCount = await query.CountAsync(ct);
        var docs = await query
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync(ct);

        var tenantUids = docs.Select(d => d.TenantId).Distinct().ToList();
        var biz = await db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Profile)
            .Where(b => tenantUids.Contains(b.Uid))
            .Select(b => new { b.Uid, b.Name, Country = b.Profile != null ? b.Profile.CountryCode : null })
            .ToListAsync(ct);

        if (!string.IsNullOrEmpty(filter.Country))
        {
            var allowed = biz.Where(b => b.Country == filter.Country).Select(b => b.Uid).ToHashSet();
            docs = docs.Where(d => allowed.Contains(d.TenantId)).ToList();
        }

        var bizMap = biz.ToDictionary(b => b.Uid);
        var items = docs.Select(d =>
        {
            bizMap.TryGetValue(d.TenantId, out var b);
            return new AdminComplianceDocDto(
                d.Uid, d.TenantId, b?.Name ?? "",
                d.Type.ToString(), d.Title, d.Description, d.FileUrl, d.FileName,
                d.IssuingBody, d.IssueDate, d.ExpiryDate,
                d.Status.ToString(), d.Visibility.ToString(), d.CreatedAt);
        }).ToList();

        return new PagedResult<AdminComplianceDocDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize,
        };
    }

    public async Task<ServiceResult> ApproveAsync(Guid uid, CancellationToken ct)
    {
        var doc = await db.ComplianceDocuments.IgnoreQueryFilters()
            .FirstOrDefaultAsync(d => d.Uid == uid, ct);
        if (doc is null) return ServiceResult.Fail("Document not found.", 404);

        doc.Status = ComplianceDocumentStatus.Verified;
        doc.VerifiedAt = DateTime.UtcNow;
        doc.VerifiedBy = tenant.UserId;
        await uow.SaveChangesAsync(ct);

        await UpdateVerifiedBadgeAsync(doc.TenantId, ct);
        await audit.RecordAsync("compliance.approve", "ComplianceDocument", uid, new { tenant = doc.TenantId }, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> RejectAsync(Guid uid, string reason, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(reason))
            return ServiceResult.Fail("Rejection reason is required.");

        var doc = await db.ComplianceDocuments.IgnoreQueryFilters()
            .FirstOrDefaultAsync(d => d.Uid == uid, ct);
        if (doc is null) return ServiceResult.Fail("Document not found.", 404);

        doc.Status = ComplianceDocumentStatus.Rejected;
        doc.Description = $"[Rejected: {reason}]\n{doc.Description}";
        await uow.SaveChangesAsync(ct);

        await UpdateVerifiedBadgeAsync(doc.TenantId, ct);
        await audit.RecordAsync("compliance.reject", "ComplianceDocument", uid, new { reason }, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult<object>> BulkApproveAsync(List<Guid> uids, CancellationToken ct)
    {
        if (uids is null || uids.Count == 0)
            return ServiceResult<object>.Fail("No documents selected.");

        var docs = await db.ComplianceDocuments.IgnoreQueryFilters()
            .Where(d => uids.Contains(d.Uid))
            .ToListAsync(ct);

        foreach (var d in docs)
        {
            d.Status = ComplianceDocumentStatus.Verified;
            d.VerifiedAt = DateTime.UtcNow;
            d.VerifiedBy = tenant.UserId;
        }
        await uow.SaveChangesAsync(ct);

        foreach (var tenantUid in docs.Select(d => d.TenantId).Distinct())
            await UpdateVerifiedBadgeAsync(tenantUid, ct);

        await audit.RecordAsync("compliance.bulkApprove", "ComplianceDocument",
            payload: new { count = docs.Count, uids = docs.Select(d => d.Uid).ToList() }, ct: ct);

        return ServiceResult<object>.Ok(new { approved = docs.Count });
    }

    private async Task UpdateVerifiedBadgeAsync(Guid tenantUid, CancellationToken ct)
    {
        var business = await db.Businesses.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == tenantUid, ct);
        if (business is null) return;

        var hasVerifiedDoc = await db.ComplianceDocuments.IgnoreQueryFilters()
            .AnyAsync(d => d.TenantId == tenantUid
                && d.Status == ComplianceDocumentStatus.Verified
                && (d.Type == ComplianceDocumentType.BusinessLicense
                    || d.Type == ComplianceDocumentType.TaxRegistration), ct);

        business.IsVerified = hasVerifiedDoc;
        business.VerifiedAt = hasVerifiedDoc ? (business.VerifiedAt ?? DateTime.UtcNow) : null;
        await uow.SaveChangesAsync(ct);
    }
}
