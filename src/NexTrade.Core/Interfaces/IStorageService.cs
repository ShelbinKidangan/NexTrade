namespace NexTrade.Core.Interfaces;

public interface IStorageService
{
    Task<string> UploadAsync(Stream content, string fileName, string contentType,
        Guid tenantId, string entityType, Guid entityUid, CancellationToken ct = default);

    Task<(Stream Content, string ContentType, string FileName)?> GetStreamAsync(string storageKey, CancellationToken ct = default);

    Task DeleteAsync(string storageKey, CancellationToken ct = default);
}
