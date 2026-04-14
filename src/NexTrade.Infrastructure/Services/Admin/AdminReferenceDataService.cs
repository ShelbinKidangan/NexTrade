using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Infrastructure.Services.Admin;

/// <summary>
/// Taxonomy curation: industries, countries, currencies, catalog categories.
/// All public-scoped — no tenant filter.
/// </summary>
public class AdminReferenceDataService(AppDbContext db, IUnitOfWork uow, IAdminAuditLog audit)
{
    // --- Industries ---
    public record IndustryDto(Guid Uid, string Name, string Slug, Guid? ParentUid, int SortOrder, bool IsActive);
    public record CreateIndustryRequest(string Name, string Slug, Guid? ParentUid, int SortOrder);
    public record UpdateIndustryRequest(string? Name, string? Slug, Guid? ParentUid, int? SortOrder, bool? IsActive);
    public record ReorderRequest(List<Guid> Uids);

    public async Task<List<IndustryDto>> ListIndustriesAsync(CancellationToken ct)
    {
        var rows = await db.Industries
            .Include(i => i.Parent)
            .OrderBy(i => i.SortOrder).ThenBy(i => i.Name)
            .ToListAsync(ct);
        return [.. rows.Select(i => new IndustryDto(i.Uid, i.Name, i.Slug, i.Parent?.Uid, i.SortOrder, i.IsActive))];
    }

    public async Task<ServiceResult<IndustryDto>> CreateIndustryAsync(CreateIndustryRequest req, CancellationToken ct)
    {
        long? parentId = null;
        if (req.ParentUid is not null)
        {
            var parent = await db.Industries.FirstOrDefaultAsync(i => i.Uid == req.ParentUid, ct);
            if (parent is null) return ServiceResult<IndustryDto>.Fail("Parent industry not found.");
            parentId = parent.Id;
        }

        var dup = await db.Industries.AnyAsync(i => i.Slug == req.Slug, ct);
        if (dup) return ServiceResult<IndustryDto>.Fail("Slug already in use.", 409);

        var industry = new Industry
        {
            Name = req.Name, Slug = req.Slug,
            ParentId = parentId, SortOrder = req.SortOrder, IsActive = true
        };
        db.Industries.Add(industry);
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("industry.create", "Industry", industry.Uid, new { req.Name, req.Slug }, ct: ct);

        return ServiceResult<IndustryDto>.Created(new IndustryDto(
            industry.Uid, industry.Name, industry.Slug, req.ParentUid, industry.SortOrder, industry.IsActive));
    }

