using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services;

public class BusinessService(AppDbContext db, IUnitOfWork uow)
{
    // --- DTOs ---
    public record BusinessDto(
        Guid Uid, string Name, bool IsVerified, decimal TrustScore,
        string? Logo, string? About, string? City, string? CountryCode,
        string? Industry, List<string> Capabilities, DateTime CreatedAt);

    public record BusinessDetailDto(
        Guid Uid, string Name, bool IsVerified, decimal TrustScore, DateTime? VerifiedAt,
        ProfileDto? Profile, DateTime CreatedAt);

    public record ProfileDto(
        string? Logo, string? BannerImage, string? About, string? Website, string? LinkedInUrl,
        int? YearEstablished, string? CompanySize,
        string? City, string? State, string? CountryCode,
        List<string> Capabilities, List<string> Certifications, List<string> DeliveryRegions,
        decimal ResponseRate, int AvgResponseTimeHours, string? Industry);

    public record UpdateProfileRequest(
        string? About, string? Website, string? LinkedInUrl,
        int? YearEstablished, string? CompanySize,
        string? AddressLine1, string? AddressLine2, string? City, string? State,
        string? PostalCode, string? CountryCode,
        List<string>? Capabilities, List<string>? Certifications, List<string>? DeliveryRegions,
        Guid? IndustryUid);

    public record BusinessFilter(int Page = 1, int PageSize = 20, string? Search = null,
        string? Industry = null, string? Country = null, bool? VerifiedOnly = null);

    // --- Discovery (platform-scoped, no tenant filter) ---
    public async Task<PagedResult<BusinessDto>> DiscoverAsync(BusinessFilter filter, CancellationToken ct)
    {
        var query = db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Profile).ThenInclude(p => p!.Industry)
            .Where(b => b.IsActive)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.Search))
            query = query.Where(b => b.Name.ToLower().Contains(filter.Search.ToLower())
                || (b.Profile != null && b.Profile.About != null && b.Profile.About.ToLower().Contains(filter.Search.ToLower())));

        if (filter.VerifiedOnly == true)
            query = query.Where(b => b.IsVerified);

        if (!string.IsNullOrEmpty(filter.Country))
            query = query.Where(b => b.Profile != null && b.Profile.CountryCode == filter.Country);

        query = query.OrderByDescending(b => b.TrustScore).ThenByDescending(b => b.CreatedAt);

        return await query.ToPagedResultAsync(filter.Page, filter.PageSize, b => new BusinessDto(
            b.Uid, b.Name, b.IsVerified, b.TrustScore,
            b.Profile?.Logo, b.Profile?.About, b.Profile?.City, b.Profile?.CountryCode,
            b.Profile?.Industry?.Name, b.Profile?.Capabilities ?? [], b.CreatedAt), ct);
    }

    // --- Get public profile ---
    public async Task<ServiceResult<BusinessDetailDto>> GetByUidAsync(Guid uid, CancellationToken ct)
    {
        var business = await db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Profile).ThenInclude(p => p!.Industry)
            .FirstOrDefaultAsync(b => b.Uid == uid && b.IsActive, ct);

        if (business is null)
            return ServiceResult<BusinessDetailDto>.Fail("Business not found.", 404);

        var p = business.Profile;
        var profile = p is null ? null : new ProfileDto(
            p.Logo, p.BannerImage, p.About, p.Website, p.LinkedInUrl,
            p.YearEstablished, p.CompanySize?.ToString(),
            p.City, p.State, p.CountryCode,
            p.Capabilities, p.Certifications, p.DeliveryRegions,
            p.ResponseRate, p.AvgResponseTimeHours, p.Industry?.Name);

        return ServiceResult<BusinessDetailDto>.Ok(new BusinessDetailDto(
            business.Uid, business.Name, business.IsVerified, business.TrustScore,
            business.VerifiedAt, profile, business.CreatedAt));
    }

    // --- Update own profile (tenant-scoped) ---
    public async Task<ServiceResult> UpdateProfileAsync(Guid businessUid, UpdateProfileRequest req, CancellationToken ct)
    {
        var business = await db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Profile)
            .FirstOrDefaultAsync(b => b.Uid == businessUid, ct);

        if (business is null)
            return ServiceResult.Fail("Business not found.", 404);

        var profile = business.Profile ?? new BusinessProfile { BusinessId = business.Id };
        if (business.Profile is null)
            db.BusinessProfiles.Add(profile);

        profile.About = req.About ?? profile.About;
        profile.Website = req.Website ?? profile.Website;
        profile.LinkedInUrl = req.LinkedInUrl ?? profile.LinkedInUrl;
        profile.YearEstablished = req.YearEstablished ?? profile.YearEstablished;
        if (req.AddressLine1 is not null) profile.AddressLine1 = req.AddressLine1;
        if (req.City is not null) profile.City = req.City;
        if (req.State is not null) profile.State = req.State;
        if (req.PostalCode is not null) profile.PostalCode = req.PostalCode;
        if (req.CountryCode is not null) profile.CountryCode = req.CountryCode;
        if (req.Capabilities is not null) profile.Capabilities = req.Capabilities;
        if (req.Certifications is not null) profile.Certifications = req.Certifications;
        if (req.DeliveryRegions is not null) profile.DeliveryRegions = req.DeliveryRegions;

        if (req.IndustryUid is not null)
        {
            var industry = await db.Industries.FirstOrDefaultAsync(i => i.Uid == req.IndustryUid, ct);
            if (industry is not null) profile.IndustryId = industry.Id;
        }

        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }
}
