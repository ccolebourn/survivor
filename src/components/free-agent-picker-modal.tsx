"use client";

import { useEffect, useRef, useState } from "react";
import SurvivorCard from "@/components/survivor-card";
import type { Survivor } from "@/lib/types";

interface Props {
  undraftedSurvivors: Survivor[];
  onPick: (survivorId: number) => Promise<void>;
  onClose: () => void;
  playerName?: string;
}

export default function FreeAgentPickerModal({
  undraftedSurvivors,
  onPick,
  onClose,
  playerName,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => dialogRef.current?.close();
  }, []);

  async function handlePick(survivorId: number) {
    setPicking(true);
    setError(null);
    try {
      await onPick(survivorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim survivor");
      setPicking(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-2xl shadow-xl p-0 w-full max-w-md backdrop:bg-black/40"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {playerName ? `Free Agent Pick for ${playerName}` : "Pick a Free Agent"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Select an available survivor to add to {playerName ? "their" : "your"} roster.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="max-h-80 overflow-y-auto -mx-2 px-2 space-y-1">
          {undraftedSurvivors.map((survivor) => (
            <div
              key={survivor.id}
              className="rounded-lg border border-gray-100 hover:border-blue-300 transition"
            >
              <SurvivorCard
                survivor={survivor}
                onClick={picking ? undefined : () => handlePick(survivor.id)}
                dimmed={picking}
              />
            </div>
          ))}
        </div>

        {picking && (
          <div className="mt-4 text-center text-sm text-gray-400 animate-pulse">
            Claiming survivor&hellip;
          </div>
        )}
      </div>
    </dialog>
  );
}
