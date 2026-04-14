using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NexTrade.Core.Enums;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;

namespace NexTrade.Consumers;

/// <summary>
/// Scans compliance_documents daily. Emits expiry-alert emails 30/7/1 days
/// before expiry; on or after expiry, flips status to Expired and notifies.
/// </summary>
public class ComplianceExpiryConsumer(
    IServiceScopeFactory scopeFactory,
    ILogger<ComplianceExpiryConsumer> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);
    private static readonly int[] AlertWindows = [30, 7, 1];

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try { await Task.Delay(TimeSpan.FromMinutes(3), stoppingToken); }
        catch (OperationCanceledException) { return; }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunOnceAsync(stoppingToken);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                logger.LogError(ex, "Compliance expiry scan failed");
            }

            try { await Task.Delay(Interval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }
    }

    private async Task RunOnceAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var email = scope.ServiceProvider.GetRequiredService<IEmailSender>();

        var today = DateTime.UtcNow.Date;

        // Flip newly-expired docs to Expired
        var expired = await db.ComplianceDocuments.IgnoreQueryFilters()
            .Where(d => d.ExpiryDate != null
                && d.ExpiryDate < today
                && d.Status == ComplianceDocumentStatus.Verified)
            .ToListAsync(ct);

        foreach (var doc in expired)
        {
            doc.Status = ComplianceDocumentStatus.Expired;
            await NotifyAsync(db, email, doc, $"Document expired: {doc.Title}",
                $"Your {doc.Type} '{doc.Title}' expired on {doc.ExpiryDate:yyyy-MM-dd}. Upload a replacement to restore your verified status.", ct);
        }

        // Alerts at 30/7/1 days out (verified docs only)
        foreach (var window in AlertWindows)
        {
            var target = today.AddDays(window);
            var upcoming = await db.ComplianceDocuments.IgnoreQueryFilters()
                .Where(d => d.ExpiryDate != null
                    && d.ExpiryDate.Value.Date == target
                    && d.Status == ComplianceDocumentStatus.Verified)
                .ToListAsync(ct);

            foreach (var doc in upcoming)
            {
                await NotifyAsync(db, email, doc,
                    $"Document expires in {window} day{(window == 1 ? "" : "s")}: {doc.Title}",
                    $"Your {doc.Type} '{doc.Title}' expires on {doc.ExpiryDate:yyyy-MM-dd}. Upload a replacement before it lapses.", ct);
            }
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Compliance expiry scan completed ({Expired} expired)", expired.Count);
    }

    private static async Task NotifyAsync(
        AppDbContext db, IEmailSender email,
        Core.Entities.ComplianceDocument doc,
        string subject, string body, CancellationToken ct)
    {
        var user = await db.Users.IgnoreQueryFilters()
            .Where(u => u.TenantId == doc.TenantId && u.IsActive && u.Email != null)
            .OrderBy(u => u.Id)
            .FirstOrDefaultAsync(ct);
        if (user?.Email is null) return;

        var html = $"<p>{body}</p><p><a href=\"http://localhost:4000/compliance\">Open compliance vault</a></p>";
        await email.SendAsync(user.Email, subject, html, ct);
    }
}
