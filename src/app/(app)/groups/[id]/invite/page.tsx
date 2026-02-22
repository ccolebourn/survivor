"use client";

import { useState } from "react";
import { sendInvites } from "@/lib/group-actions";
import { useGroup } from "@/lib/group-context";

export default function InvitePage() {
  const { activeGroup } = useGroup();
  const [emails, setEmails] = useState("");
  const [result, setResult] = useState<{ sent: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!activeGroup) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.set("group_id", String(activeGroup.group_id));
    formData.set("emails", emails);

    try {
      const res = await sendInvites(formData);
      setResult(res);
      if (res.sent > 0) setEmails("");
    } catch (err) {
      setResult({ sent: 0, errors: [err instanceof Error ? err.message : "Unknown error"] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-2">Invite Players</h1>
      <p className="text-gray-500 text-sm mb-6">
        Enter one or more email addresses (separated by commas or new lines). Each person will receive an email with a link to join{" "}
        <strong>{activeGroup?.group_name}</strong>.
      </p>

      {result && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm border ${result.errors.length === 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
          {result.sent > 0 && <p className="font-medium">{result.sent} invitation{result.sent !== 1 ? "s" : ""} sent.</p>}
          {result.errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label htmlFor="emails" className="block text-sm font-medium text-gray-700 mb-1">
            Email addresses
          </label>
          <textarea
            id="emails"
            rows={5}
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder={"alice@example.com\nbob@example.com"}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !activeGroup}
          className="w-full rounded-lg bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Sending…" : "Send Invitations"}
        </button>
      </form>
    </div>
  );
}
