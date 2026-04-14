using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTrade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MessagingComplianceTrust : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_messages_conversation_id",
                table: "messages");

            migrationBuilder.AddColumn<DateTime>(
                name: "deleted_at",
                table: "messages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "sender_business_uid",
                table: "messages",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "ix_reviews_reviewed_business_uid_created_at",
                table: "reviews",
                columns: new[] { "reviewed_business_uid", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_messages_conversation_id_created_at",
                table: "messages",
                columns: new[] { "conversation_id", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_compliance_documents_tenant_id_status_expiry_date",
                table: "compliance_documents",
                columns: new[] { "tenant_id", "status", "expiry_date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reviews_reviewed_business_uid_created_at",
                table: "reviews");

            migrationBuilder.DropIndex(
                name: "ix_messages_conversation_id_created_at",
                table: "messages");

            migrationBuilder.DropIndex(
                name: "ix_compliance_documents_tenant_id_status_expiry_date",
                table: "compliance_documents");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "sender_business_uid",
                table: "messages");

            migrationBuilder.CreateIndex(
                name: "ix_messages_conversation_id",
                table: "messages",
                column: "conversation_id");
        }
    }
}
