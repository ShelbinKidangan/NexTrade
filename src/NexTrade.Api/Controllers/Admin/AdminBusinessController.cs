using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services.Admin;

namespace NexTrade.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/businesses")]
[Authorize(Policy = "PlatformAdmin")]
public class AdminBusinessController(AdminBusinessService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> List([FromQuery] AdminBusinessService.AdminBusinessFilter filter, CancellationToken ct)
        => Ok(await service.ListAsync(filter, ct));

    [HttpGet("{uid:guid}")]
    public async Task<ActionResult> Detail(Guid uid, CancellationToken ct)
    {
        var r = await service.GetDetailAsync(uid, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/verify")]
    public async Task<ActionResult> Verify(Guid uid, CancellationToken ct)
    {
        var r = await service.VerifyAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/suspend")]
    public async Task<ActionResult> Suspend(Guid uid, [FromBody] AdminBusinessService.SuspendRequest req, CancellationToken ct)
    {
        var r = await service.SuspendAsync(uid, req.Reason, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/unsuspend")]
    public async Task<ActionResult> Unsuspend(Guid uid, CancellationToken ct)
    {
        var r = await service.UnsuspendAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/delete")]
    public async Task<ActionResult> Delete(Guid uid, CancellationToken ct)
    {
        var r = await service.SoftDeleteAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }
}
