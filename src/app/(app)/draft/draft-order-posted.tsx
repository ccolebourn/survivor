"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runDraft } from "@/lib/draft-actions";
import type { DraftState } from "@/lib/draft-actions";

interface Props {
  state: DraftState;
  isAdmin: boolean;
  onRefresh: () => void;
}

export default function DraftOrderPosted({ state, isAdmin, onRefresh }: Props) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleRunDraft() {
    setRunning(true);
    setError(null);
    setConfirming(false);
    try {
      await runDraft(state.group_id);
      router.refresh();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run the draft.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Draft Order</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-lg">
        <ol className="space-y-2 mb-6">
          {state.draftOrder.map((entry) => (
            <li key={entry.player_id} className="flex items-center gap-3">
              <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                {entry.rank}
              </span>
              <span className="text-sm font-medium text-gray-800">{entry.player_name}</span>
            </li>
          ))}
        </ol>

        {isAdmin && (
          <div className="border-t border-gray-100 pt-4">
            {!confirming && !running && (
              <button
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
              >
                Run Draft
              </button>
            )}

            {confirming && !running && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800 mb-3 font-medium">
                  This will assign survivors to all players based on their rankings. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunDraft}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
                  >
                    Yes, Run Draft
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {running && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Running draft&hellip;
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
