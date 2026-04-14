using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/compliance/documents")]
[Authorize]
public class ComplianceController(ComplianceService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> List(CancellationToken ct)
        => Ok(await service.ListMineAsync(ct));

    [HttpGet("{uid:guid}")]
    public async Task<ActionResult> Get(Guid uid, CancellationToken ct)
    {
        var r = await service.GetAsync(uid, ct);
        return r.Succeeded ? Ok(r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    // multipart/form-data with "file" + "metadata" (JSON) fields
    [HttpPost]
    [RequestSizeLimit(25 * 1024 * 1024)]
    public async Task<ActionResult> Upload(
        [FromForm] IFormFile file,
        [FromForm] string metadata,
        CancellationToken ct)
    {
        if (file is null) return BadRequest(new { message = "File is required." });
        ComplianceService.CreateDocumentRequest? req;
        try
        {
            req = JsonSerializer.Deserialize<ComplianceService.CreateDocumentRequest>(
                metadata, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        }
        catch
        {
            return BadRequest(new { message = "Invalid metadata JSON." });
        }
        if (req is null) return BadRequest(new { message = "Metadata is required." });

        var r = await service.UploadAsync(file, req, ct);
        return r.Succeeded ? StatusCode(r.StatusCode, r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpDelete("{uid:guid}")]
    public async Task<ActionResult> Delete(Guid uid, CancellationToken ct)
    {
        var r = await service.DeleteAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/verify")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult> Verify(Guid uid, CancellationToken ct)
    {
        var r = await service.VerifyAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("{uid:guid}/reject")]
    [Authorize(Policy = "PlatformAdmin")]
    public async Task<ActionResult> Reject(Guid uid, [FromBody] ComplianceService.RejectRequest req, CancellationToken ct)
    {
        var r = await service.RejectAsync(uid, req.Reason, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }
}
