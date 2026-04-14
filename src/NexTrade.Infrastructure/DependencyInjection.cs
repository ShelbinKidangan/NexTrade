using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Data;
using NexTrade.Infrastructure.Repositories;
using NexTrade.Infrastructure.Services;
using NexTrade.Infrastructure.Services.Admin;

namespace NexTrade.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var dataSourceBuilder = new NpgsqlDataSourceBuilder(configuration.GetConnectionString("nextrade-db"));
        dataSourceBuilder.EnableDynamicJson();
        dataSourceBuilder.UseVector();
        var dataSource = dataSourceBuilder.Build();

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(dataSource, npgsql =>
            {
                npgsql.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName);
                npgsql.UseVector();
            })
            .UseSnakeCaseNamingConvention());

        // Tenant context
        services.AddScoped<TenantContext>();
        services.AddScoped<ITenantContext>(sp => sp.GetRequiredService<TenantContext>());

        // Repository & UoW
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Services
        services.AddScoped<AuthService>();
        services.AddScoped<BusinessService>();
        services.AddScoped<CatalogService>();
        services.AddScoped<CatalogMediaService>();
        services.AddScoped<CatalogCategoryService>();
        services.AddScoped<DiscoveryService>();
        services.AddScoped<SavedSuppliersService>();
        services.AddScoped<ConnectionsService>();
        services.AddScoped<ReferenceService>();
        services.AddScoped<RfqService>();
        services.AddScoped<QuoteService>();
        services.AddScoped<DealConfirmationsService>();
        services.AddScoped<ConversationService>();
        services.AddScoped<ComplianceService>();
        services.AddScoped<ReviewsService>();
        services.AddScoped<TrustScoreService>();

        // Admin console services
        services.AddHttpContextAccessor();
        services.AddScoped<IAdminAuditLog, AdminAuditLog>();
        services.AddScoped<AdminBusinessService>();
        services.AddScoped<AdminVerificationService>();
        services.AddScoped<AdminReferenceDataService>();
        services.AddScoped<AdminUserService>();
        services.AddScoped<AdminContentService>();
        services.AddScoped<AdminMetricsService>();

        // Email (Mailhog in dev)
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        return services;
    }
}
