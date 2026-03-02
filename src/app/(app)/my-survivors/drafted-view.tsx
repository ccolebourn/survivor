"use client";

import { useState } from "react";
import SurvivorCard from "@/components/survivor-card";
import FreeAgentPickerModal from "@/components/free-agent-picker-modal";
import { claimFreeAgent } from "@/lib/free-agent-actions";
import type { DraftedSurvivor } from "@/lib/survivor-actions";
import type { FreeAgentEligibility } from "@/lib/free-agent-actions";

interface Props {
  survivors: DraftedSurvivor[];
  gameInProgress: boolean;
  eligibility: FreeAgentEligibility;
  groupId: number;
  onPickComplete: () => void;
}

export default function DraftedView({ survivors, gameInProgress, eligibility, groupId, onPickComplete }: Props) {
  const allEliminated = survivors.length > 0 && survivors.every((s) => s.week_eliminated != null);
  const [showModal, setShowModal] = useState(false);

  async function handlePick(survivorId: number) {
    const result = await claimFreeAgent(groupId, survivorId);
    if (!result.success) {
      throw new Error(result.error ?? "Failed to claim survivor");
    }
    setShowModal(false);
    onPickComplete();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Survivors</h1>

      {allEliminated && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 font-semibold text-center">
          You have been eliminated from the game.
        </div>
      )}

      {eligibility.eligible && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-800">Free Agent Pick Available</p>
            <p className="text-sm text-amber-700">
              You have {eligibility.availablePicks} pick{eligibility.availablePicks !== 1 ? "s" : ""} available.
              Choose from {eligibility.undraftedSurvivors.length} undrafted survivor{eligibility.undraftedSurvivors.length !== 1 ? "s" : ""}.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 ml-4 rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700 transition"
          >
            Pick a Free Agent
          </button>
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

      {showModal && (
        <FreeAgentPickerModal
          undraftedSurvivors={eligibility.undraftedSurvivors}
          onPick={handlePick}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
