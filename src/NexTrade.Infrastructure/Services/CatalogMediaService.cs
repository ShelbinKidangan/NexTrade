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

public class CatalogMediaService
{
    private readonly AppDbContext _db;
    private readonly IUnitOfWork _uow;
    private readonly ITenantContext _tenant;
    private readonly BlobContainerClient _container;
    private bool _containerReady;

    public CatalogMediaService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant, IConfiguration config)
    {
        _db = db;
        _uow = uow;
        _tenant = tenant;

        var connString = config["Storage:ConnectionString"] ?? "UseDevelopmentStorage=true";
        var containerName = config["Storage:CatalogMediaContainer"] ?? "nextrade-catalog-media";

        var serviceClient = new BlobServiceClient(connString);
        _container = serviceClient.GetBlobContainerClient(containerName);
    }

    private async Task EnsureContainerAsync(CancellationToken ct)
    {
        if (_containerReady) return;
        await _container.CreateIfNotExistsAsync(PublicAccessType.Blob, cancellationToken: ct);
        _containerReady = true;
    }

    public record MediaDto(long Id, string Url, string FileName, long FileSize, bool IsPrimary, int SortOrder);

    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "image/gif",
    };
    private const long MaxFileSizeBytes = 10 * 1024 * 1024;

    public async Task<ServiceResult<MediaDto>> UploadAsync(Guid itemUid, IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0)
            return ServiceResult<MediaDto>.Fail("File is empty.", 400);
        if (file.Length > MaxFileSizeBytes)
            return ServiceResult<MediaDto>.Fail($"File exceeds {MaxFileSizeBytes / (1024 * 1024)} MB limit.", 400);
        if (string.IsNullOrEmpty(file.ContentType) || !AllowedContentTypes.Contains(file.ContentType))
            return ServiceResult<MediaDto>.Fail(
                $"Unsupported content type '{file.ContentType}'. Allowed: {string.Join(", ", AllowedContentTypes)}.", 400);

        var item = await _db.CatalogItems
            .Include(c => c.Media)
            .FirstOrDefaultAsync(c => c.Uid == itemUid, ct);
        if (item is null)
            return ServiceResult<MediaDto>.Fail("Catalog item not found.", 404);

        await EnsureContainerAsync(ct);

        var ext = Path.GetExtension(file.FileName);
        var blobName = $"{_tenant.TenantId}/{item.Uid}/{Guid.NewGuid():N}{ext}";
        var blobClient = _container.GetBlobClient(blobName);

        await using (var stream = file.OpenReadStream())
        {
            await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType }, cancellationToken: ct);
        }

        var media = new CatalogMedia
        {
            CatalogItemId = item.Id,
            MediaType = MediaType.Image,
            Url = blobClient.Uri.ToString(),
            FileName = file.FileName,
            FileSize = file.Length,
            IsPrimary = item.Media.Count == 0,
            SortOrder = item.Media.Count
        };

        _db.CatalogMedia.Add(media);
        await _uow.SaveChangesAsync(ct);

        return ServiceResult<MediaDto>.Created(new MediaDto(
            media.Id, media.Url, media.FileName, media.FileSize, media.IsPrimary, media.SortOrder));
    }

    public async Task<List<MediaDto>> ListAsync(Guid itemUid, CancellationToken ct)
    {
        var item = await _db.CatalogItems
            .Include(c => c.Media)
            .FirstOrDefaultAsync(c => c.Uid == itemUid, ct);

        return item?.Media
            .OrderBy(m => m.SortOrder)
            .Select(m => new MediaDto(m.Id, m.Url, m.FileName, m.FileSize, m.IsPrimary, m.SortOrder))
            .ToList() ?? [];
    }

    public async Task<ServiceResult> DeleteAsync(Guid itemUid, long mediaId, CancellationToken ct)
    {
        var media = await _db.CatalogMedia
            .Include(m => m.CatalogItem)
            .FirstOrDefaultAsync(m => m.Id == mediaId && m.CatalogItem.Uid == itemUid, ct);

        if (media is null)
            return ServiceResult.Fail("Media not found.", 404);

        var blobName = ExtractBlobName(media.Url);
        if (blobName is not null)
            await _container.DeleteBlobIfExistsAsync(blobName, cancellationToken: ct);

        var wasPrimary = media.IsPrimary;
        _db.CatalogMedia.Remove(media);
        await _uow.SaveChangesAsync(ct);

        if (wasPrimary)
        {
            var fallback = await _db.CatalogMedia
                .Where(m => m.CatalogItemId == media.CatalogItemId)
                .OrderBy(m => m.SortOrder)
                .FirstOrDefaultAsync(ct);
            if (fallback is not null)
            {
                fallback.IsPrimary = true;
                await _uow.SaveChangesAsync(ct);
            }
        }

        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> SetPrimaryAsync(Guid itemUid, long mediaId, CancellationToken ct)
    {
        var item = await _db.CatalogItems
            .Include(c => c.Media)
            .FirstOrDefaultAsync(c => c.Uid == itemUid, ct);
        if (item is null)
            return ServiceResult.Fail("Catalog item not found.", 404);

        var target = item.Media.FirstOrDefault(m => m.Id == mediaId);
        if (target is null)
            return ServiceResult.Fail("Media not found.", 404);

        foreach (var m in item.Media)
            m.IsPrimary = m.Id == mediaId;

        await _uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
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
}
