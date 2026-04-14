using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services.Admin;

namespace NexTrade.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/content")]
[Authorize(Policy = "PlatformAdmin")]
public class AdminContentController(AdminContentService service) : ControllerBase
{
    // --- Catalog ---
    [HttpGet("catalog-items")]
    public async Task<ActionResult> ListCatalog([FromQuery] AdminContentService.ContentFilter filter, CancellationToken ct)
        => Ok(await service.ListCatalogItemsAsync(filter, ct));

    [HttpPost("catalog-items/{uid:guid}/hide")]
    public async Task<ActionResult> HideCatalog(Guid uid, CancellationToken ct)
    {
        var r = await service.HideCatalogItemAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("catalog-items/{uid:guid}/flag")]
    public async Task<ActionResult> FlagCatalog(Guid uid, CancellationToken ct)
    {
        var r = await service.FlagCatalogItemAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("catalog-items/{uid:guid}/delete")]
    public async Task<ActionResult> DeleteCatalog(Guid uid, CancellationToken ct)
    {
        var r = await service.DeleteCatalogItemAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    // --- RFQs ---
    [HttpGet("rfqs")]
    public async Task<ActionResult> ListRfqs([FromQuery] AdminContentService.ContentFilter filter, CancellationToken ct)
        => Ok(await service.ListRfqsAsync(filter, ct));

    [HttpPost("rfqs/{uid:guid}/hide")]
    public async Task<ActionResult> HideRfq(Guid uid, CancellationToken ct)
    {
        var r = await service.HideRfqAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("rfqs/{uid:guid}/flag")]
    public async Task<ActionResult> FlagRfq(Guid uid, CancellationToken ct)
    {
        var r = await service.FlagRfqAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("rfqs/{uid:guid}/delete")]
    public async Task<ActionResult> DeleteRfq(Guid uid, CancellationToken ct)
    {
        var r = await service.DeleteRfqAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    // --- Reviews ---
    [HttpGet("reviews")]
    public async Task<ActionResult> ListReviews([FromQuery] AdminContentService.ContentFilter filter, CancellationToken ct)
        => Ok(await service.ListReviewsAsync(filter, ct));

    [HttpPost("reviews/{uid:guid}/hide")]
    public async Task<ActionResult> HideReview(Guid uid, CancellationToken ct)
    {
        var r = await service.HideReviewAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("reviews/{uid:guid}/flag")]
    public async Task<ActionResult> FlagReview(Guid uid, CancellationToken ct)
    {
        var r = await service.FlagReviewAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("reviews/{uid:guid}/delete")]
    public async Task<ActionResult> DeleteReview(Guid uid, CancellationToken ct)
    {
        var r = await service.DeleteReviewAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }
}
