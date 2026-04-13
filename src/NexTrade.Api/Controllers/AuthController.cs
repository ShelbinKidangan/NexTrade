using Microsoft.AspNetCore.Mvc;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService) : ControllerBase
{
    public record RegisterRequest(string BusinessName, string FullName, string Email, string Password);
    public record LoginRequest(string Email, string Password);

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        var result = await authService.RegisterAsync(req.BusinessName, req.FullName, req.Email, req.Password, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error, errors = result.Errors });
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] LoginRequest req)
    {
        var result = await authService.LoginAsync(req.Email, req.Password);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("admin-login")]
    public async Task<ActionResult> AdminLogin([FromBody] LoginRequest req)
    {
        var result = await authService.AdminLoginAsync(req.Email, req.Password);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new { message = result.Error });
    }
}
