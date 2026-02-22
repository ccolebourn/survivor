"use client";

import SurvivorCard from "@/components/survivor-card";
import type { DraftState } from "@/lib/draft-actions";

interface Props {
  state: DraftState;
}

export default function DraftResults({ state }: Props) {
  // Group picks by round
  const rounds = new Map<number, typeof state.picks>();
  for (const pick of state.picks) {
    if (!rounds.has(pick.round)) {
      rounds.set(pick.round, []);
    }
    rounds.get(pick.round)!.push(pick);
  }

  const sortedRounds = Array.from(rounds.entries()).sort(([a], [b]) => a - b);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Draft Results</h1>

      {sortedRounds.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 text-sm">
          No picks found.
        </div>
      ) : (
        <div className="space-y-6">
          {sortedRounds.map(([roundNum, picks]) => {
            const isForward = roundNum % 2 === 1;
            // Ensure picks are in the correct display order for this round
            const orderedPicks = [...picks].sort((a, b) => a.rank_in_round - b.rank_in_round);

            return (
              <div key={roundNum} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Round header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <span className="text-sm font-semibold text-gray-700">Round {roundNum}</span>
                  <span
                    className="text-xs text-gray-400 font-medium"
                    title={isForward ? "Picks go in forward order (rank 1 → N)" : "Picks go in reverse order (rank N → 1)"}
                  >
                    {isForward ? "↓" : "↑"}
                  </span>
                </div>

                {/* Picks */}
                <div className="divide-y divide-gray-50">
                  {orderedPicks.map((pick) => (
                    <div key={`${pick.player_id}-${pick.survivor.id}`} className="flex items-center gap-3 px-4 py-3">
                      {/* Pick number within round */}
                      <span className="shrink-0 w-6 h-6 flex items-center justify-center text-xs text-gray-400 font-medium">
                        {pick.rank_in_round}
                      </span>

                      {/* Player name */}
                      <span className="w-32 shrink-0 text-sm font-medium text-gray-700 truncate">
                        {pick.player_name}
                      </span>

                      {/* Survivor card */}
                      <div className="flex-1 min-w-0">
                        <SurvivorCard
                          survivor={pick.survivor}
                          eliminated={!!pick.survivor.week_eliminated}
                          badge={
                            pick.is_random_pick ? (
                              <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 font-medium">
                                random
                              </span>
                            ) : undefined
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
