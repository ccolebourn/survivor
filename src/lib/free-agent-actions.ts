"use server";

import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Survivor } from "@/lib/types";

export interface FreeAgentEligibility {
  eligible: boolean;
  availablePicks: number;
  undraftedSurvivors: Survivor[];
}

/**
 * Checks whether the current user is eligible for a free agent pick in the given group.
 *
 * Eligible when:
 * - Group status is 'in_progress'
 * - Player has at least one eliminated survivor
 * - Player still has at least one alive survivor (not fully eliminated)
 * - There are undrafted, non-eliminated survivors available
 * - Available picks = (eliminated survivors) − (free agent picks already made) > 0
 */
export async function getFreeAgentEligibility(
  groupId: number
): Promise<FreeAgentEligibility> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { eligible: false, availablePicks: 0, undraftedSurvivors: [] };

  const playerId = session.user.id;

  // Check group status
  const { rows: groupRows } = await pool.query<{ status: string }>(
    `SELECT status FROM groups WHERE id = $1`,
    [groupId]
  );
  if (groupRows.length === 0 || groupRows[0].status !== "in_progress") {
    return { eligible: false, availablePicks: 0, undraftedSurvivors: [] };
  }

  // Count eliminated survivors for this player
  const { rows: elimRows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM drafted d
     JOIN survivors s ON s.id = d.survivor_id
     WHERE d.group_id = $1 AND d.player_id = $2 AND s.week_eliminated IS NOT NULL`,
    [groupId, playerId]
  );
  const eliminatedCount = parseInt(elimRows[0].count, 10);

  // Count alive survivors for this player
  const { rows: aliveRows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM drafted d
     JOIN survivors s ON s.id = d.survivor_id
     WHERE d.group_id = $1 AND d.player_id = $2 AND s.week_eliminated IS NULL`,
    [groupId, playerId]
  );
  const aliveCount = parseInt(aliveRows[0].count, 10);

  // Count free agent picks already made by this player
  const { rows: faPicks } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM drafted
     WHERE group_id = $1 AND player_id = $2 AND is_free_agent_pick = true`,
    [groupId, playerId]
  );
  const freeAgentPicksMade = parseInt(faPicks[0].count, 10);

  const availablePicks = eliminatedCount - freeAgentPicksMade;

  // Player must have eliminated survivors, not be fully eliminated, and have picks remaining
  if (eliminatedCount === 0 || aliveCount === 0 || availablePicks <= 0) {
    return { eligible: false, availablePicks: 0, undraftedSurvivors: [] };
  }

  // Get undrafted, non-eliminated survivors
  const { rows: undrafted } = await pool.query<Survivor>(
    `SELECT s.*
     FROM survivors s
     WHERE s.season = 50
       AND s.week_eliminated IS NULL
       AND s.id NOT IN (SELECT survivor_id FROM drafted WHERE group_id = $1)
     ORDER BY s.name`,
    [groupId]
  );

  if (undrafted.length === 0) {
    return { eligible: false, availablePicks: 0, undraftedSurvivors: [] };
  }

  return { eligible: true, availablePicks, undraftedSurvivors: undrafted };
}

/**
 * Player self-service: claim an undrafted survivor as a free agent pick.
 */
export async function claimFreeAgent(
  groupId: number,
  survivorId: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Not authenticated" };

  const playerId = session.user.id;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify group status
    const { rows: groupRows } = await client.query<{ status: string }>(
      `SELECT status FROM groups WHERE id = $1 FOR UPDATE`,
      [groupId]
    );
    if (groupRows.length === 0 || groupRows[0].status !== "in_progress") {
      await client.query("ROLLBACK");
      return { success: false, error: "Group is not in progress" };
    }

    // Verify player is a member
    const { rows: memberRows } = await client.query(
      `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, playerId]
    );
    if (memberRows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "You are not a member of this group" };
    }

    // Count eliminated survivors
    const { rows: elimRows } = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM drafted d
       JOIN survivors s ON s.id = d.survivor_id
       WHERE d.group_id = $1 AND d.player_id = $2 AND s.week_eliminated IS NOT NULL`,
      [groupId, playerId]
    );
    const eliminatedCount = parseInt(elimRows[0].count, 10);

    // Count alive survivors
    const { rows: aliveRows } = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM drafted d
       JOIN survivors s ON s.id = d.survivor_id
       WHERE d.group_id = $1 AND d.player_id = $2 AND s.week_eliminated IS NULL`,
      [groupId, playerId]
    );
    const aliveCount = parseInt(aliveRows[0].count, 10);

    if (aliveCount === 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "You have been fully eliminated" };
    }

    // Count free agent picks already made
    const { rows: faPicks } = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM drafted
       WHERE group_id = $1 AND player_id = $2 AND is_free_agent_pick = true`,
      [groupId, playerId]
    );
    const freeAgentPicksMade = parseInt(faPicks[0].count, 10);

    if (eliminatedCount - freeAgentPicksMade <= 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "No free agent picks available" };
    }

    // Verify survivor is not eliminated
    const { rows: survivorRows } = await client.query<{ week_eliminated: number | null }>(
      `SELECT week_eliminated FROM survivors WHERE id = $1`,
      [survivorId]
    );
    if (survivorRows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "Survivor not found" };
    }
    if (survivorRows[0].week_eliminated != null) {
      await client.query("ROLLBACK");
      return { success: false, error: "This survivor has been eliminated" };
    }

    // Insert the free agent pick
    await client.query(
      `INSERT INTO drafted (group_id, player_id, survivor_id, round_drafted, rank_drafted, is_free_agent_pick)
       VALUES ($1, $2, $3, NULL, NULL, true)`,
      [groupId, playerId, survivorId]
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (err: unknown) {
    await client.query("ROLLBACK");
    // Unique constraint violation — survivor already claimed
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "23505") {
      return { success: false, error: "This survivor was already claimed" };
    }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Admin assigns a free agent pick on behalf of a player.
 */
export async function adminClaimFreeAgent(
  groupId: number,
  playerId: string,
  survivorId: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Not authenticated" };

  // Verify caller is admin of this group
  const { rows: adminRows } = await pool.query(
    `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = 'admin'`,
    [groupId, session.user.id]
  );
  if (adminRows.length === 0) {
    return { success: false, error: "Admin access required" };
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify group status
    const { rows: groupRows } = await client.query<{ status: string }>(
      `SELECT status FROM groups WHERE id = $1 FOR UPDATE`,
      [groupId]
    );
    if (groupRows.length === 0 || groupRows[0].status !== "in_progress") {
      await client.query("ROLLBACK");
      return { success: false, error: "Group is not in progress" };
    }

    // Verify player is a member
    const { rows: memberRows } = await client.query(
      `SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, playerId]
    );
    if (memberRows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "Player is not a member of this group" };
    }

    // Count eliminated survivors for the player
    const { rows: elimRows } = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM drafted d
       JOIN survivors s ON s.id = d.survivor_id
       WHERE d.group_id = $1 AND d.player_id = $2 AND s.week_eliminated IS NOT NULL`,
      [groupId, playerId]
    );
    const eliminatedCount = parseInt(elimRows[0].count, 10);

    // Count alive survivors
    const { rows: aliveRows } = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM drafted d
       JOIN survivors s ON s.id = d.survivor_id
       WHERE d.group_id = $1 AND d.player_id = $2 AND s.week_eliminated IS NULL`,
      [groupId, playerId]
    );
    const aliveCount = parseInt(aliveRows[0].count, 10);

    if (aliveCount === 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "Player has been fully eliminated" };
    }

    // Count free agent picks already made
    const { rows: faPicks } = await client.query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM drafted
       WHERE group_id = $1 AND player_id = $2 AND is_free_agent_pick = true`,
      [groupId, playerId]
    );
    const freeAgentPicksMade = parseInt(faPicks[0].count, 10);

    if (eliminatedCount - freeAgentPicksMade <= 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "No free agent picks available for this player" };
    }

    // Verify survivor is not eliminated
    const { rows: survivorRows } = await client.query<{ week_eliminated: number | null }>(
      `SELECT week_eliminated FROM survivors WHERE id = $1`,
      [survivorId]
    );
    if (survivorRows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, error: "Survivor not found" };
    }
    if (survivorRows[0].week_eliminated != null) {
      await client.query("ROLLBACK");
      return { success: false, error: "This survivor has been eliminated" };
    }

    // Insert the free agent pick
    await client.query(
      `INSERT INTO drafted (group_id, player_id, survivor_id, round_drafted, rank_drafted, is_free_agent_pick)
       VALUES ($1, $2, $3, NULL, NULL, true)`,
      [groupId, playerId, survivorId]
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (err: unknown) {
    await client.query("ROLLBACK");
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "23505") {
      return { success: false, error: "This survivor was already claimed" };
    }
    throw err;
  } finally {
    client.release();
  }
}
