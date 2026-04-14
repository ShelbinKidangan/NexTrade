using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BusinessesController(BusinessService service, TrustScoreService trustScore) : ControllerBase
{
    [HttpPost("{uid:guid}/trust-score/recompute")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult> RecomputeTrust(Guid uid, CancellationToken ct)
    {
        var score = await trustScore.RecomputeOneAsync(uid, ct);
        return Ok(new { uid, trustScore = score });
    }

    [HttpGet("{uid:guid}/trust-score")]
    [AllowAnonymous]
    public async Task<ActionResult> GetTrustBreakdown(Guid uid, CancellationToken ct)
        => Ok(await trustScore.ComputeAsync(uid, ct));


    [HttpGet("discover")]
    [AllowAnonymous]
    public async Task<ActionResult> Discover([FromQuery] BusinessService.BusinessFilter filter, CancellationToken ct)
        => Ok(await service.DiscoverAsync(filter, ct));

    [HttpGet("{uid:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetByUid(Guid uid, CancellationToken ct)
    {
        var result = await service.GetByUidAsync(uid, ct);
        return result.Succeeded ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("me")]
    public async Task<ActionResult> GetMine(CancellationToken ct)
    {
        var result = await service.GetMineAsync(ct);
        return result.Succeeded ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPatch("me")]
    public async Task<ActionResult> UpdateMine([FromBody] BusinessService.UpdateProfileRequest req, CancellationToken ct)
    {
        var result = await service.UpdateMineAsync(req, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPut("{uid:guid}/profile")]
    public async Task<ActionResult> UpdateProfile(Guid uid, [FromBody] BusinessService.UpdateProfileRequest req, CancellationToken ct)
    {
        var result = await service.UpdateProfileAsync(uid, req, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
