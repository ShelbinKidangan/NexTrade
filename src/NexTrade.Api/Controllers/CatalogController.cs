using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Core.Enums;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CatalogController(CatalogService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] CatalogService.CatalogFilter filter, CancellationToken ct)
        => Ok(await service.GetAllAsync(filter, ct));

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

    [HttpPost("{uid:guid}/publish")]
    public async Task<ActionResult> Publish(Guid uid, CancellationToken ct)
    {
        var result = await service.SetStatusAsync(uid, CatalogItemStatus.Published, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("{uid:guid}/archive")]
    public async Task<ActionResult> Archive(Guid uid, CancellationToken ct)
    {
        var result = await service.SetStatusAsync(uid, CatalogItemStatus.Archived, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
