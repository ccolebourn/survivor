"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-client";
import {
  SurvivorAuthPanel,
  SurvivorAuthStyles,
  SurvivorMobileHeader,
} from "@/components/survivor-auth-panel";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // redirectTo is where BetterAuth forwards the user after it has validated
    // the token from the emailed link.
    const { error } = await requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (error) {
      setError(error.message ?? "Could not send the reset email. Try again.");
      setLoading(false);
      return;
    }

    // Always show the same confirmation, whether or not the address exists.
    // Saying "no such account" would let anyone test which emails are registered.
    setSent(true);
    setLoading(false);
  }

  return (
    <>
      <SurvivorAuthStyles />
      <div className="min-h-screen flex">
        <SurvivorAuthPanel />

        <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
          <div className="w-full max-w-sm">
            <SurvivorMobileHeader />
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Forgot your password?
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Enter your email and we&apos;ll send you a link to set a new one.
            </p>

            {sent ? (
              <>
                <div className="rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm">
                  If an account exists for <strong>{email}</strong>, a reset link
                  is on its way. The link expires in one hour.
                </div>
                <p className="mt-6 text-center text-sm text-gray-500">
                  <Link
                    href="/login"
                    className="text-orange-500 hover:underline font-medium"
                  >
                    Back to sign in
                  </Link>
                </p>
              </>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-orange-500 text-white py-2.5 text-sm font-bold tracking-wide hover:bg-orange-600 disabled:opacity-50 transition"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                  Remembered it?{" "}
                  <Link
                    href="/login"
                    className="text-orange-500 hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
