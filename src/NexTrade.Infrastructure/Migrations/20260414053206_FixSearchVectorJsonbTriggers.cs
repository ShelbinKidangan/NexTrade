using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NexTrade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixSearchVectorJsonbTriggers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // delivery_regions / capabilities are jsonb (JSON arrays of strings),
            // not text[], so array_to_string(...) fails with 42883. Recreate the
            // trigger functions using jsonb_array_elements_text + string_agg.

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

            // Re-run the backfills now that the helpers are jsonb-safe. Safe to
            // run even if tables were empty during the original migration.
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
            // Revert to the previous (buggy) definitions for symmetry.
            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION catalog_items_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(array_to_string(NEW.delivery_regions, ' '), '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
");

            migrationBuilder.Sql(@"
CREATE OR REPLACE FUNCTION businesses_search_vector_update() RETURNS trigger AS $$
DECLARE
    profile_about text;
    profile_caps text;
BEGIN
    SELECT about, array_to_string(capabilities, ' ')
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
        }
    }
}
