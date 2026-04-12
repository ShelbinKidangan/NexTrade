using System.Security.Claims;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Api.Middleware;

public class TenantMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantClaim = context.User.FindFirst("tenant_id")?.Value;
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (Guid.TryParse(tenantClaim, out var tenantId))
            {
                var tenantContext = context.RequestServices.GetRequiredService<TenantContext>();
                tenantContext.TenantId = tenantId;
                tenantContext.UserId = long.TryParse(userIdClaim, out var userId) ? userId : null;
            }
        }

        await next(context);
    }
}
