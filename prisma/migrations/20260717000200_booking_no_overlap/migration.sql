-- Voorkomt dubbele boekingen op databaseniveau, zelfs bij gelijktijdige
-- aanvragen. Kan niet in Prisma's schema-taal uitgedrukt worden, dus als
-- losstaande raw-SQL migratie toegevoegd (zie prisma/schema.prisma).

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- "startsAt"/"endsAt" zijn "timestamp" (zonder tijdzone), dus tsrange(...)
-- hierop is (in tegenstelling tot tstzrange, dat via een STABLE
-- tijdzone-afhankelijke cast zou lopen als de kolommen wél tz hadden)
-- gewoon IMMUTABLE en bruikbaar in een index-expressie.
ALTER TABLE "Booking"
  ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    tsrange("startsAt", "endsAt", '[)') WITH &&
  ) WHERE ("status" <> 'CANCELLED');
