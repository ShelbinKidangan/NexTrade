using NexTrade.Infrastructure.Services.Admin;

namespace NexTrade.Api.Middleware;

/// <summary>
/// Captures every successful admin write as an audit row. Runs after auth so
/// the tenant context already holds the admin user id. Only records when:
///   • path begins with /api/admin/
///   • method is non-GET
///   • handler returned a 2xx status
/// The AdminAuditLog service also writes fine-grained entries from inside
/// admin services when the action needs a custom payload — this middleware is
/// the safety net so no write is silently unaudited.
/// </summary>
public class AdminAuditMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, IAdminAuditLog audit)
    {
        await next(context);

        var path = context.Request.Path.Value;
        if (path is null || !path.StartsWith("/api/admin/", StringComparison.OrdinalIgnoreCase))
            return;

        var method = context.Request.Method;
        if (HttpMethods.IsGet(method)) return;

        var isAdmin = context.User.FindFirst("platform_admin")?.Value == "true";
        if (!isAdmin) return;

        var status = context.Response.StatusCode;
        if (status is < 200 or >= 300) return;

        await audit.RecordAsync(
            action: $"{method} {path}",
            route: path,
            method: method,
            statusCode: status,
            ipAddress: context.Connection.RemoteIpAddress?.ToString());
    }
}
