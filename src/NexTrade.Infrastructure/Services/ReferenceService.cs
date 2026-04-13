using Microsoft.EntityFrameworkCore;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Infrastructure.Services;

public class ReferenceService(AppDbContext db)
{
    public record IndustryDto(Guid Uid, string Name, string Slug, Guid? ParentUid, int SortOrder);
    public record CountryDto(string Code, string Code3, string Name);
    public record CurrencyDto(string Code, string Name, string Symbol, int DecimalPlaces);

    public async Task<List<IndustryDto>> ListIndustriesAsync(CancellationToken ct)
    {
        var rows = await db.Industries
            .Include(i => i.Parent)
            .Where(i => i.IsActive)
            .OrderBy(i => i.SortOrder)
            .ThenBy(i => i.Name)
            .ToListAsync(ct);

        return [.. rows.Select(i => new IndustryDto(i.Uid, i.Name, i.Slug, i.Parent?.Uid, i.SortOrder))];
    }

    public async Task<List<CountryDto>> ListCountriesAsync(CancellationToken ct)
        => await db.Countries
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new CountryDto(c.Code, c.Code3, c.Name))
            .ToListAsync(ct);

    public async Task<List<CurrencyDto>> ListCurrenciesAsync(CancellationToken ct)
        => await db.Currencies
            .Where(c => c.IsActive)
            .OrderBy(c => c.Code)
            .Select(c => new CurrencyDto(c.Code, c.Name, c.Symbol, c.DecimalPlaces))
            .ToListAsync(ct);
}
