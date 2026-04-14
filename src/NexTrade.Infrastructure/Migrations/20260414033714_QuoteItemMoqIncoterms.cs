using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTrade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class QuoteItemMoqIncoterms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "incoterms",
                table: "quote_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "min_order_quantity",
                table: "quote_items",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "incoterms",
                table: "quote_items");

            migrationBuilder.DropColumn(
                name: "min_order_quantity",
                table: "quote_items");
        }
    }
}
