using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/connections")]
[Authorize]
public class ConnectionsController(ConnectionsService service) : ControllerBase
{
    [HttpGet("following")]
    public async Task<ActionResult> Following(CancellationToken ct)
        => Ok(await service.FollowingAsync(ct));

    [HttpGet("followers")]
    public async Task<ActionResult> Followers(CancellationToken ct)
        => Ok(await service.FollowersAsync(ct));

    [HttpPost("follow/{targetUid:guid}")]
    public async Task<ActionResult> Follow(Guid targetUid, CancellationToken ct)
    {
        var result = await service.FollowAsync(targetUid, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpDelete("follow/{targetUid:guid}")]
    public async Task<ActionResult> Unfollow(Guid targetUid, CancellationToken ct)
    {
        var result = await service.UnfollowAsync(targetUid, ct);
        return result.Succeeded ? NoContent() : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpGet("follow/{targetUid:guid}/status")]
    [AllowAnonymous]
    public async Task<ActionResult> FollowStatus(Guid targetUid, CancellationToken ct)
        => Ok(await service.GetFollowStatusAsync(targetUid, ct));
}
