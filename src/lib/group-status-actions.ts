"use server";

import pool from "@/lib/db";
import type { GroupStatus, MemberRole, Survivor } from "@/lib/types";

export interface PlayerWithSurvivors {
  player_id: string;
  player_name: string;
  role: MemberRole;
  has_ranked: boolean; // true if player has submitted any survivor rankings
  survivors: Array<Survivor & { round_drafted: number | null; is_free_agent_pick: boolean }>;
  is_eliminated: boolean; // true if ALL their survivors have week_eliminated set
}

export interface PendingInvitation {
  id: number;
  email: string;
  has_account: boolean;
}

export interface GroupStatusData {
  group_id: number;
  group_name: string;
  status: GroupStatus;
  draft_scheduled_at: string | null;
  players: PlayerWithSurvivors[];
  pendingInvitations: PendingInvitation[];
  undraftedSurvivors: Survivor[];
}

interface QueryRow {
  player_id: string;
  player_name: string;
  role: MemberRole;
  group_id: number;
  group_name: string;
  group_status: GroupStatus;
  draft_scheduled_at: string | null;
  has_ranked: boolean;
  round_drafted: number | null;
  is_free_agent_pick: boolean | null;
  survivor_id: number | null;
  survivor_name: string | null;
  age: number | null;
  home_town: string | null;
  previous_seasons: string | null;
  image_path: string | null;
  week_eliminated: number | null;
  eliminated_at: string | null;
  season: number | null;
}

export async function getGroupStatusData(groupId: number): Promise<GroupStatusData | null> {
  const { rows } = await pool.query<QueryRow>(
    `SELECT
      gm.user_id as player_id,
      u.name as player_name,
      gm.role,
      g.id as group_id,
      g.name as group_name,
      g.status as group_status,
      g.draft_scheduled_at,
      COALESCE(rs_count.cnt, 0) > 0 as has_ranked,
      d.round_drafted,
      d.is_free_agent_pick,
      s.id as survivor_id,
      s.name as survivor_name,
      s.age,
      s.home_town,
      s.previous_seasons,
      s.image_path,
      s.week_eliminated,
      s.eliminated_at,
      s.season
    FROM group_members gm
    JOIN "user" u ON u.id = gm.user_id
    JOIN groups g ON g.id = gm.group_id
    LEFT JOIN (
      SELECT player_id, COUNT(*) as cnt
      FROM ranked_survivors
      WHERE group_id = $1
      GROUP BY player_id
    ) rs_count ON rs_count.player_id = gm.user_id
    LEFT JOIN drafted d ON d.group_id = gm.group_id AND d.player_id = gm.user_id
    LEFT JOIN survivors s ON s.id = d.survivor_id
    WHERE gm.group_id = $1
    ORDER BY u.name, d.round_drafted ASC NULLS LAST, s.name`,
    [groupId]
  );

  if (rows.length === 0) return null;

  const firstRow = rows[0];
  const playerMap = new Map<string, PlayerWithSurvivors>();

  for (const row of rows) {
    if (!playerMap.has(row.player_id)) {
      playerMap.set(row.player_id, {
        player_id: row.player_id,
        player_name: row.player_name,
        role: row.role,
        has_ranked: row.has_ranked,
        survivors: [],
        is_eliminated: false,
      });
    }

    const player = playerMap.get(row.player_id)!;

    if (row.survivor_id != null) {
      player.survivors.push({
        id: row.survivor_id,
        season: row.season ?? 50,
        name: row.survivor_name ?? "",
        age: row.age,
        home_town: row.home_town,
        previous_seasons: row.previous_seasons,
        image_path: row.image_path,
        week_eliminated: row.week_eliminated,
        eliminated_at: row.eliminated_at,
        round_drafted: row.round_drafted,
        is_free_agent_pick: row.is_free_agent_pick ?? false,
      });
    }
  }

  // Compute is_eliminated: player has at least one survivor and ALL are eliminated
  for (const player of playerMap.values()) {
    player.is_eliminated =
      player.survivors.length > 0 &&
      player.survivors.every((s) => s.week_eliminated != null);
  }

  const { rows: inviteRows } = await pool.query<PendingInvitation>(
    `SELECT i.id, i.email, (u.id IS NOT NULL) AS has_account
     FROM invitations i
     LEFT JOIN "user" u ON lower(u.email) = i.email
     WHERE i.group_id = $1 AND i.status = 'pending'
     ORDER BY i.email`,
    [groupId]
  );

  const { rows: undraftedRows } = await pool.query<Survivor>(
    `SELECT s.id, s.season, s.name, s.age, s.home_town, s.previous_seasons, s.image_path, s.week_eliminated, s.eliminated_at
     FROM survivors s
     WHERE s.id NOT IN (
       SELECT survivor_id FROM drafted WHERE group_id = $1
     )
     ORDER BY s.name`,
    [groupId]
  );

  return {
    group_id: firstRow.group_id,
    group_name: firstRow.group_name,
    status: firstRow.group_status,
    draft_scheduled_at: firstRow.draft_scheduled_at,
    players: Array.from(playerMap.values()),
    pendingInvitations: inviteRows,
    undraftedSurvivors: undraftedRows,
  };
}
