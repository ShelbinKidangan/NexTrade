using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Authorize]
public class QuoteController(QuoteService service) : ControllerBase
{
    [HttpGet("api/rfqs/{rfqUid:guid}/quotes")]
    public async Task<ActionResult> GetForRfq(Guid rfqUid, CancellationToken ct)
        => Ok(await service.GetForRfqAsync(rfqUid, ct));

    [HttpPost("api/rfqs/{rfqUid:guid}/quotes")]
    public async Task<ActionResult> Create(Guid rfqUid, [FromBody] QuoteService.CreateQuoteRequest req, CancellationToken ct)
    {
        var r = await service.CreateForRfqAsync(rfqUid, req, ct);
        return r.Succeeded ? StatusCode(r.StatusCode, r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPatch("api/quotes/{uid:guid}")]
    public async Task<ActionResult> Update(Guid uid, [FromBody] QuoteService.UpdateQuoteRequest req, CancellationToken ct)
    {
        var r = await service.UpdateAsync(uid, req, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("api/quotes/{uid:guid}/submit")]
    public async Task<ActionResult> Submit(Guid uid, CancellationToken ct)
    {
        var r = await service.SubmitAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("api/quotes/{uid:guid}/withdraw")]
    public async Task<ActionResult> Withdraw(Guid uid, CancellationToken ct)
    {
        var r = await service.WithdrawAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpGet("api/rfqs/{rfqUid:guid}/quotes/comparison")]
    public async Task<ActionResult> Comparison(Guid rfqUid, CancellationToken ct)
    {
        var r = await service.GetComparisonAsync(rfqUid, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("api/rfqs/{rfqUid:guid}/award")]
    public async Task<ActionResult> Award(Guid rfqUid, [FromBody] QuoteService.AwardRequest req, CancellationToken ct)
    {
        var r = await service.AwardAsync(rfqUid, req, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }
}
