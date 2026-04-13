using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/discover")]
[AllowAnonymous]
public class DiscoveryController(DiscoveryService service) : ControllerBase
{
    [HttpGet("items")]
    public async Task<ActionResult> Items([FromQuery] DiscoveryService.DiscoverItemsFilter filter, CancellationToken ct)
        => Ok(await service.SearchItemsAsync(filter, ct));

    [HttpGet("businesses")]
    public async Task<ActionResult> Businesses([FromQuery] DiscoveryService.DiscoverBusinessesFilter filter, CancellationToken ct)
        => Ok(await service.SearchBusinessesAsync(filter, ct));

    [HttpGet("business/{uid:guid}")]
    public async Task<ActionResult> PublicProfile(Guid uid, CancellationToken ct)
    {
        var result = await service.GetPublicProfileAsync(uid, ct);
        return result.Succeeded ? Ok(result.Data) : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
