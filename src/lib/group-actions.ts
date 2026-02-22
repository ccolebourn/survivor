"use server";

import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendEmail, buildInviteEmail } from "@/lib/email";
import type { GroupMembership } from "@/lib/types";

/** Returns all groups the current user belongs to. */
export async function getUserGroups(): Promise<GroupMembership[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  const { rows } = await pool.query<GroupMembership>(
    `SELECT gm.group_id, g.name AS group_name, gm.role, g.status
     FROM group_members gm
     JOIN groups g ON g.id = gm.group_id
     WHERE gm.user_id = $1
     ORDER BY g.name`,
    [session.user.id]
  );

  return rows;
}

/** Creates a new group and adds the creator as admin. Returns the new membership. */
export async function createGroup(formData: FormData): Promise<GroupMembership> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Group name is required.");

  const client = await pool.connect();
  let groupId: number;
  try {
    await client.query("BEGIN");

    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO groups (name, admin_user_id, status)
       VALUES ($1, $2, 'signup')
       RETURNING id`,
      [name, session.user.id]
    );
    groupId = rows[0].id;

    await client.query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [groupId, session.user.id]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return { group_id: groupId!, group_name: name, role: "admin", status: "signup" };
}

/** Sends an invitation email to one or more email addresses for a group. */
export async function sendInvites(formData: FormData): Promise<{ sent: number; errors: string[] }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const groupId = Number(formData.get("group_id"));
  const rawEmails = formData.get("emails") as string;
  const emails = rawEmails
    .split(/[\n,]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));

  if (emails.length === 0) return { sent: 0, errors: ["No valid email addresses provided."] };

  // Verify the caller is admin of this group
  const { rows: memberRows } = await pool.query(
    `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, session.user.id]
  );
  if (!memberRows.length || memberRows[0].role !== "admin") {
    throw new Error("Only the group admin can send invitations.");
  }

  const { rows: groupRows } = await pool.query<{ name: string }>(
    `SELECT name FROM groups WHERE id = $1`,
    [groupId]
  );
  const groupName = groupRows[0]?.name ?? "your group";
  const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  let sent = 0;
  const errors: string[] = [];

  for (const email of emails) {
    try {
      // Check if already a member
      const { rows: existing } = await pool.query(
        `SELECT u.id FROM "user" u
         JOIN group_members gm ON gm.user_id = u.id
         WHERE u.email = $1 AND gm.group_id = $2`,
        [email, groupId]
      );
      if (existing.length > 0) {
        errors.push(`${email} is already a member of this group.`);
        continue;
      }

      // Upsert invitation (resend if pending)
      const token = crypto.randomUUID();
      await pool.query(
        `INSERT INTO invitations (group_id, email, token, status)
         VALUES ($1, $2, $3, 'pending')
         ON CONFLICT DO NOTHING`,
        [groupId, email, token]
      );

      const inviteUrl = `${appUrl}/invite/${token}`;
      await sendEmail({
        to: email,
        subject: `You're invited to join the "${groupName}" Survivor 50 draft`,
        htmlContent: buildInviteEmail({
          groupName,
          inviterName: session.user.name,
          inviteUrl,
        }),
      });

      sent++;
    } catch (err) {
      errors.push(`${email}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return { sent, errors };
}

/** Accepts an invitation by token and adds the user to the group. */
export async function acceptInvite(token: string): Promise<{ groupId: number; groupName: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/login?callbackUrl=/invite/${token}`);

  const { rows } = await pool.query<{ id: number; group_id: number; email: string; status: string }>(
    `SELECT id, group_id, email, status FROM invitations WHERE token = $1`,
    [token]
  );

  const invite = rows[0];
  if (!invite) throw new Error("Invitation not found.");
  if (invite.status !== "pending") throw new Error("This invitation has already been used or has expired.");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, 'player')
       ON CONFLICT (group_id, user_id) DO NOTHING`,
      [invite.group_id, session.user.id]
    );

    await client.query(
      `UPDATE invitations SET status = 'accepted' WHERE id = $1`,
      [invite.id]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  const { rows: groupRows } = await pool.query<{ name: string }>(
    `SELECT name FROM groups WHERE id = $1`,
    [invite.group_id]
  );

  return { groupId: invite.group_id, groupName: groupRows[0]?.name ?? "the group" };
}
