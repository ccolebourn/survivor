"use server";

import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { GroupStatus, Survivor } from "@/lib/types";
import { generateDraftOrder, runSnakeDraft } from "@/lib/draft-algorithms";

export interface DraftState {
  group_id: number;
  group_name: string;
  status: GroupStatus;
  draft_scheduled_at: string | null;
  draftOrder: Array<{ player_id: string; player_name: string; rank: number }>;
  picks: Array<{
    round: number;
    rank_in_round: number;
    player_id: string;
    player_name: string;
    survivor: Survivor;
    is_random_pick: boolean;
  }>;
}

export async function getDraftState(groupId: number): Promise<DraftState> {
  const { rows: groupRows } = await pool.query<{
    group_id: number;
    group_name: string;
    status: GroupStatus;
    draft_scheduled_at: string | null;
  }>(
    `SELECT id as group_id, name as group_name, status, draft_scheduled_at
     FROM groups WHERE id = $1`,
    [groupId]
  );

  if (groupRows.length === 0) {
    throw new Error("Group not found.");
  }

  const group = groupRows[0];

  const { rows: orderRows } = await pool.query<{
    player_id: string;
    player_name: string;
    rank: number;
  }>(
    `SELECT dord.player_id, dord.rank, u.name as player_name
     FROM draft_order dord
     JOIN "user" u ON u.id = dord.player_id
     WHERE dord.group_id = $1
     ORDER BY dord.rank`,
    [groupId]
  );

  const { rows: pickRows } = await pool.query<{
    round: number;
    rank_in_round: number;
    player_id: string;
    player_name: string;
    is_random_pick: boolean;
    id: number;
    name: string;
    age: number | null;
    home_town: string | null;
    previous_seasons: string | null;
    image_path: string | null;
    week_eliminated: number | null;
    eliminated_at: string | null;
    season: number;
  }>(
    `SELECT d.round_drafted as round, d.rank_drafted as rank_in_round, d.player_id, d.is_random_pick,
       u.name as player_name,
       s.id, s.name, s.age, s.home_town, s.previous_seasons, s.image_path, s.week_eliminated, s.eliminated_at, s.season
     FROM drafted d
     JOIN "user" u ON u.id = d.player_id
     JOIN survivors s ON s.id = d.survivor_id
     WHERE d.group_id = $1 AND d.is_free_agent_pick = false
     ORDER BY d.round_drafted, d.rank_drafted`,
    [groupId]
  );

  const picks = pickRows.map((row) => ({
    round: row.round,
    rank_in_round: row.rank_in_round,
    player_id: row.player_id,
    player_name: row.player_name,
    is_random_pick: row.is_random_pick,
    survivor: {
      id: row.id,
      season: row.season,
      name: row.name,
      age: row.age,
      home_town: row.home_town,
      previous_seasons: row.previous_seasons,
      image_path: row.image_path,
      week_eliminated: row.week_eliminated,
      eliminated_at: row.eliminated_at,
    } satisfies Survivor,
  }));

  return {
    group_id: group.group_id,
    group_name: group.group_name,
    status: group.status,
    draft_scheduled_at: group.draft_scheduled_at,
    draftOrder: orderRows,
    picks,
  };
}

export async function postDraftOrder(groupId: number): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated.");

  // Verify caller is admin of this group
  const { rows: memberRows } = await pool.query(
    `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = 'admin'`,
    [groupId, session.user.id]
  );
  if (memberRows.length === 0) {
    throw new Error("Only the group admin can post the draft order.");
  }

  // Get all player IDs in this group
  const { rows: playerRows } = await pool.query<{ user_id: string }>(
    `SELECT user_id FROM group_members WHERE group_id = $1`,
    [groupId]
  );

  const playerIds = playerRows.map((r) => r.user_id);
  if (playerIds.length === 0) {
    throw new Error("No players in this group.");
  }

  const draftOrderEntries = generateDraftOrder(playerIds);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`DELETE FROM draft_order WHERE group_id = $1`, [groupId]);

    for (const entry of draftOrderEntries) {
      await client.query(
        `INSERT INTO draft_order (group_id, player_id, rank) VALUES ($1, $2, $3)`,
        [groupId, entry.player_id, entry.rank]
      );
    }

    await client.query(
      `UPDATE groups SET status = 'draft_order_posted' WHERE id = $1`,
      [groupId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function runDraft(groupId: number): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated.");

  // Verify caller is admin of this group
  const { rows: memberRows } = await pool.query(
    `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = 'admin'`,
    [groupId, session.user.id]
  );
  if (memberRows.length === 0) {
    throw new Error("Only the group admin can run the draft.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get draft order
    const { rows: orderRows } = await client.query<{ player_id: string; rank: number }>(
      `SELECT player_id, rank FROM draft_order WHERE group_id = $1 ORDER BY rank`,
      [groupId]
    );

    if (orderRows.length === 0) {
      throw new Error("Draft order has not been posted yet.");
    }

    // Build playerRankings: for each player, get their ranked survivor IDs
    const playerRankings: Record<string, number[]> = {};
    for (const { player_id } of orderRows) {
      const { rows: rankRows } = await client.query<{ survivor_id: number }>(
        `SELECT survivor_id FROM ranked_survivors WHERE group_id = $1 AND player_id = $2 ORDER BY rank ASC`,
        [groupId, player_id]
      );
      playerRankings[player_id] = rankRows.map((r) => r.survivor_id);
    }

    // Get all season 50 survivor IDs (include all, even eliminated — draft happened before game started)
    const { rows: survivorRows } = await client.query<{ id: number }>(
      `SELECT id FROM survivors WHERE season = 50`,
      []
    );
    const availableSurvivorIds = survivorRows.map((r) => r.id);

    // Run the snake draft algorithm
    const picks = runSnakeDraft({
      draftOrder: orderRows,
      playerRankings,
      availableSurvivorIds,
    });

    // Clear any previous non-free-agent picks
    await client.query(
      `DELETE FROM drafted WHERE group_id = $1 AND is_free_agent_pick = false`,
      [groupId]
    );

    // Insert all picks
    for (const pick of picks) {
      await client.query(
        `INSERT INTO drafted (group_id, player_id, survivor_id, round_drafted, rank_drafted, is_free_agent_pick, is_random_pick)
         VALUES ($1, $2, $3, $4, $5, false, $6)`,
        [groupId, pick.player_id, pick.survivor_id, pick.round, pick.rank_in_round, pick.is_random_pick]
      );
    }

    // Advance group status to in_progress
    await client.query(
      `UPDATE groups SET status = 'in_progress' WHERE id = $1`,
      [groupId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
