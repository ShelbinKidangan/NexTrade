using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NexTrade.Infrastructure.Services;

namespace NexTrade.Consumers;

/// <summary>
/// Scheduled nightly recompute of Business.TrustScore. Implemented as a hosted
/// service for MVP simplicity; promote to a Quartz/MassTransit scheduled job
/// if we need cron expressions, cluster coordination, or missed-fire handling.
/// </summary>
public class TrustScoreRecomputeConsumer(
    IServiceScopeFactory scopeFactory,
    ILogger<TrustScoreRecomputeConsumer> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Initial delay so the service doesn't block container startup.
        try { await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken); }
        catch (OperationCanceledException) { return; }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<TrustScoreService>();
                await service.RecomputeAllAsync(stoppingToken);
                logger.LogInformation("Trust score recompute completed");
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                logger.LogError(ex, "Trust score recompute failed");
            }

            try { await Task.Delay(Interval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }
    }
}
