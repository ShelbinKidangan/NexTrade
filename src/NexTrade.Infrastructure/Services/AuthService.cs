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
    SignInManager<User> signInManager,
    AppDbContext db,
    IConfiguration configuration)
{
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
            var errors = result.Errors.ToDictionary(e => e.Code, e => new[] { e.Description });
            return ServiceResult<object>.Fail(errors, 400);
        }

        // Create default profile
        db.BusinessProfiles.Add(new BusinessProfile { BusinessId = business.Id });
        await db.SaveChangesAsync(ct);

        var token = GenerateToken(user);
        return ServiceResult<object>.Created(new
        {
            Token = token,
            User = new { user.Uid, user.FullName, user.Email },
            Business = new { business.Uid, business.Name }
        });
    }

    public async Task<ServiceResult<object>> LoginAsync(string email, string password)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null || !user.IsActive)
            return ServiceResult<object>.Fail("Invalid credentials.", 401);

        var result = await signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);
        if (!result.Succeeded)
            return ServiceResult<object>.Fail("Invalid credentials.", 401);

        user.LastLoginAt = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        var business = await db.Businesses.FirstOrDefaultAsync(b => b.Uid == user.TenantId);

        var token = GenerateToken(user);
        return ServiceResult<object>.Ok(new
        {
            Token = token,
            User = new { user.Uid, user.FullName, user.Email },
            Business = new { business?.Uid, business?.Name }
        });
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim("tenant_id", user.TenantId.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
