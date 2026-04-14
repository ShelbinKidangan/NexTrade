using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services.Admin;

namespace NexTrade.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/audit-log")]
[Authorize(Policy = "PlatformAdmin")]
public class AdminAuditController(IAdminAuditLog service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> List([FromQuery] AdminAuditLog.AdminAuditFilter filter, CancellationToken ct)
        => Ok(await service.ListAsync(filter, ct));
}
