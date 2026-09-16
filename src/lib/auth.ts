import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { processUserInvitations } from "@/lib/invite-utils";
import { sendEmail, buildPasswordResetEmail } from "@/lib/email";
import { CURRENT_SEASON } from "@/lib/constants";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    // Set explicitly rather than relying on the default so the "expires in one
    // hour" line in the email cannot drift away from the real expiry.
    resetPasswordTokenExpiresIn: 60 * 60,
    // `url` already points at BetterAuth's /reset-password/:token callback,
    // which validates the token and then forwards to the redirectTo the client
    // supplied (/reset-password). Email it as-is; do not rebuild it.
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: `Reset your Survivor ${CURRENT_SEASON} draft password`,
        htmlContent: buildPasswordResetEmail({
          userName: user.name,
          resetUrl: url,
        }),
      });
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
    },
  },
  account: {
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          // Auto-accept any pending invitations for this user's email
          await processUserInvitations(session.userId);
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