    public async Task<ServiceResult> UpdateIndustryAsync(Guid uid, UpdateIndustryRequest req, CancellationToken ct)
    {
        var industry = await db.Industries.FirstOrDefaultAsync(i => i.Uid == uid, ct);
        if (industry is null) return ServiceResult.Fail("Industry not found.", 404);

        if (req.Name is not null) industry.Name = req.Name;
        if (req.Slug is not null) industry.Slug = req.Slug;
        if (req.SortOrder is not null) industry.SortOrder = req.SortOrder.Value;
        if (req.IsActive is not null) industry.IsActive = req.IsActive.Value;
        if (req.ParentUid is not null)
        {
            var parent = await db.Industries.FirstOrDefaultAsync(i => i.Uid == req.ParentUid, ct);
            industry.ParentId = parent?.Id;
        }

        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("industry.update", "Industry", uid, req, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteIndustryAsync(Guid uid, CancellationToken ct)
    {
        var industry = await db.Industries.FirstOrDefaultAsync(i => i.Uid == uid, ct);
        if (industry is null) return ServiceResult.Fail("Industry not found.", 404);

        industry.IsActive = false;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("industry.delete", "Industry", uid, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> ReorderIndustriesAsync(ReorderRequest req, CancellationToken ct)
    {
        var rows = await db.Industries.Where(i => req.Uids.Contains(i.Uid)).ToListAsync(ct);
        for (int i = 0; i < req.Uids.Count; i++)
        {
            var row = rows.FirstOrDefault(r => r.Uid == req.Uids[i]);
            if (row is not null) row.SortOrder = (i + 1) * 10;
        }
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("industry.reorder", "Industry", payload: req, ct: ct);
        return ServiceResult.Ok();
    }

    // --- Countries ---
    public record CountryDto(Guid Uid, string Code, string Code3, string Name, bool IsActive);
    public record CreateCountryRequest(string Code, string Code3, string Name);
    public record UpdateCountryRequest(string? Name, bool? IsActive);

    public async Task<List<CountryDto>> ListCountriesAsync(CancellationToken ct)
        => await db.Countries
            .OrderBy(c => c.Name)
            .Select(c => new CountryDto(c.Uid, c.Code, c.Code3, c.Name, c.IsActive))
            .ToListAsync(ct);

    public async Task<ServiceResult<CountryDto>> CreateCountryAsync(CreateCountryRequest req, CancellationToken ct)
    {
        var dup = await db.Countries.AnyAsync(c => c.Code == req.Code, ct);
        if (dup) return ServiceResult<CountryDto>.Fail("Country code already exists.", 409);

        var country = new Country { Code = req.Code, Code3 = req.Code3, Name = req.Name, IsActive = true };
        db.Countries.Add(country);
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("country.create", "Country", country.Uid, req, ct: ct);
        return ServiceResult<CountryDto>.Created(new CountryDto(country.Uid, country.Code, country.Code3, country.Name, true));
    }

    public async Task<ServiceResult> UpdateCountryAsync(Guid uid, UpdateCountryRequest req, CancellationToken ct)
    {
        var country = await db.Countries.FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (country is null) return ServiceResult.Fail("Country not found.", 404);
        if (req.Name is not null) country.Name = req.Name;
        if (req.IsActive is not null) country.IsActive = req.IsActive.Value;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("country.update", "Country", uid, req, ct: ct);
        return ServiceResult.Ok();
    }

    // --- Currencies ---
    public record CurrencyDto(Guid Uid, string Code, string Name, string Symbol, int DecimalPlaces, bool IsActive);
    public record CreateCurrencyRequest(string Code, string Name, string Symbol, int DecimalPlaces);
    public record UpdateCurrencyRequest(string? Name, string? Symbol, int? DecimalPlaces, bool? IsActive);

    public async Task<List<CurrencyDto>> ListCurrenciesAsync(CancellationToken ct)
        => await db.Currencies
            .OrderBy(c => c.Code)
            .Select(c => new CurrencyDto(c.Uid, c.Code, c.Name, c.Symbol, c.DecimalPlaces, c.IsActive))
            .ToListAsync(ct);

    public async Task<ServiceResult<CurrencyDto>> CreateCurrencyAsync(CreateCurrencyRequest req, CancellationToken ct)
    {
        var dup = await db.Currencies.AnyAsync(c => c.Code == req.Code, ct);
        if (dup) return ServiceResult<CurrencyDto>.Fail("Currency code already exists.", 409);

        var currency = new Currency
        {
            Code = req.Code, Name = req.Name, Symbol = req.Symbol,
            DecimalPlaces = req.DecimalPlaces, IsActive = true
        };
        db.Currencies.Add(currency);
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("currency.create", "Currency", currency.Uid, req, ct: ct);
        return ServiceResult<CurrencyDto>.Created(new CurrencyDto(
            currency.Uid, currency.Code, currency.Name, currency.Symbol, currency.DecimalPlaces, true));
    }

    public async Task<ServiceResult> UpdateCurrencyAsync(Guid uid, UpdateCurrencyRequest req, CancellationToken ct)
    {
        var currency = await db.Currencies.FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (currency is null) return ServiceResult.Fail("Currency not found.", 404);
        if (req.Name is not null) currency.Name = req.Name;
        if (req.Symbol is not null) currency.Symbol = req.Symbol;
        if (req.DecimalPlaces is not null) currency.DecimalPlaces = req.DecimalPlaces.Value;
        if (req.IsActive is not null) currency.IsActive = req.IsActive.Value;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("currency.update", "Currency", uid, req, ct: ct);
        return ServiceResult.Ok();
    }

    // --- Catalog categories ---
    public record CatalogCategoryDto(Guid Uid, string Name, string Slug, Guid? ParentUid, int Level, int SortOrder, bool IsActive);
    public record CreateCatalogCategoryRequest(string Name, string Slug, Guid? ParentUid, int SortOrder);
    public record UpdateCatalogCategoryRequest(string? Name, string? Slug, Guid? ParentUid, int? SortOrder, bool? IsActive);

    public async Task<List<CatalogCategoryDto>> ListCatalogCategoriesAsync(CancellationToken ct)
    {
        var rows = await db.CatalogCategories
            .Include(c => c.ParentCategory)
            .OrderBy(c => c.Level).ThenBy(c => c.SortOrder).ThenBy(c => c.Name)
            .ToListAsync(ct);
        return [.. rows.Select(c => new CatalogCategoryDto(
            c.Uid, c.Name, c.Slug, c.ParentCategory?.Uid, c.Level, c.SortOrder, c.IsActive))];
    }

    public async Task<ServiceResult<CatalogCategoryDto>> CreateCatalogCategoryAsync(
        CreateCatalogCategoryRequest req, CancellationToken ct)
    {
        long? parentId = null;
        int level = 0;
        if (req.ParentUid is not null)
        {
            var parent = await db.CatalogCategories.FirstOrDefaultAsync(c => c.Uid == req.ParentUid, ct);
            if (parent is null) return ServiceResult<CatalogCategoryDto>.Fail("Parent category not found.");
            parentId = parent.Id;
            level = parent.Level + 1;
        }

        var dup = await db.CatalogCategories.AnyAsync(c => c.Slug == req.Slug, ct);
        if (dup) return ServiceResult<CatalogCategoryDto>.Fail("Slug already in use.", 409);

        var cat = new CatalogCategory
        {
            Name = req.Name, Slug = req.Slug, ParentCategoryId = parentId,
            Level = level, SortOrder = req.SortOrder, IsActive = true
        };
        db.CatalogCategories.Add(cat);
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("catalogCategory.create", "CatalogCategory", cat.Uid, req, ct: ct);

        return ServiceResult<CatalogCategoryDto>.Created(new CatalogCategoryDto(
            cat.Uid, cat.Name, cat.Slug, req.ParentUid, cat.Level, cat.SortOrder, true));
    }

    public async Task<ServiceResult> UpdateCatalogCategoryAsync(
        Guid uid, UpdateCatalogCategoryRequest req, CancellationToken ct)
    {
        var cat = await db.CatalogCategories.FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (cat is null) return ServiceResult.Fail("Category not found.", 404);

        if (req.Name is not null) cat.Name = req.Name;
        if (req.Slug is not null) cat.Slug = req.Slug;
        if (req.SortOrder is not null) cat.SortOrder = req.SortOrder.Value;
        if (req.IsActive is not null) cat.IsActive = req.IsActive.Value;
        if (req.ParentUid is not null)
        {
            var parent = await db.CatalogCategories.FirstOrDefaultAsync(c => c.Uid == req.ParentUid, ct);
            cat.ParentCategoryId = parent?.Id;
            cat.Level = (parent?.Level ?? -1) + 1;
        }

        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("catalogCategory.update", "CatalogCategory", uid, req, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> DeleteCatalogCategoryAsync(Guid uid, CancellationToken ct)
    {
        var cat = await db.CatalogCategories.FirstOrDefaultAsync(c => c.Uid == uid, ct);
        if (cat is null) return ServiceResult.Fail("Category not found.", 404);
        cat.IsActive = false;
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("catalogCategory.delete", "CatalogCategory", uid, ct: ct);
        return ServiceResult.Ok();
    }

    public async Task<ServiceResult> ReorderCatalogCategoriesAsync(ReorderRequest req, CancellationToken ct)
    {
        var rows = await db.CatalogCategories.Where(c => req.Uids.Contains(c.Uid)).ToListAsync(ct);
        for (int i = 0; i < req.Uids.Count; i++)
        {
            var row = rows.FirstOrDefault(r => r.Uid == req.Uids[i]);
            if (row is not null) row.SortOrder = (i + 1) * 10;
        }
        await uow.SaveChangesAsync(ct);
        await audit.RecordAsync("catalogCategory.reorder", "CatalogCategory", payload: req, ct: ct);
        return ServiceResult.Ok();
    }
}
