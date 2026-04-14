using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/rfqs")]
[Authorize]
public class RfqController(RfqService service) : ControllerBase
{
    [HttpGet("mine")]
    public async Task<ActionResult> Mine([FromQuery] RfqService.RfqFilter filter, CancellationToken ct)
        => Ok(await service.GetMineAsync(filter, ct));

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult> Public([FromQuery] RfqService.RfqFilter filter, CancellationToken ct)
        => Ok(await service.GetPublicAsync(filter, ct));

    [HttpGet("targeted")]
    public async Task<ActionResult> Targeted([FromQuery] RfqService.RfqFilter filter, CancellationToken ct)
        => Ok(await service.GetTargetedAsync(filter, ct));

    [HttpGet("{uid:guid}")]
    public async Task<ActionResult> GetByUid(Guid uid, CancellationToken ct)
    {
        var r = await service.GetByUidAsync(uid, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] RfqService.CreateRfqRequest req, CancellationToken ct)
    {
        var r = await service.CreateAsync(req, ct);
        return r.Succeeded ? StatusCode(r.StatusCode, r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPatch("{uid:guid}")]
    public async Task<ActionResult> Update(Guid uid, [FromBody] RfqService.UpdateRfqRequest req, CancellationToken ct)
    {
        var r = await service.UpdateAsync(uid, req, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/publish")]
    public async Task<ActionResult> Publish(Guid uid, CancellationToken ct)
    {
        var r = await service.PublishAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/close")]
    public async Task<ActionResult> Close(Guid uid, CancellationToken ct)
    {
        var r = await service.CloseAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/cancel")]
    public async Task<ActionResult> Cancel(Guid uid, CancellationToken ct)
    {
        var r = await service.CancelAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }
}
