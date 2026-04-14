using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services.Admin;

namespace NexTrade.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/metrics")]
[Authorize(Policy = "PlatformAdmin")]
public class AdminMetricsController(AdminMetricsService service) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<ActionResult> Overview(CancellationToken ct)
        => Ok(await service.GetOverviewAsync(ct));

    [HttpGet("timeseries")]
    public async Task<ActionResult> Timeseries([FromQuery] string metric, [FromQuery] int days, CancellationToken ct)
        => Ok(await service.GetTimeseriesAsync(metric, Math.Clamp(days, 1, 90), ct));
}
