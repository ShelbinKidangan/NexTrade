using MassTransit;
using NexTrade.Consumers;
using NexTrade.Infrastructure;

var builder = Host.CreateApplicationBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<RfqNotificationConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration.GetConnectionString("rabbitmq"));
        cfg.ConfigureEndpoints(context);
    });
});

// Scheduled background jobs
builder.Services.AddHostedService<TrustScoreRecomputeConsumer>();
builder.Services.AddHostedService<ComplianceExpiryConsumer>();

var host = builder.Build();
host.Run();
