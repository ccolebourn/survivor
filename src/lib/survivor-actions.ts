"use server";

import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Survivor } from "@/lib/types";

export interface RankedSurvivor extends Survivor {
  rank: number | null;
}

export interface DraftedSurvivor extends Survivor {
  is_free_agent_pick: boolean;
}

/** All survivors for a given season. */
export async function getSurvivors(season = 50): Promise<Survivor[]> {
  const { rows } = await pool.query<Survivor>(
    `SELECT * FROM survivors WHERE season = $1 ORDER BY name`,
    [season]
  );
  return rows;
}

/** Current user's rankings for a group, merged with all survivors. */
export async function getUserRankings(groupId: number): Promise<RankedSurvivor[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const { rows } = await pool.query<RankedSurvivor>(
    `SELECT s.*, rs.rank
     FROM survivors s
     LEFT JOIN ranked_survivors rs
       ON rs.survivor_id = s.id
       AND rs.group_id = $1
       AND rs.player_id = $2
     WHERE s.season = 50
     ORDER BY rs.rank ASC NULLS LAST, s.name ASC`,
    [groupId, session.user.id]
  );
  return rows;
}

/** Saves (upserts) the full ranking list for the current user in a group. */
export async function saveRankings(
  groupId: number,
  rankings: Array<{ survivor_id: number; rank: number }>
): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Delete existing rankings for this user/group
    await client.query(
      `DELETE FROM ranked_survivors WHERE group_id = $1 AND player_id = $2`,
      [groupId, session.user.id]
    );

    // Insert all new rankings
    if (rankings.length > 0) {
      const values = rankings
        .map((_, i) => `($1, $2, $${i * 2 + 3}, $${i * 2 + 4})`)
        .join(", ");
      const params: unknown[] = [groupId, session.user.id];
      for (const r of rankings) {
        params.push(r.survivor_id, r.rank);
      }
      await client.query(
        `INSERT INTO ranked_survivors (group_id, player_id, survivor_id, rank) VALUES ${values}`,
        params
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/** Survivors drafted by the current user in a group. */
export async function getDraftedSurvivors(groupId: number): Promise<DraftedSurvivor[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const { rows } = await pool.query<DraftedSurvivor>(
    `SELECT s.*, d.is_free_agent_pick
     FROM drafted d
     JOIN survivors s ON s.id = d.survivor_id
     WHERE d.group_id = $1 AND d.player_id = $2
     ORDER BY d.round_drafted ASC NULLS LAST, s.name ASC`,
    [groupId, session.user.id]
  );
  return rows;
}
