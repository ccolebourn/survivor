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
      const newGroup = await createGroup(formData);
      // Update the context immediately so the navbar reflects the new group
      setGroups([...groups, newGroup]);
      setActiveGroup(newGroup);
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
