import pool from "@/lib/db";

/**
 * Called on every sign-in and sign-up. Finds all invitations for the user's
 * email and ensures the group_members table reflects them:
 *   - pending  → accept: insert into group_members, mark invitation accepted
 *   - accepted → repair: insert into group_members if somehow missing
 *
 * All operations are idempotent (ON CONFLICT DO NOTHING), so re-running is safe.
 */
export async function processUserInvitations(userId: string): Promise<void> {
  // Look up the user's email (session only provides userId)
  const { rows: userRows } = await pool.query<{ email: string }>(
    `SELECT email FROM "user" WHERE id = $1`,
    [userId]
  );
  if (!userRows[0]) return;
  const email = userRows[0].email;

  // Find all invitations for this email
  const { rows: invites } = await pool.query<{
    id: number;
    group_id: number;
    status: string;
  }>(
    `SELECT id, group_id, status FROM invitations WHERE email = $1`,
    [email]
  );
  if (invites.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const invite of invites) {
      // Ensure user is in group_members regardless of invite status
      await client.query(
        `INSERT INTO group_members (group_id, user_id, role)
         VALUES ($1, $2, 'player')
         ON CONFLICT (group_id, user_id) DO NOTHING`,
        [invite.group_id, userId]
      );

      // Mark any pending invitations as accepted
      if (invite.status === "pending") {
        await client.query(
          `UPDATE invitations SET status = 'accepted' WHERE id = $1`,
          [invite.id]
        );
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    // Don't let invitation processing break the sign-in flow
    console.error("[invite-utils] processUserInvitations failed:", err);
  } finally {
    client.release();
  }
}
