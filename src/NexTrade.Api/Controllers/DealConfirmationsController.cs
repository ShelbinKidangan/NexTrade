using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/deal-confirmations")]
[Authorize]
public class DealConfirmationsController(DealConfirmationsService service) : ControllerBase
{
    [HttpGet("pending")]
    public async Task<ActionResult> Pending(CancellationToken ct)
        => Ok(await service.GetPendingAsync(ct));

    [HttpGet("mine")]
    public async Task<ActionResult> Mine(CancellationToken ct)
        => Ok(await service.GetMineAsync(ct));

    [HttpGet("{uid:guid}")]
    public async Task<ActionResult> GetByUid(Guid uid, CancellationToken ct)
    {
        var r = await service.GetByUidAsync(uid, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/confirm")]
    public async Task<ActionResult> Confirm(Guid uid, CancellationToken ct)
    {
        var r = await service.ConfirmAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost]
    public async Task<ActionResult> CreateStandalone(
        [FromBody] DealConfirmationsService.CreateStandaloneRequest req, CancellationToken ct)
    {
        var r = await service.CreateStandaloneAsync(req, ct);
        return r.Succeeded ? StatusCode(r.StatusCode, r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }
}
