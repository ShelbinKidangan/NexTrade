using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/reference")]
[AllowAnonymous]
public class ReferenceController(ReferenceService service) : ControllerBase
{
    [HttpGet("industries")]
    public async Task<ActionResult> GetIndustries(CancellationToken ct)
        => Ok(await service.ListIndustriesAsync(ct));

    [HttpGet("countries")]
    public async Task<ActionResult> GetCountries(CancellationToken ct)
        => Ok(await service.ListCountriesAsync(ct));

    [HttpGet("currencies")]
    public async Task<ActionResult> GetCurrencies(CancellationToken ct)
        => Ok(await service.ListCurrenciesAsync(ct));
}
