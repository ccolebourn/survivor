-- Adds season to groups so one database can hold multiple Survivor seasons.
-- Run AFTER 005_add_is_random_pick.sql
--
-- Additive only: no drops, no rewrites of existing rows beyond the backfill.
-- Safe to run against a live game.

-- DEFAULT 50 exists purely to backfill existing rows, which all predate
-- season 51. It is removed immediately afterwards.
ALTER TABLE groups ADD COLUMN season INTEGER NOT NULL DEFAULT 50;

-- Drop the default so the database never guesses a season. Application code
-- supplies it from CURRENT_SEASON in src/lib/constants.ts. Leaving the default
-- in place would silently stamp new groups as season 50 forever.
ALTER TABLE groups ALTER COLUMN season DROP DEFAULT;

-- Groups are looked up by season on the group list and selector.
CREATE INDEX idx_groups_season ON groups (season);
