"use client";

import SurvivorCard from "@/components/survivor-card";
import type { DraftedSurvivor } from "@/lib/survivor-actions";

interface Props {
  survivors: DraftedSurvivor[];
  gameInProgress: boolean;
}

export default function DraftedView({ survivors, gameInProgress }: Props) {
  const allEliminated = survivors.length > 0 && survivors.every((s) => s.week_eliminated != null);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Survivors</h1>

      {allEliminated && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-semibold text-center">
          You have been eliminated from the game.
        </div>
      )}

      {survivors.length === 0 ? (
        <p className="text-gray-500 text-sm mt-4">
          The draft has not yet started. Check back here once the draft has been completed.
        </p>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-6">
            {gameInProgress
              ? "These are the survivors you drafted. Eliminated survivors are crossed out."
              : "These are the survivors you drafted."}
          </p>
          <div className="space-y-1.5 max-w-lg">
            {survivors.map((survivor) => (
              <SurvivorCard
                key={survivor.id}
                survivor={survivor}
                eliminated={gameInProgress && survivor.week_eliminated != null}
                badge={
                  survivor.is_free_agent_pick ? (
                    <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 font-medium">
                      Free agent
                    </span>
                  ) : undefined
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
