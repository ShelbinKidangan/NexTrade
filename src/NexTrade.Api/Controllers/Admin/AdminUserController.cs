using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services.Admin;

namespace NexTrade.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/users")]
[Authorize(Policy = "PlatformAdmin")]
public class AdminUserController(AdminUserService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> List([FromQuery] AdminUserService.AdminUserFilter filter, CancellationToken ct)
        => Ok(await service.ListAsync(filter, ct));

    [HttpPost("{uid:guid}/unlock")]
    public async Task<ActionResult> Unlock(Guid uid, CancellationToken ct)
    {
        var r = await service.UnlockAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/reset-password")]
    public async Task<ActionResult> ResetPassword(Guid uid, [FromBody] AdminUserService.ResetPasswordRequest req, CancellationToken ct)
    {
        var r = await service.ResetPasswordAsync(uid, req.NewPassword, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error, errors = r.Errors });
    }

    [HttpPost("{uid:guid}/promote")]
    public async Task<ActionResult> Promote(Guid uid, CancellationToken ct)
    {
        var r = await service.PromoteAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/demote")]
    public async Task<ActionResult> Demote(Guid uid, CancellationToken ct)
    {
        var r = await service.DemoteAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }
}
