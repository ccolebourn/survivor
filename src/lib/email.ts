interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail({ to, subject, htmlContent }: SendEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@survivor50.app";

  if (!apiKey || apiKey === "replace-me-with-brevo-api-key") {
    // In development, log the email instead of sending
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
      sender: { email: from, name: "Survivor 50 Draft" },
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
      <h2 style="color: #1d4ed8;">You've been invited to join a Survivor 50 draft group!</h2>
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
