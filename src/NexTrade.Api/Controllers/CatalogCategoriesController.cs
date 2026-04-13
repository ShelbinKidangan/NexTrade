using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/catalog-categories")]
public class CatalogCategoriesController(CatalogCategoryService service) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult> GetAll(CancellationToken ct)
        => Ok(await service.GetAllAsync(ct));

    [HttpPost]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult> Create([FromBody] CatalogCategoryService.CreateCategoryRequest req, CancellationToken ct)
    {
        var result = await service.CreateAsync(req, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("{uid:guid}")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult> Update(Guid uid, [FromBody] CatalogCategoryService.UpdateCategoryRequest req, CancellationToken ct)
    {
        var result = await service.UpdateAsync(uid, req, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("{uid:guid}")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult> Delete(Guid uid, CancellationToken ct)
    {
        var result = await service.DeleteAsync(uid, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
