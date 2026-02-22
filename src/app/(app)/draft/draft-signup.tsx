"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postDraftOrder } from "@/lib/draft-actions";
import type { DraftState } from "@/lib/draft-actions";

function formatDraftDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

interface Props {
  state: DraftState;
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function DraftSignup({ state, isAdmin, onRefresh }: Props) {
  const router = useRouter();
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePostDraftOrder() {
    setPosting(true);
    setError(null);
    try {
      await postDraftOrder(state.group_id);
      router.refresh();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post draft order.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Draft</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-lg">
        <p className="text-gray-600 mb-3">The draft order hasn&apos;t been posted yet.</p>

        {state.draft_scheduled_at && (
          <p className="text-sm text-gray-500 mb-4">
            Draft scheduled for:{" "}
            <span className="font-medium text-gray-700">
              {formatDraftDate(state.draft_scheduled_at)}
            </span>
          </p>
        )}

        {isAdmin && (
          <div className="mt-4">
            {error && (
              <p className="text-sm text-red-600 mb-3">{error}</p>
            )}
            <button
              onClick={handlePostDraftOrder}
              disabled={posting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {posting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting&hellip;
                </>
              ) : (
                "Post Draft Order"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
