using Microsoft.EntityFrameworkCore;
using NexTrade.Core.Entities;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Shared;

namespace NexTrade.Infrastructure.Services;

public class BusinessService(AppDbContext db, IUnitOfWork uow, ITenantContext tenant)
{
    // --- DTOs ---
    public record BusinessDto(
        Guid Uid, string Name, bool IsVerified, decimal TrustScore,
        string? Logo, string? About, string? City, string? CountryCode,
        string? Industry, List<string> Capabilities, DateTime CreatedAt);

    public record BusinessDetailDto(
        Guid Uid, string Name, bool IsVerified, decimal TrustScore, DateTime? VerifiedAt,
        string? Industry, string? CompanySize, int? YearEstablished,
        string? Website, string? LinkedInUrl, string ProfileSource,
        ProfileDto? Profile, DateTime CreatedAt);

    public record ProfileDto(
        string? Logo, string? BannerImage, string? About,
        string? City, string? State, string? CountryCode,
        List<string> Capabilities, List<string> Certifications, List<string> DeliveryRegions,
        List<string> AdditionalLocations, Dictionary<string, string> SocialLinks,
        decimal ResponseRate, int AvgResponseTimeHours, decimal ProfileCompleteness);

    public record UpdateProfileRequest(
        // Business-level structured fields
        Guid? IndustryUid, Guid? SubIndustryUid, string? CompanySize,
        int? YearEstablished, string? Website, string? LinkedInUrl,
        // Profile display content
        string? About,
        string? AddressLine1, string? AddressLine2, string? City, string? State,
        string? PostalCode, string? CountryCode,
        List<string>? Capabilities, List<string>? Certifications, List<string>? DeliveryRegions,
        List<string>? AdditionalLocations, Dictionary<string, string>? SocialLinks);

    public record BusinessFilter(int Page = 1, int PageSize = 20, string? Search = null,
        string? Industry = null, string? Country = null, bool? VerifiedOnly = null);

    // --- Discovery (platform-scoped, no tenant filter) ---
    public async Task<PagedResult<BusinessDto>> DiscoverAsync(BusinessFilter filter, CancellationToken ct)
    {
        var query = db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Industry)
            .Include(b => b.Profile)
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
            b.Profile != null ? b.Profile.Logo : null,
            b.Profile != null ? b.Profile.About : null,
            b.Profile != null ? b.Profile.City : null,
            b.Profile != null ? b.Profile.CountryCode : null,
            b.Industry != null ? b.Industry.Name : null,
            b.Profile != null ? b.Profile.Capabilities : new List<string>(),
            b.CreatedAt), ct);
    }

    // --- Get public profile ---
    public async Task<ServiceResult<BusinessDetailDto>> GetByUidAsync(Guid uid, CancellationToken ct)
    {
        var business = await db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Industry)
            .Include(b => b.Profile)
            .FirstOrDefaultAsync(b => b.Uid == uid && b.IsActive, ct);

        if (business is null)
            return ServiceResult<BusinessDetailDto>.Fail("Business not found.", 404);

        var p = business.Profile;
        var profile = p is null ? null : new ProfileDto(
            p.Logo, p.BannerImage, p.About,
            p.City, p.State, p.CountryCode,
            p.Capabilities, p.Certifications, p.DeliveryRegions,
            p.AdditionalLocations, p.SocialLinks,
            p.ResponseRate, p.AvgResponseTimeHours, p.ProfileCompleteness);

        return ServiceResult<BusinessDetailDto>.Ok(new BusinessDetailDto(
            business.Uid, business.Name, business.IsVerified, business.TrustScore,
            business.VerifiedAt, business.Industry?.Name, business.CompanySize?.ToString(),
            business.YearEstablished, business.Website, business.LinkedInUrl,
            business.ProfileSource.ToString(), profile, business.CreatedAt));
    }

    // --- Current tenant's own profile ---
    public Task<ServiceResult<BusinessDetailDto>> GetMineAsync(CancellationToken ct)
        => GetByUidAsync(tenant.TenantId, ct);

    public Task<ServiceResult> UpdateMineAsync(UpdateProfileRequest req, CancellationToken ct)
        => UpdateProfileAsync(tenant.TenantId, req, ct);

    // --- Update own profile (tenant-scoped) ---
    public async Task<ServiceResult> UpdateProfileAsync(Guid businessUid, UpdateProfileRequest req, CancellationToken ct)
    {
        var business = await db.Businesses
            .IgnoreQueryFilters()
            .Include(b => b.Profile)
            .FirstOrDefaultAsync(b => b.Uid == businessUid, ct);

        if (business is null)
            return ServiceResult.Fail("Business not found.", 404);

        // Business-level fields
        if (req.Website is not null) business.Website = req.Website;
        if (req.LinkedInUrl is not null) business.LinkedInUrl = req.LinkedInUrl;
        if (req.YearEstablished is not null) business.YearEstablished = req.YearEstablished;
        if (req.CompanySize is not null &&
            Enum.TryParse<NexTrade.Core.Enums.CompanySize>(req.CompanySize, ignoreCase: true, out var size))
            business.CompanySize = size;

        if (req.IndustryUid is not null)
        {
            var industry = await db.Industries.FirstOrDefaultAsync(i => i.Uid == req.IndustryUid, ct);
            if (industry is not null) business.IndustryId = industry.Id;
        }
        if (req.SubIndustryUid is not null)
        {
            var sub = await db.Industries.FirstOrDefaultAsync(i => i.Uid == req.SubIndustryUid, ct);
            if (sub is not null) business.SubIndustryId = sub.Id;
        }

        // Profile-level fields
        var profile = business.Profile ?? new BusinessProfile { BusinessId = business.Id };
        if (business.Profile is null)
            db.BusinessProfiles.Add(profile);

        if (req.About is not null) profile.About = req.About;
        if (req.AddressLine1 is not null) profile.AddressLine1 = req.AddressLine1;
        if (req.AddressLine2 is not null) profile.AddressLine2 = req.AddressLine2;
        if (req.City is not null) profile.City = req.City;
        if (req.State is not null) profile.State = req.State;
        if (req.PostalCode is not null) profile.PostalCode = req.PostalCode;
        if (req.CountryCode is not null) profile.CountryCode = req.CountryCode;
        if (req.Capabilities is not null) profile.Capabilities = req.Capabilities;
        if (req.Certifications is not null) profile.Certifications = req.Certifications;
        if (req.DeliveryRegions is not null) profile.DeliveryRegions = req.DeliveryRegions;
        if (req.AdditionalLocations is not null) profile.AdditionalLocations = req.AdditionalLocations;
        if (req.SocialLinks is not null) profile.SocialLinks = req.SocialLinks;

        await uow.SaveChangesAsync(ct);
        return ServiceResult.Ok();
    }
}
