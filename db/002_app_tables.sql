-- Application tables for Survivor 50 Game
-- Run AFTER 001_better_auth_tables.sql

-- Enums
CREATE TYPE group_status AS ENUM (
  'signup',
  'draft_order_posted',
  'draft_complete',
  'in_progress',
  'complete'
);

CREATE TYPE member_role AS ENUM ('player', 'admin');

CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');

-- Survivors
-- One row per castaway per season.
-- week_eliminated is NULL while the survivor is still in the game.
CREATE TABLE survivors (
  id SERIAL PRIMARY KEY,
  season INTEGER NOT NULL DEFAULT 50,
  name TEXT NOT NULL,
  age INTEGER,
  home_town TEXT,
  previous_seasons TEXT,  -- free-form notes on prior appearances, e.g. "Season 12 (Panama), Season 24 (One World)"
  image_path TEXT,        -- local path served from /public, e.g. /survivors/filename.jpg
  week_eliminated INTEGER,
  eliminated_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Groups
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  admin_user_id TEXT NOT NULL REFERENCES "user"(id),
  status group_status NOT NULL DEFAULT 'signup',
  draft_scheduled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Group Members
-- Links users to groups with a role. The admin is also a member with role 'admin'.
CREATE TABLE group_members (
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'player',
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Invitations
-- Tracks pending email invitations to join a group via a unique token link.
CREATE TABLE invitations (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ranked Survivors
-- Stores the order a player assigns to survivors within a group before the draft.
CREATE TABLE ranked_survivors (
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  survivor_id INTEGER NOT NULL REFERENCES survivors(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  PRIMARY KEY (group_id, player_id, survivor_id)
);

-- Draft Order
-- Populated by the admin when they post the draft order.
-- One row per player per group, with their assigned draft position.
CREATE TABLE draft_order (
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  PRIMARY KEY (group_id, player_id)
);

-- Drafted
-- Records which player in a group drafted which survivor, and in which round.
-- A survivor can only be drafted once per group (enforced by unique constraint on group_id + survivor_id).
-- is_free_agent_pick = true when a player picks an un-drafted survivor mid-game after losing one of their own.
CREATE TABLE drafted (
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  survivor_id INTEGER NOT NULL REFERENCES survivors(id) ON DELETE CASCADE,
  round_drafted INTEGER,       -- NULL for free agent picks (no round concept mid-game)
  rank_drafted INTEGER,        -- NULL for free agent picks
  is_free_agent_pick BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (group_id, player_id, survivor_id),
  -- Ensures a survivor can only be with one player per group
  UNIQUE (group_id, survivor_id)
);
