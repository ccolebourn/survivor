"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/lib/group-actions";
import { useGroup } from "@/lib/group-context";

export default function NewGroupPage() {
  const router = useRouter();
  const { groups, setGroups, setActiveGroup } = useGroup();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await createGroup(formData);
      // Update the context immediately so the navbar reflects the new group
      setGroups([...groups, result.membership]);
      setActiveGroup(result.membership);

      // The group exists either way, so a failed notification must not read as
      // a failed creation. Surface it and let the admin re-invite by email.
      if (result.emailErrors.length > 0) {
        setError(
          `Group created and ${result.membersCopied} member(s) added, but ` +
            `${result.emailErrors.length} notification email(s) failed: ` +
            result.emailErrors.join("; ")
        );
        setLoading(false);
        return;
      }

      router.push("/my-survivors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-2">Create a Group</h1>
      <p className="text-gray-500 text-sm mb-6">
        Give your group a unique name. You&apos;ll be the administrator and can invite players once it&apos;s created.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Group name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. The Survivor Squad"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {groups.length > 0 && (
          <div>
            <label
              htmlFor="copyFromGroupId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Copy members from
            </label>
            <select
              id="copyFromGroupId"
              name="copyFromGroupId"
              defaultValue=""
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Nobody - I&apos;ll invite people myself</option>
              {groups.map((g) => (
                <option key={g.group_id} value={g.group_id}>
                  {g.group_name} (Season {g.season})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              Everyone from that group joins straight away and gets an email.
              There is nothing for them to accept.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 text-white py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Creating…" : "Create Group"}
        </button>
      </form>
    </div>
  );
}
