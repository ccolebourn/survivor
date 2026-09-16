import { CURRENT_SEASON } from "@/lib/constants";

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail({ to, subject, htmlContent }: SendEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@survivor50.app";

  if (!apiKey || apiKey === "replace-me-with-brevo-api-key") {
    // In production a missing key must be loud. Silently logging would let the
    // UI report success while a password-reset link went nowhere, which is the
    // one failure the user cannot diagnose or work around.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "BREVO_API_KEY is not set. Refusing to silently discard an email."
      );
    }

    // In development, log the email instead of sending.
    console.log("[EMAIL] Would send to:", to);
    console.log("[EMAIL] Subject:", subject);
    console.log("[EMAIL] Body:", htmlContent);
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: from, name: `Survivor ${CURRENT_SEASON} Draft` },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
}

export function buildInviteEmail(params: {
  groupName: string;
  inviterName: string;
  inviteUrl: string;
}): string {
  const { groupName, inviterName, inviteUrl } = params;
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1d4ed8;">You've been invited to join a Survivor ${CURRENT_SEASON} draft group!</h2>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${groupName}</strong>.</p>
      <p>Click the button below to accept the invitation and join the group:</p>
      <a href="${inviteUrl}"
         style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Accept Invitation
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:13px;">
        If you weren't expecting this invitation, you can safely ignore this email.
      </p>
    </div>
  `;
}

/** Sent when an admin carries an existing player into a new season's group.
 *  Unlike an invitation there is nothing to accept - they are already a member. */
export function buildAddedToGroupEmail(params: {
  groupName: string;
  adminName: string;
  appUrl: string;
}): string {
  const { groupName, adminName, appUrl } = params;
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1d4ed8;">You're in for Survivor ${CURRENT_SEASON}!</h2>
      <p><strong>${adminName}</strong> has added you to <strong>${groupName}</strong>.</p>
      <p>You don't need to accept anything - you're already a member. Sign in and
         rank the castaways before the draft.</p>
      <a href="${appUrl}/my-survivors"
         style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Rank Your Castaways
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:13px;">
        Forgotten your password? Use the "Forgot password" link on the sign-in page.
      </p>
    </div>
  `;
}

/** Sent by BetterAuth's sendResetPassword hook. */
export function buildPasswordResetEmail(params: {
  userName: string;
  resetUrl: string;
}): string {
  const { userName, resetUrl } = params;
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1d4ed8;">Reset your password</h2>
      <p>Hi ${userName}, we received a request to reset the password on your
         Survivor ${CURRENT_SEASON} draft account.</p>
      <a href="${resetUrl}"
         style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        Reset Password
      </a>
      <p style="margin-top:24px;color:#6b7280;font-size:13px;">
        This link expires in one hour. If you didn't ask to reset your password,
        ignore this email - your password will not change.
      </p>
    </div>
  `;
}
