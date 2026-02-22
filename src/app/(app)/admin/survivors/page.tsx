"use client";

import { useEffect, useState } from "react";
import SurvivorCard from "@/components/survivor-card";
import {
  getSurvivors,
  eliminateSurvivor,
  reinstateSurvivor,
} from "@/lib/admin-actions";
import type { Survivor } from "@/lib/types";

export default function AdminSurvivorsPage() {
  const [survivors, setSurvivors] = useState<Survivor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track which survivor has the eliminate form open
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [weekInput, setWeekInput] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    try {
      const data = await getSurvivors();
      setSurvivors(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load survivors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleEliminate(survivorId: number) {
    const week = parseInt(weekInput, 10);
    if (!weekInput || isNaN(week) || week < 1 || week > 50) {
      setError("Please enter a valid week number between 1 and 50.");
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await eliminateSurvivor(survivorId, week);
      setExpandedId(null);
      setWeekInput("");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to eliminate survivor");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReinstate(survivorId: number) {
    setActionLoading(true);
    setError(null);
    try {
      await reinstateSurvivor(survivorId);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to reinstate survivor");
    } finally {
      setActionLoading(false);
    }
  }

  function toggleExpand(survivorId: number) {
    if (expandedId === survivorId) {
      setExpandedId(null);
      setWeekInput("");
    } else {
      setExpandedId(survivorId);
      setWeekInput("");
      setError(null);
    }
  }

  const active = survivors.filter((s) => s.week_eliminated == null);
  const eliminated = survivors.filter((s) => s.week_eliminated != null);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-gray-500 text-sm">
        Loading survivors...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Survivors</h1>
        <p className="text-sm text-gray-500 mt-1">
          Mark survivors as eliminated each week.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Active Survivors */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-700">
          Active Survivors{" "}
          <span className="text-gray-400 font-normal">({active.length})</span>
        </h2>
        {active.length === 0 && (
          <p className="text-sm text-gray-400">No active survivors.</p>
        )}
        <div className="space-y-2">
          {active.map((survivor) => (
            <div
              key={survivor.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <SurvivorCard survivor={survivor} />
                </div>
                <button
                  onClick={() => toggleExpand(survivor.id)}
                  disabled={actionLoading}
                  className="shrink-0 text-sm font-medium px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                >
                  {expandedId === survivor.id ? "Cancel" : "Eliminate"}
                </button>
              </div>

              {expandedId === survivor.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-3">
                  <label className="text-sm text-gray-600 shrink-0">
                    Week eliminated:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={weekInput}
                    onChange={(e) => setWeekInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEliminate(survivor.id);
                    }}
                    placeholder="1–50"
                    className="w-20 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                    autoFocus
                  />
                  <button
                    onClick={() => handleEliminate(survivor.id)}
                    disabled={actionLoading}
                    className="text-sm font-medium px-4 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {actionLoading ? "Saving..." : "Confirm"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Eliminated Survivors */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-gray-700">
          Eliminated Survivors{" "}
          <span className="text-gray-400 font-normal">({eliminated.length})</span>
        </h2>
        {eliminated.length === 0 && (
          <p className="text-sm text-gray-400">No eliminated survivors yet.</p>
        )}
        <div className="space-y-2">
          {eliminated.map((survivor) => (
            <div
              key={survivor.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <SurvivorCard
                    survivor={survivor}
                    eliminated={true}
                    badge={
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Week {survivor.week_eliminated}
                      </span>
                    }
                  />
                </div>
                <button
                  onClick={() => handleReinstate(survivor.id)}
                  disabled={actionLoading}
                  className="shrink-0 text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Reinstate
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
