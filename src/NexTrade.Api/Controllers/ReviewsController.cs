using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Authorize]
public class ReviewsController(ReviewsService service) : ControllerBase
{
    [HttpPost("api/reviews")]
    public async Task<ActionResult> Create(
        [FromBody] ReviewsService.CreateReviewRequest req, CancellationToken ct)
    {
        var r = await service.CreateAsync(req, ct);
        return r.Succeeded ? StatusCode(r.StatusCode, r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpGet("api/businesses/{uid:guid}/reviews")]
    [AllowAnonymous]
    public async Task<ActionResult> ForBusiness(
        Guid uid, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await service.GetForBusinessAsync(uid, page, pageSize, ct));
}
