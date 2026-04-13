using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTrade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCatalogItemSlug : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "slug",
                table: "catalog_items",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            // Backfill existing rows so the unique index doesn't collide on the empty-string
            // default across multiple rows per tenant.
            migrationBuilder.Sql(@"
UPDATE catalog_items
SET slug = left(
    regexp_replace(lower(coalesce(title, 'item')), '[^a-z0-9]+', '-', 'g'),
    160
) || '-' || substr(uid::text, 1, 8)
WHERE slug = '';
");

            migrationBuilder.CreateIndex(
                name: "ix_catalog_items_tenant_id_slug",
                table: "catalog_items",
                columns: new[] { "tenant_id", "slug" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_catalog_items_tenant_id_slug",
                table: "catalog_items");

            migrationBuilder.DropColumn(
                name: "slug",
                table: "catalog_items");
        }
    }
}
