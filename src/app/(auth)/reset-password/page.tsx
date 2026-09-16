"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";
import {
  SurvivorAuthPanel,
  SurvivorAuthStyles,
  SurvivorMobileHeader,
} from "@/components/survivor-auth-panel";

// BetterAuth's default minPasswordLength. Checked here so the user gets the
// message before a round trip, but the server enforces it regardless.
const MIN_PASSWORD_LENGTH = 8;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // BetterAuth validates the emailed token and then forwards here with it in
  // the query string. It also forwards ?error=... when the token is bad.
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token || linkError) {
    return (
      <>
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          This reset link is invalid or has expired. Reset links are good for one
          hour and can only be used once.
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link
            href="/forgot-password"
            className="text-orange-500 hover:underline font-medium"
          >
            Request a new link
          </Link>
        </p>
      </>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    const { error } = await resetPassword({ newPassword: password, token: token! });

    if (error) {
      setError(error.message ?? "Could not reset your password. Try again.");
      setLoading(false);
      return;
    }

    router.push("/login?reset=1");
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <p className="mt-1 text-xs text-gray-400">
            At least {MIN_PASSWORD_LENGTH} characters.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm new password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 text-white py-2.5 text-sm font-bold tracking-wide hover:bg-orange-600 disabled:opacity-50 transition"
        >
          {loading ? "Saving..." : "Set New Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <SurvivorAuthStyles />
      <div className="min-h-screen flex">
        <SurvivorAuthPanel />

        <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
          <div className="w-full max-w-sm">
            <SurvivorMobileHeader />
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Choose a new password
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Pick something you&apos;ll remember this time.
            </p>
            {/* useSearchParams must sit inside Suspense or the build fails. */}
            <Suspense
              fallback={
                <div className="text-center text-gray-400 text-sm">Loading...</div>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
