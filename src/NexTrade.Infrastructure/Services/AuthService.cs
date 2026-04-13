using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NexTrade.Core.Entities;
using NexTrade.Infrastructure.Data;
using NexTrade.Infrastructure.Identity;

namespace NexTrade.Infrastructure.Services;

public class AuthService(
    UserManager<User> userManager,
    RoleManager<Role> roleManager,
    SignInManager<User> signInManager,
    AppDbContext db,
    IConfiguration configuration)
{
    public static readonly string[] TenantRoleTemplate =
        ["Admin", "CatalogManager", "Sales", "Procurement", "Member"];

    public async Task<ServiceResult<object>> RegisterAsync(
        string businessName, string fullName, string email, string password, CancellationToken ct)
    {
        if (await userManager.FindByEmailAsync(email) is not null)
            return ServiceResult<object>.Fail("Email already registered.", 409);

        var business = new Business { Name = businessName };
        db.Businesses.Add(business);
        await db.SaveChangesAsync(ct);

        var user = new User
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            TenantId = business.Uid,
            IsActive = true
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            db.Businesses.Remove(business);
            await db.SaveChangesAsync(ct);
            var errors = result.Errors.ToDictionary(e => e.Code, e => new[] { e.Description });
            return ServiceResult<object>.Fail(errors, 400);
        }

        await SeedTenantRolesAsync(business.Uid);
        await userManager.AddToRoleAsync(user, ScopedRoleName("Admin", business.Uid));

        db.BusinessProfiles.Add(new BusinessProfile { BusinessId = business.Id });
        await db.SaveChangesAsync(ct);

        var token = GenerateToken(user);
        return ServiceResult<object>.Created(new
        {
            Token = token,
            User = new { user.Uid, user.FullName, user.Email, IsPlatformAdmin = false },
            Business = new { business.Uid, business.Name }
        });
    }

    public async Task<ServiceResult<object>> LoginAsync(string email, string password)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null || !user.IsActive)
            return ServiceResult<object>.Fail("Invalid credentials.", 401);

        if (user.IsPlatformAdmin)
            return ServiceResult<object>.Fail("Use the admin sign-in.", 401);

        var result = await signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);
        if (!result.Succeeded)
            return ServiceResult<object>.Fail("Invalid credentials.", 401);

        user.LastLoginAt = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        var business = await db.Businesses
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Uid == user.TenantId);

        var token = GenerateToken(user);
        return ServiceResult<object>.Ok(new
        {
            Token = token,
            User = new { user.Uid, user.FullName, user.Email, IsPlatformAdmin = false },
            Business = new { business?.Uid, business?.Name }
        });
    }

    public async Task<ServiceResult<object>> AdminLoginAsync(string email, string password)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null || !user.IsActive || !user.IsPlatformAdmin)
            return ServiceResult<object>.Fail("Invalid credentials.", 401);

        var result = await signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);
        if (!result.Succeeded)
            return ServiceResult<object>.Fail("Invalid credentials.", 401);

        user.LastLoginAt = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        var token = GenerateToken(user);
        return ServiceResult<object>.Ok(new
        {
            Token = token,
            User = new { user.Uid, user.FullName, user.Email, IsPlatformAdmin = true }
        });
    }

    private async Task SeedTenantRolesAsync(Guid tenantId)
    {
        foreach (var role in TenantRoleTemplate)
        {
            var scoped = ScopedRoleName(role, tenantId);
            if (!await roleManager.RoleExistsAsync(scoped))
                await roleManager.CreateAsync(new Role { Name = scoped, TenantId = tenantId });
        }
    }

    private static string ScopedRoleName(string role, Guid tenantId) => $"{tenantId}:{role}";

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new("tenant_id", user.TenantId.ToString()),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName)
        };

        if (user.IsPlatformAdmin)
            claims.Add(new Claim("platform_admin", "true"));

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
