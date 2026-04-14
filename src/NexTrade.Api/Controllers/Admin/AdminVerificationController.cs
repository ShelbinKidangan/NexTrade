using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services.Admin;

namespace NexTrade.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/verifications")]
[Authorize(Policy = "PlatformAdmin")]
public class AdminVerificationController(AdminVerificationService service) : ControllerBase
{
    [HttpGet("compliance")]
    public async Task<ActionResult> List([FromQuery] AdminVerificationService.AdminVerificationFilter filter, CancellationToken ct)
        => Ok(await service.ListAsync(filter, ct));

    [HttpPost("compliance/{uid:guid}/approve")]
    public async Task<ActionResult> Approve(Guid uid, CancellationToken ct)
    {
        var r = await service.ApproveAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("compliance/{uid:guid}/reject")]
    public async Task<ActionResult> Reject(Guid uid, [FromBody] AdminVerificationService.RejectRequest req, CancellationToken ct)
    {
        var r = await service.RejectAsync(uid, req.Reason, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("compliance/bulk-approve")]
    public async Task<ActionResult> BulkApprove([FromBody] AdminVerificationService.BulkApproveRequest req, CancellationToken ct)
    {
        var r = await service.BulkApproveAsync(req.Uids, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }
}
