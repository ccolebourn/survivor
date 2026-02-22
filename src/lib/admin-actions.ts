"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import pool from "@/lib/db";
import type { Survivor } from "@/lib/types";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  const { rows } = await pool.query(
    `SELECT 1 FROM group_members WHERE user_id = $1 AND role = 'admin' LIMIT 1`,
    [session.user.id]
  );
  if (!rows.length) throw new Error("Admin access required");
}

export async function getSurvivors(): Promise<Survivor[]> {
  const { rows } = await pool.query(
    `SELECT * FROM survivors WHERE season = 50 ORDER BY name`
  );
  return rows as Survivor[];
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
