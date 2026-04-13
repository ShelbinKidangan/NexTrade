using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NexTrade.Core.Entities;
using NexTrade.Core.Interfaces;
using NexTrade.Infrastructure.Identity;
using NpgsqlTypes;

namespace NexTrade.Infrastructure.Data;

public class AppDbContext(
    DbContextOptions<AppDbContext> options,
    ITenantContext tenantContext) : IdentityDbContext<User, Role, long>(options)
{
    private readonly ITenantContext _tenantContext = tenantContext;

    // Business (tenant)
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<BusinessProfile> BusinessProfiles => Set<BusinessProfile>();
    public DbSet<ProfileClaim> ProfileClaims => Set<ProfileClaim>();

    // Catalog
    public DbSet<CatalogItem> CatalogItems => Set<CatalogItem>();
    public DbSet<CatalogCategory> CatalogCategories => Set<CatalogCategory>();
    public DbSet<CatalogMedia> CatalogMedia => Set<CatalogMedia>();

    // RFQ + quoting
    public DbSet<Rfq> Rfqs => Set<Rfq>();
    public DbSet<RfqItem> RfqItems => Set<RfqItem>();
    public DbSet<RfqTarget> RfqTargets => Set<RfqTarget>();
    public DbSet<Quote> Quotes => Set<Quote>();
    public DbSet<QuoteItem> QuoteItems => Set<QuoteItem>();

    // Deal confirmations (terminal state — NexTrade stops here)
    public DbSet<DealConfirmation> DealConfirmations => Set<DealConfirmation>();

    // Network + trust
    public DbSet<Connection> Connections => Set<Connection>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<SavedSupplier> SavedSuppliers => Set<SavedSupplier>();
    public DbSet<SupplierList> SupplierLists => Set<SupplierList>();
    public DbSet<SavedSearch> SavedSearches => Set<SavedSearch>();

    // Compliance
    public DbSet<ComplianceDocument> ComplianceDocuments => Set<ComplianceDocument>();

    // Messaging
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

    // Platform reference
    public DbSet<Industry> Industries => Set<Industry>();
    public DbSet<Country> Countries => Set<Country>();
    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<GovernmentRegistryRecord> GovernmentRegistryRecords => Set<GovernmentRegistryRecord>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // pgvector extension (our CatalogItem / BusinessProfile embeddings depend on it).
        builder.HasPostgresExtension("vector");

        // Rename Identity tables to snake_case
        builder.Entity<User>().ToTable("users");
        builder.Entity<Role>().ToTable("roles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<long>>().ToTable("user_roles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<long>>().ToTable("user_claims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<long>>().ToTable("user_logins");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<long>>().ToTable("role_claims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<long>>().ToTable("user_tokens");

        ApplyTenantFilters(builder);

        // Business
        builder.Entity<Business>(e =>
        {
            e.HasIndex(b => b.Uid).IsUnique();
            e.HasIndex(b => b.Subdomain).IsUnique().HasFilter("subdomain IS NOT NULL");
            e.HasOne(b => b.Profile).WithOne(p => p.Business).HasForeignKey<BusinessProfile>(p => p.BusinessId);
            e.HasOne(b => b.Industry).WithMany().HasForeignKey(b => b.IndustryId);
            e.HasOne(b => b.SubIndustry).WithMany().HasForeignKey(b => b.SubIndustryId);

            // Sprint 2 populates via trigger; column + GIN index shipped now to avoid re-migration.
            e.Property<NpgsqlTsVector?>("SearchVector").HasColumnType("tsvector");
            e.HasIndex("SearchVector").HasMethod("GIN");
        });

        // BusinessProfile JSONB + pgvector
        builder.Entity<BusinessProfile>(e =>
        {
            e.Property(p => p.Capabilities).HasColumnType("jsonb");
            e.Property(p => p.Certifications).HasColumnType("jsonb");
            e.Property(p => p.DeliveryRegions).HasColumnType("jsonb");
            e.Property(p => p.AdditionalLocations).HasColumnType("jsonb");
            e.Property(p => p.SocialLinks).HasColumnType("jsonb");
            e.Property(p => p.Embedding).HasColumnType("vector(1536)");
        });

        // ProfileClaim
        builder.Entity<ProfileClaim>(e =>
        {
            e.HasIndex(pc => pc.InviteToken).IsUnique();
            e.HasIndex(pc => pc.BusinessUid);
            e.HasIndex(pc => pc.RecipientEmail);
        });

        // Catalog
        builder.Entity<CatalogItem>(e =>
        {
            e.Property(c => c.Specifications).HasColumnType("jsonb");
            e.Property(c => c.DeliveryRegions).HasColumnType("jsonb");
            e.Property(c => c.Embedding).HasColumnType("vector(1536)");
            e.Property(c => c.Slug).HasMaxLength(200);
            e.HasIndex(c => new { c.TenantId, c.Slug }).IsUnique();
            e.HasOne(c => c.Category).WithMany().HasForeignKey(c => c.CategoryId);

            e.Property<NpgsqlTsVector?>("SearchVector").HasColumnType("tsvector");
            e.HasIndex("SearchVector").HasMethod("GIN");
        });

        builder.Entity<CatalogCategory>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
            e.HasOne(c => c.ParentCategory).WithMany(c => c.SubCategories).HasForeignKey(c => c.ParentCategoryId);
        });

        // RFQ + Quote
        builder.Entity<Rfq>(e =>
        {
            e.Property(r => r.Attachments).HasColumnType("jsonb");
        });
        builder.Entity<RfqItem>().Property(r => r.Specifications).HasColumnType("jsonb");
        builder.Entity<Quote>(e =>
        {
            e.HasIndex(q => new { q.RfqId, q.TenantId }).IsUnique();
            e.Property(q => q.Attachments).HasColumnType("jsonb");
        });

        // Deal confirmations
        builder.Entity<DealConfirmation>(e =>
        {
            e.HasIndex(d => new { d.BuyerBusinessUid, d.SupplierBusinessUid, d.RfqId, d.QuoteId });
            e.HasOne(d => d.Rfq).WithMany().HasForeignKey(d => d.RfqId);
            e.HasOne(d => d.Quote).WithMany().HasForeignKey(d => d.QuoteId);
        });

        // Network (cross-tenant)
        builder.Entity<Connection>(e =>
        {
            e.HasIndex(c => new { c.RequesterBusinessUid, c.TargetBusinessUid }).IsUnique();
        });

        builder.Entity<Review>(e =>
        {
            e.HasIndex(r => new { r.ReviewerBusinessUid, r.DealConfirmationId }).IsUnique();
            e.HasOne(r => r.DealConfirmation).WithMany().HasForeignKey(r => r.DealConfirmationId);
        });

        // Saved suppliers + lists + searches
        builder.Entity<SavedSupplier>(e =>
        {
            e.HasIndex(s => new { s.TenantId, s.SupplierBusinessUid }).IsUnique();
            e.HasOne(s => s.SupplierList).WithMany(l => l.Suppliers).HasForeignKey(s => s.SupplierListId);
        });
        builder.Entity<SupplierList>(e =>
        {
            e.HasIndex(l => new { l.TenantId, l.Name }).IsUnique();
        });
        builder.Entity<SavedSearch>(e =>
        {
            e.Property(s => s.SearchCriteria).HasColumnType("jsonb");
            e.HasIndex(s => new { s.TenantId, s.Name }).IsUnique();
        });

        // Conversation + Message
        builder.Entity<Conversation>(e =>
        {
            e.HasIndex(c => c.ConversationKey).IsUnique();
            e.Property(c => c.ParticipantBusinessUids).HasColumnType("jsonb");
        });
        builder.Entity<Message>(e =>
        {
            e.Property(m => m.Attachments).HasColumnType("jsonb");
        });

        // Industry
        builder.Entity<Industry>(e =>
        {
            e.HasIndex(i => i.Slug).IsUnique();
            e.HasOne(i => i.Parent).WithMany(i => i.Children).HasForeignKey(i => i.ParentId);
        });

        // Platform reference
        builder.Entity<Country>().HasIndex(c => c.Code).IsUnique();
        builder.Entity<Currency>().HasIndex(c => c.Code).IsUnique();

        builder.Entity<GovernmentRegistryRecord>(e =>
        {
            e.Property(g => g.Payload).HasColumnType("jsonb");
            e.HasIndex(g => new { g.Source, g.RegistryId }).IsUnique();
            e.HasIndex(g => g.LinkedBusinessUid);
        });

        // Enum string conversions
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType.IsEnum)
                {
                    var converterType = typeof(EnumToStringConverter<>).MakeGenericType(property.ClrType);
                    var converter = (ValueConverter)Activator.CreateInstance(converterType)!;
                    property.SetValueConverter(converter);
                }
            }
        }

        // Default decimal precision
        foreach (var property in builder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(4);
        }

        // UTC datetime converter
        var utcConverter = new ValueConverter<DateTime, DateTime>(
            v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        foreach (var property in builder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(DateTime) || p.ClrType == typeof(DateTime?)))
        {
            property.SetValueConverter(utcConverter);
        }
    }

    private void ApplyTenantFilters(ModelBuilder builder)
    {
        builder.Entity<CatalogItem>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        builder.Entity<Rfq>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        builder.Entity<Quote>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        builder.Entity<ComplianceDocument>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        builder.Entity<SavedSupplier>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        builder.Entity<SupplierList>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        builder.Entity<SavedSearch>().HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<TenantEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.TenantId = _tenantContext.TenantId;
                entry.Entity.CreatedBy = _tenantContext.UserId;
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedBy = _tenantContext.UserId;
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return await base.SaveChangesAsync(ct);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder
            .UseSnakeCaseNamingConvention();
    }
}
