using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CatalogController(CatalogService service, CatalogMediaService media) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] CatalogService.CatalogFilter filter, CancellationToken ct)
        => Ok(await service.GetAllAsync(filter, ct));

    [HttpGet("{uid:guid}")]
    public async Task<ActionResult> GetByUid(Guid uid, CancellationToken ct)
    {
        var result = await service.GetByUidAsync(uid, ct);
        return result.Succeeded ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CatalogService.CreateCatalogItemRequest req, CancellationToken ct)
    {
        var result = await service.CreateAsync(req, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("{uid:guid}")]
    public async Task<ActionResult> Update(Guid uid, [FromBody] CatalogService.UpdateCatalogItemRequest req, CancellationToken ct)
    {
        var result = await service.UpdateAsync(uid, req, ct);
        return result.Succeeded ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPatch("{uid:guid}/status")]
    public async Task<ActionResult> SetStatus(Guid uid, [FromBody] CatalogService.SetStatusRequest req, CancellationToken ct)
    {
        var result = await service.SetStatusAsync(uid, req.Status, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("{uid:guid}")]
    public async Task<ActionResult> Delete(Guid uid, CancellationToken ct)
    {
        var result = await service.DeleteAsync(uid, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    // --- Media ---

    [HttpGet("{uid:guid}/media")]
    public async Task<ActionResult> ListMedia(Guid uid, CancellationToken ct)
        => Ok(await media.ListAsync(uid, ct));

    [HttpPost("{uid:guid}/media")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<ActionResult> UploadMedia(Guid uid, IFormFile file, CancellationToken ct)
    {
        var result = await media.UploadAsync(uid, file, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("{uid:guid}/media/{mediaId:long}")]
    public async Task<ActionResult> DeleteMedia(Guid uid, long mediaId, CancellationToken ct)
    {
        var result = await media.DeleteAsync(uid, mediaId, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("{uid:guid}/media/{mediaId:long}/primary")]
    public async Task<ActionResult> SetPrimaryMedia(Guid uid, long mediaId, CancellationToken ct)
    {
        var result = await media.SetPrimaryAsync(uid, mediaId, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
