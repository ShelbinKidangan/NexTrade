using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace NexTrade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdminConsole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "moderation",
                table: "rfqs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "moderation",
                table: "reviews",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "is_suspended",
                table: "businesses",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "suspended_at",
                table: "businesses",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "suspension_reason",
                table: "businesses",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "admin_audit_entries",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    admin_user_id = table.Column<long>(type: "bigint", nullable: false),
                    admin_email = table.Column<string>(type: "text", nullable: false),
                    action = table.Column<string>(type: "text", nullable: false),
                    target_entity = table.Column<string>(type: "text", nullable: true),
                    target_uid = table.Column<Guid>(type: "uuid", nullable: true),
                    payload = table.Column<string>(type: "jsonb", nullable: true),
                    route = table.Column<string>(type: "text", nullable: true),
                    method = table.Column<string>(type: "text", nullable: true),
                    status_code = table.Column<int>(type: "integer", nullable: true),
                    ip_address = table.Column<string>(type: "text", nullable: true),
                    uid = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_admin_audit_entries", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_admin_audit_entries_admin_user_id_created_at",
                table: "admin_audit_entries",
                columns: new[] { "admin_user_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_admin_audit_entries_target_entity_target_uid",
                table: "admin_audit_entries",
                columns: new[] { "target_entity", "target_uid" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_audit_entries");

            migrationBuilder.DropColumn(
                name: "moderation",
                table: "rfqs");

            migrationBuilder.DropColumn(
                name: "moderation",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "is_suspended",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "suspended_at",
                table: "businesses");

            migrationBuilder.DropColumn(
                name: "suspension_reason",
                table: "businesses");
        }
    }
}
