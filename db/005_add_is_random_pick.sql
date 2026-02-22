-- Add is_random_pick column to drafted table.
-- Tracks whether a draft pick was made randomly (player had no ranked survivors left)
-- vs. from their preference list.
ALTER TABLE drafted ADD COLUMN is_random_pick BOOLEAN NOT NULL DEFAULT FALSE;
