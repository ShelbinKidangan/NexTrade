using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTrade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CatalogDiscovery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // --- catalog_items.search_vector trigger ---
            // delivery_regions is jsonb (JSON string array), so we flatten it
            // via jsonb_array_elements_text + string_agg rather than array_to_string.
            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION catalog_items_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(
            (SELECT string_agg(value, ' ') FROM jsonb_array_elements_text(NEW.delivery_regions)),
            ''
        )), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
");

            migrationBuilder.Sql(@"
DROP TRIGGER IF EXISTS catalog_items_search_vector_trg ON catalog_items;
CREATE TRIGGER catalog_items_search_vector_trg
BEFORE INSERT OR UPDATE OF title, description, delivery_regions
ON catalog_items
FOR EACH ROW
EXECUTE FUNCTION catalog_items_search_vector_update();
");

            // Backfill existing catalog_items rows.
            migrationBuilder.Sql(@"
UPDATE catalog_items
SET search_vector =
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(
        (SELECT string_agg(value, ' ') FROM jsonb_array_elements_text(delivery_regions)),
        ''
    )), 'C');
");

            // --- businesses.search_vector trigger ---
            // Includes capabilities from the child business_profiles row.
            // capabilities is jsonb (JSON string array) — flatten via
            // jsonb_array_elements_text rather than array_to_string.
            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION businesses_search_vector_update() RETURNS trigger AS $$
DECLARE
    profile_about text;
    profile_caps text;
BEGIN
    SELECT
        about,
        (SELECT string_agg(value, ' ') FROM jsonb_array_elements_text(capabilities))
        INTO profile_about, profile_caps
        FROM business_profiles
        WHERE business_id = NEW.id;

    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(profile_caps, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(profile_about, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
");

            migrationBuilder.Sql(@"
DROP TRIGGER IF EXISTS businesses_search_vector_trg ON businesses;
CREATE TRIGGER businesses_search_vector_trg
BEFORE INSERT OR UPDATE OF name
ON businesses
FOR EACH ROW
EXECUTE FUNCTION businesses_search_vector_update();
");

            // --- Re-index businesses when their profile row changes (about / capabilities) ---
            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION business_profiles_touch_business() RETURNS trigger AS $$
BEGIN
    UPDATE businesses
    SET name = name
    WHERE id = COALESCE(NEW.business_id, OLD.business_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
");

            migrationBuilder.Sql(@"
DROP TRIGGER IF EXISTS business_profiles_touch_trg ON business_profiles;
CREATE TRIGGER business_profiles_touch_trg
AFTER INSERT OR UPDATE OF about, capabilities OR DELETE
ON business_profiles
FOR EACH ROW
EXECUTE FUNCTION business_profiles_touch_business();
");

            // Backfill existing businesses rows.
            migrationBuilder.Sql(@"
UPDATE businesses b
SET search_vector =
    setweight(to_tsvector('english', coalesce(b.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(
        (SELECT string_agg(value, ' ') FROM jsonb_array_elements_text(bp.capabilities)),
        ''
    )), 'B') ||
    setweight(to_tsvector('english', coalesce(bp.about, '')), 'C')
FROM business_profiles bp
WHERE bp.business_id = b.id;

UPDATE businesses
SET search_vector = setweight(to_tsvector('english', coalesce(name, '')), 'A')
WHERE search_vector IS NULL;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS business_profiles_touch_trg ON business_profiles;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS business_profiles_touch_business();");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS businesses_search_vector_trg ON businesses;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS businesses_search_vector_update();");
            migrationBuilder.Sql("DROP TRIGGER IF EXISTS catalog_items_search_vector_trg ON catalog_items;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS catalog_items_search_vector_update();");
        }
    }
}
