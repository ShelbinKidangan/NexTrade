using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services.Admin;

namespace NexTrade.Api.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "PlatformAdmin")]
public class AdminReferenceDataController(AdminReferenceDataService service) : ControllerBase
{
    // --- Industries ---
    [HttpGet("industries")]
    public async Task<ActionResult> ListIndustries(CancellationToken ct)
        => Ok(await service.ListIndustriesAsync(ct));

    [HttpPost("industries")]
    public async Task<ActionResult> CreateIndustry([FromBody] AdminReferenceDataService.CreateIndustryRequest req, CancellationToken ct)
    {
        var r = await service.CreateIndustryAsync(req, ct);
        return r.Succeeded ? StatusCode(r.StatusCode, r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPut("industries/{uid:guid}")]
    public async Task<ActionResult> UpdateIndustry(Guid uid, [FromBody] AdminReferenceDataService.UpdateIndustryRequest req, CancellationToken ct)
    {
        var r = await service.UpdateIndustryAsync(uid, req, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpDelete("industries/{uid:guid}")]
    public async Task<ActionResult> DeleteIndustry(Guid uid, CancellationToken ct)
    {
        var r = await service.DeleteIndustryAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("industries/reorder")]
    public async Task<ActionResult> ReorderIndustries([FromBody] AdminReferenceDataService.ReorderRequest req, CancellationToken ct)
    {
        var r = await service.ReorderIndustriesAsync(req, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    // --- Countries ---
    [HttpGet("countries")]
    public async Task<ActionResult> ListCountries(CancellationToken ct)
        => Ok(await service.ListCountriesAsync(ct));

    [HttpPost("countries")]
    public async Task<ActionResult> CreateCountry([FromBody] AdminReferenceDataService.CreateCountryRequest req, CancellationToken ct)
    {
        var r = await service.CreateCountryAsync(req, ct);
        return r.Succeeded ? StatusCode(r.StatusCode, r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPut("countries/{uid:guid}")]
    public async Task<ActionResult> UpdateCountry(Guid uid, [FromBody] AdminReferenceDataService.UpdateCountryRequest req, CancellationToken ct)
    {
        var r = await service.UpdateCountryAsync(uid, req, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    // --- Currencies ---
    [HttpGet("currencies")]
    public async Task<ActionResult> ListCurrencies(CancellationToken ct)
        => Ok(await service.ListCurrenciesAsync(ct));

    [HttpPost("currencies")]
    public async Task<ActionResult> CreateCurrency([FromBody] AdminReferenceDataService.CreateCurrencyRequest req, CancellationToken ct)
    {
        var r = await service.CreateCurrencyAsync(req, ct);
        return r.Succeeded ? StatusCode(r.StatusCode, r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPut("currencies/{uid:guid}")]
    public async Task<ActionResult> UpdateCurrency(Guid uid, [FromBody] AdminReferenceDataService.UpdateCurrencyRequest req, CancellationToken ct)
    {
        var r = await service.UpdateCurrencyAsync(uid, req, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    // --- Catalog categories ---
    [HttpGet("catalog-categories")]
    public async Task<ActionResult> ListCatalogCategories(CancellationToken ct)
        => Ok(await service.ListCatalogCategoriesAsync(ct));

    [HttpPost("catalog-categories")]
    public async Task<ActionResult> CreateCatalogCategory([FromBody] AdminReferenceDataService.CreateCatalogCategoryRequest req, CancellationToken ct)
    {
        var r = await service.CreateCatalogCategoryAsync(req, ct);
        return r.Succeeded ? StatusCode(r.StatusCode, r.Data) : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPut("catalog-categories/{uid:guid}")]
    public async Task<ActionResult> UpdateCatalogCategory(Guid uid, [FromBody] AdminReferenceDataService.UpdateCatalogCategoryRequest req, CancellationToken ct)
    {
        var r = await service.UpdateCatalogCategoryAsync(uid, req, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpDelete("catalog-categories/{uid:guid}")]
    public async Task<ActionResult> DeleteCatalogCategory(Guid uid, CancellationToken ct)
    {
        var r = await service.DeleteCatalogCategoryAsync(uid, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }

    [HttpPost("catalog-categories/reorder")]
    public async Task<ActionResult> ReorderCatalogCategories([FromBody] AdminReferenceDataService.ReorderRequest req, CancellationToken ct)
    {
        var r = await service.ReorderCatalogCategoriesAsync(req, ct);
        return r.Succeeded ? NoContent() : StatusCode(r.StatusCode, new { message = r.Error });
    }
}
