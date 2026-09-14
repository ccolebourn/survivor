"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import pool from "@/lib/db";
import type { Survivor } from "@/lib/types";
import { CURRENT_SEASON } from "@/lib/constants";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  const { rows } = await pool.query(
    `SELECT 1 FROM group_members WHERE user_id = $1 AND role = 'admin' LIMIT 1`,
    [session.user.id]
  );
  if (!rows.length) throw new Error("Admin access required");
}

/** Survivors for one season. This is the only survivor query that is not
 *  group-scoped, so the season cannot be derived and has to be passed in.
 *  Defaults to the current season; the admin page passes an explicit one when
 *  the user switches to a past season. */
export async function getSurvivors(
  season: number = CURRENT_SEASON
): Promise<Survivor[]> {
  const { rows } = await pool.query(
    `SELECT * FROM survivors WHERE season = $1 ORDER BY name`,
    [season]
  );
  return rows as Survivor[];
}

/** Seasons that have survivors, newest first. Drives the admin season picker. */
export async function getAvailableSeasons(): Promise<number[]> {
  const { rows } = await pool.query<{ season: number }>(
    `SELECT DISTINCT season FROM survivors ORDER BY season DESC`
  );
  return rows.map((r) => r.season);
}

export async function eliminateSurvivor(
  survivorId: number,
  weekEliminated: number
): Promise<void> {
  await requireAdmin();
  await pool.query(
    `UPDATE survivors SET week_eliminated = $1, eliminated_at = NOW() WHERE id = $2`,
    [weekEliminated, survivorId]
  );
}

export async function reinstateSurvivor(survivorId: number): Promise<void> {
  await requireAdmin();
  await pool.query(
    `UPDATE survivors SET week_eliminated = NULL, eliminated_at = NULL WHERE id = $1`,
    [survivorId]
  );
}
