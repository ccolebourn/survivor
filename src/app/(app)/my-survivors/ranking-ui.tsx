"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import SurvivorCard from "@/components/survivor-card";
import { saveRankings } from "@/lib/survivor-actions";
import type { RankedSurvivor } from "@/lib/survivor-actions";
import type { Survivor } from "@/lib/types";

interface Props {
  initialRankings: RankedSurvivor[];
  groupId: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RankingUI({ initialRankings, groupId }: Props) {
  // Split into ranked (ordered) and unranked
  const [ranked, setRanked] = useState<Survivor[]>(
    initialRankings.filter((s) => s.rank != null).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  );
  const [unranked, setUnranked] = useState<Survivor[]>(
    initialRankings.filter((s) => s.rank == null)
  );

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with 800ms debounce whenever ranked list changes
  const triggerSave = useCallback(
    (rankedList: Survivor[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveStatus("saving");
      saveTimer.current = setTimeout(async () => {
        try {
          await saveRankings(
            groupId,
            rankedList.map((s, i) => ({ survivor_id: s.id, rank: i + 1 }))
          );
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      }, 800);
    },
    [groupId]
  );

  // Keep save timer clean on unmount
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  function addToRanked(survivor: Survivor) {
    const newRanked = [...ranked, survivor];
    const newUnranked = unranked.filter((s) => s.id !== survivor.id);
    setRanked(newRanked);
    setUnranked(newUnranked);
    triggerSave(newRanked);
  }

  function removeFromRanked(survivor: Survivor) {
    const newRanked = ranked.filter((s) => s.id !== survivor.id);
    setRanked(newRanked);
    setUnranked([...unranked, survivor]);
    triggerSave(newRanked);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const newRanked = [...ranked];
    [newRanked[index - 1], newRanked[index]] = [newRanked[index], newRanked[index - 1]];
    setRanked(newRanked);
    triggerSave(newRanked);
  }

  function moveDown(index: number) {
    if (index === ranked.length - 1) return;
    const newRanked = [...ranked];
    [newRanked[index], newRanked[index + 1]] = [newRanked[index + 1], newRanked[index]];
    setRanked(newRanked);
    triggerSave(newRanked);
  }

  function randomizeUnranked() {
    const shuffled = shuffleArray(unranked);
    const newRanked = [...ranked, ...shuffled];
    setRanked(newRanked);
    setUnranked([]);
    triggerSave(newRanked);
  }

  const totalSurvivors = ranked.length + unranked.length;
  const allRanked = totalSurvivors > 0 && unranked.length === 0;

  if (totalSurvivors === 0) {
    return (
      <div className="text-center py-20 text-gray-400 text-sm">
        No survivors found. Make sure the season data has been loaded.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">My Survivors</h1>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          saveStatus === "saved" ? "bg-green-100 text-green-700" :
          saveStatus === "saving" ? "bg-gray-100 text-gray-500" :
          saveStatus === "error" ? "bg-red-100 text-red-600" : "invisible"
        }`}>
          {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Error saving"}
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        Rank all 24 survivors in the order you want them drafted. Your top pick is #1.
        Click an unranked survivor to add them to your list, then use the arrows to reorder.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Ranked list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-700">
              Your Rankings{" "}
              <span className="text-gray-400 font-normal text-sm">({ranked.length}/24)</span>
            </h2>
            {allRanked && (
              <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">
                All ranked!
              </span>
            )}
          </div>

          {ranked.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
              Click survivors on the right to start ranking them.
            </div>
          ) : (
            <div className="space-y-1.5">
              {ranked.map((survivor, index) => (
                <SurvivorCard
                  key={survivor.id}
                  survivor={survivor}
                  rank={index + 1}
                  badge={
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-20 transition"
                        aria-label="Move up"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === ranked.length - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-20 transition"
                        aria-label="Move down"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeFromRanked(survivor)}
                        className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition"
                        aria-label="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Unranked */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-700">
              Unranked{" "}
              <span className="text-gray-400 font-normal text-sm">({unranked.length})</span>
            </h2>
            {unranked.length > 0 && (
              <button
                onClick={randomizeUnranked}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition"
              >
                Randomize all unranked
              </button>
            )}
          </div>

          {allRanked ? (
            <div className="rounded-xl border-2 border-dashed border-green-200 bg-green-50 p-8 text-center text-green-600 text-sm font-medium">
              All survivors ranked!
            </div>
          ) : (
            <div className="space-y-1.5">
              {unranked.map((survivor) => (
                <SurvivorCard
                  key={survivor.id}
                  survivor={survivor}
                  onClick={() => addToRanked(survivor)}
                  badge={
                    <span className="text-xs text-blue-500 font-medium whitespace-nowrap">
                      + Add
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
