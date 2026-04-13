using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/saved-suppliers")]
[Authorize]
public class SavedSuppliersController(SavedSuppliersService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] Guid? listUid, CancellationToken ct)
        => Ok(await service.ListAsync(listUid, ct));

    [HttpPost]
    public async Task<ActionResult> Save([FromBody] SavedSuppliersService.SaveSupplierRequest req, CancellationToken ct)
    {
        var result = await service.SaveAsync(req, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPatch("{uid:guid}")]
    public async Task<ActionResult> Update(Guid uid, [FromBody] SavedSuppliersService.UpdateSavedSupplierRequest req, CancellationToken ct)
    {
        var result = await service.UpdateAsync(uid, req, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("{uid:guid}")]
    public async Task<ActionResult> Remove(Guid uid, CancellationToken ct)
    {
        var result = await service.RemoveAsync(uid, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("lists")]
    public async Task<ActionResult> GetLists(CancellationToken ct)
        => Ok(await service.GetListsAsync(ct));

    [HttpPost("lists")]
    public async Task<ActionResult> CreateList([FromBody] SavedSuppliersService.CreateListRequest req, CancellationToken ct)
    {
        var result = await service.CreateListAsync(req, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPatch("lists/{uid:guid}")]
    public async Task<ActionResult> UpdateList(Guid uid, [FromBody] SavedSuppliersService.UpdateListRequest req, CancellationToken ct)
    {
        var result = await service.UpdateListAsync(uid, req, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("lists/{uid:guid}")]
    public async Task<ActionResult> DeleteList(Guid uid, CancellationToken ct)
    {
        var result = await service.DeleteListAsync(uid, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
