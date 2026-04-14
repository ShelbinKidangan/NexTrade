using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NexTrade.Core.Entities;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Infrastructure.Services;

public class ComplianceService
{
    private readonly AppDbContext _db;
    private readonly IUnitOfWork _uow;
    private readonly ITenantContext _tenant;
    private readonly BlobContainerClient _container;
    private bool _containerReady;

    public ComplianceService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant, IConfiguration config)
    {
        _db = db;
        _uow = uow;
        _tenant = tenant;

        var connString = config["Storage:ConnectionString"] ?? "UseDevelopmentStorage=true";
        var containerName = config["Storage:ComplianceContainer"] ?? "nextrade-compliance";

        var serviceClient = new BlobServiceClient(connString);
        _container = serviceClient.GetBlobContainerClient(containerName);
    }

    private async Task EnsureContainerAsync(CancellationToken ct)
    {
        if (_containerReady) return;
        await _container.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);
        _containerReady = true;
    }

    public record ComplianceDocumentDto(
        Guid Uid, string Type, string Title, string? Description,
        string FileUrl, string FileName, string? IssuingBody,
        DateTime? IssueDate, DateTime? ExpiryDate,
        string Status, string? RejectionReason, DateTime? VerifiedAt,
        string Visibility, DateTime CreatedAt);

    public record CreateDocumentRequest(
        ComplianceDocumentType Type, string Title, string? Description,
        string? IssuingBody, DateTime? IssueDate, DateTime? ExpiryDate,
        DocumentVisibility Visibility);

    public record RejectRequest(string Reason);

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf", "image/jpeg", "image/png",
    };
    private const long MaxFileSizeBytes = 20 * 1024 * 1024;

    public async Task<List<ComplianceDocumentDto>> ListMineAsync(CancellationToken ct)
    {
        var docs = await _db.ComplianceDocuments
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(ct);
        return docs.Select(MapToDto).ToList();
    }

    public async Task<ServiceResult<ComplianceDocumentDto>> GetAsync(Guid uid, CancellationToken ct)
    {
        var doc = await _db.ComplianceDocuments.FirstOrDefaultAsync(d => d.Uid == uid, ct);
        if (doc is null) return ServiceResult<ComplianceDocumentDto>.Fail("Document not found.", 404);
        return ServiceResult<ComplianceDocumentDto>.Ok(MapToDto(doc));
    }

    public async Task<ServiceResult<ComplianceDocumentDto>> UploadAsync(
        IFormFile file, CreateDocumentRequest req, CancellationToken ct)
    {
        if (file.Length == 0)
            return ServiceResult<ComplianceDocumentDto>.Fail("File is empty.", 400);
        if (file.Length > MaxFileSizeBytes)
            return ServiceResult<ComplianceDocumentDto>.Fail(
                $"File exceeds {MaxFileSizeBytes / (1024 * 1024)} MB limit.", 400);
        if (string.IsNullOrEmpty(file.ContentType) || !AllowedContentTypes.Contains(file.ContentType))
            return ServiceResult<ComplianceDocumentDto>.Fail(
                $"Unsupported content type '{file.ContentType}'.", 400);

        await EnsureContainerAsync(ct);

        var ext = Path.GetExtension(file.FileName);
        var blobName = $"{_tenant.TenantId}/{Guid.NewGuid():N}{ext}";
        var blobClient = _container.GetBlobClient(blobName);

        await using (var stream = file.OpenReadStream())
        {
            await blobClient.UploadAsync(
                stream,
                new BlobHttpHeaders { ContentType = file.ContentType },
                cancellationToken: ct);
        }

        var doc = new ComplianceDocument
        {
            Type = req.Type,
            Title = req.Title,
            Description = req.Description,
            FileUrl = blobClient.Uri.ToString(),
            FileName = file.FileName,
            IssuingBody = req.IssuingBody,
            IssueDate = req.IssueDate,
            ExpiryDate = req.ExpiryDate,
            Status = ComplianceDocumentStatus.Pending,
            Visibility = req.Visibility,
        };
        _db.ComplianceDocuments.Add(doc);
        await _uow.SaveChangesAsync(ct);

        return ServiceResult<ComplianceDocumentDto>.Created(MapToDto(doc));
    }

    public async Task<ServiceResult> DeleteAsync(Guid uid, CancellationToken ct)
    {
        var doc = await _db.ComplianceDocuments.FirstOrDefaultAsync(d => d.Uid == uid, ct);
        if (doc is null) return ServiceResult.Fail("Document not found.", 404);

        var blobName = ExtractBlobName(doc.FileUrl);
        if (blobName is not null)
            await _container.DeleteBlobIfExistsAsync(blobName, cancellationToken: ct);

        _db.ComplianceDocuments.Remove(doc);
        await _uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }

    // --- admin actions ---

    public async Task<ServiceResult> VerifyAsync(Guid uid, CancellationToken ct)
    {
        var doc = await _db.ComplianceDocuments.IgnoreQueryFilters()
            .FirstOrDefaultAsync(d => d.Uid == uid, ct);
        if (doc is null) return ServiceResult.Fail("Document not found.", 404);

        doc.Status = ComplianceDocumentStatus.Verified;
        doc.VerifiedAt = DateTime.UtcNow;
        doc.VerifiedBy = _tenant.UserId;

        // Clear any prior rejection reason if this doc was previously rejected.
        await _uow.SaveChangesAsync(ct);

        // Flip the Business.IsVerified badge if this is a required doc type.
        await UpdateVerifiedBadgeAsync(doc.TenantId, ct);

        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> RejectAsync(Guid uid, string reason, CancellationToken ct)
    {
        var doc = await _db.ComplianceDocuments.IgnoreQueryFilters()
            .FirstOrDefaultAsync(d => d.Uid == uid, ct);
        if (doc is null) return ServiceResult.Fail("Document not found.", 404);
        if (string.IsNullOrWhiteSpace(reason))
            return ServiceResult.Fail("Rejection reason is required.");

        doc.Status = ComplianceDocumentStatus.Rejected;
        doc.Description = $"[Rejected: {reason}]\n{doc.Description}";

        await _uow.SaveChangesAsync(ct);
        await UpdateVerifiedBadgeAsync(doc.TenantId, ct);
        return ServiceResult.Ok();
    }

    private async Task UpdateVerifiedBadgeAsync(Guid tenantUid, CancellationToken ct)
    {
        var business = await _db.Businesses.IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == tenantUid, ct);
        if (business is null) return;

        var hasVerifiedDoc = await _db.ComplianceDocuments.IgnoreQueryFilters()
            .AnyAsync(d => d.TenantId == tenantUid
                && d.Status == ComplianceDocumentStatus.Verified
                && (d.Type == ComplianceDocumentType.BusinessLicense
                    || d.Type == ComplianceDocumentType.TaxRegistration), ct);

        business.IsVerified = hasVerifiedDoc;
        business.VerifiedAt = hasVerifiedDoc ? (business.VerifiedAt ?? DateTime.UtcNow) : null;
        await _uow.SaveChangesAsync(ct);
    }

    private string? ExtractBlobName(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return null;
        var prefix = $"/{_container.Name}/";
        var path = uri.AbsolutePath;
        var idx = path.IndexOf(prefix, StringComparison.Ordinal);
        if (idx < 0) return null;
        return path[(idx + prefix.Length)..];
    }

    private static ComplianceDocumentDto MapToDto(ComplianceDocument d) => new(
        d.Uid, d.Type.ToString(), d.Title, d.Description,
        d.FileUrl, d.FileName, d.IssuingBody,
        d.IssueDate, d.ExpiryDate,
        d.Status.ToString(), null, d.VerifiedAt,
        d.Visibility.ToString(), d.CreatedAt);
}
