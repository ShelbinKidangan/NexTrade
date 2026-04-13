using System.Security.Claims;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Api.Middleware;

public class TenantMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantContext = context.RequestServices.GetRequiredService<TenantContext>();

            var isPlatformAdmin = context.User.FindFirst("platform_admin")?.Value == "true";
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            tenantContext.UserId = long.TryParse(userIdClaim, out var userId) ? userId : null;

            if (isPlatformAdmin)
            {
                // Platform admins get no tenant binding; admin endpoints must use
                // .IgnoreQueryFilters() explicitly — TenantId stays Guid.Empty so
                // no tenant-scoped row is accidentally visible.
                tenantContext.IsPlatformAdmin = true;
            }
            else
            {
                var tenantClaim = context.User.FindFirst("tenant_id")?.Value;
                if (Guid.TryParse(tenantClaim, out var tenantId))
                    tenantContext.TenantId = tenantId;
            }
        }

        await next(context);
    }
}
