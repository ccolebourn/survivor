"use client";

import { useEffect, useState } from "react";
import { useGroup } from "@/lib/group-context";
import {
  getGroupStatusData,
  type GroupStatusData,
  type PlayerWithSurvivors,
  type PendingInvitation,
} from "@/lib/group-status-actions";
import SurvivorCard from "@/components/survivor-card";

type PageState =
  | { mode: "loading" }
  | { mode: "no-group" }
  | { mode: "pre-draft"; draftScheduledAt: string | null; groupName: string; players: PlayerWithSurvivors[]; pendingInvitations: PendingInvitation[] }
  | { mode: "post-draft"; data: GroupStatusData };

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

function WinnerBanner({ players }: { players: PlayerWithSurvivors[] }) {
  const winners = players.filter((p) => !p.is_eliminated);
  if (winners.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-6 py-5 text-center">
      <div className="text-3xl mb-2">&#127942;</div>
      <p className="text-lg font-bold text-amber-800">
        {winners.length === 1
          ? `${winners[0].player_name} wins!`
          : `Winners: ${winners.map((w) => w.player_name).join(", ")}`}
      </p>
      <p className="text-sm text-amber-700 mt-1">
        {winners.length === 1
          ? "This player still has survivors in the game."
          : "These players still have survivors in the game."}
      </p>
    </div>
  );
}

function PlayerCard({
  player,
  showElimination,
}: {
  player: PlayerWithSurvivors;
  showElimination: boolean;
}) {
  return (
    <div className="p-4">
      {/* Player header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-bold text-gray-900">{player.player_name}</span>
        {player.role === "admin" && (
          <span className="text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 font-medium">
            Admin
          </span>
        )}
        {showElimination && player.is_eliminated && (
          <span className="text-xs bg-red-100 text-red-700 rounded px-1.5 py-0.5 font-medium">
            Eliminated
          </span>
        )}
      </div>

      {/* Survivors grid */}
      {player.survivors.length === 0 ? (
        <p className="text-sm text-gray-400 italic">(no survivors drafted)</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {player.survivors.map((survivor) => (
            <SurvivorCard
              key={survivor.id}
              survivor={survivor}
              eliminated={showElimination && survivor.week_eliminated != null}
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
      )}
    </div>
  );
}

export default function GroupPage() {
  const { activeGroup } = useGroup();
  const [state, setState] = useState<PageState>({ mode: "loading" });

  useEffect(() => {
    if (!activeGroup) {
      setState({ mode: "no-group" });
      return;
    }

    setState({ mode: "loading" });

    const status = activeGroup.status;

    if (status === "signup" || status === "draft_order_posted") {
      // We can get draft_scheduled_at from the group context if available,
      // but we need to fetch to get it — call the action with the group id.
      getGroupStatusData(activeGroup.group_id).then((data) => {
        setState({
          mode: "pre-draft",
          draftScheduledAt: data?.draft_scheduled_at ?? null,
          groupName: data?.group_name ?? activeGroup.group_name,
          players: data?.players ?? [],
          pendingInvitations: data?.pendingInvitations ?? [],
        });
      });
    } else if (
      status === "draft_complete" ||
      status === "in_progress" ||
      status === "complete"
    ) {
      getGroupStatusData(activeGroup.group_id).then((data) => {
        if (!data) {
          setState({ mode: "no-group" });
          return;
        }
        setState({ mode: "post-draft", data });
      });
    } else {
      setState({ mode: "no-group" });
    }
  }, [activeGroup]);

  // --- Loading ---
  if (state.mode === "loading") {
    return (
      <div className="text-center py-20 text-gray-400 text-sm animate-pulse">
        Loading&hellip;
      </div>
    );
  }

  // --- No group ---
  if (state.mode === "no-group") {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-sm mb-4">You&apos;re not in a group yet.</p>
        <a href="/groups/new" className="text-blue-600 hover:underline text-sm font-medium">
          Create a group
        </a>{" "}
        or ask your group admin to invite you.
      </div>
    );
  }

  // --- Pre-draft ---
  if (state.mode === "pre-draft") {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-1">Group: {state.groupName}</h1>
        <p className="text-gray-500 text-sm mb-6">
          {state.draftScheduledAt
            ? <>Draft scheduled for: <span className="font-medium text-gray-700">{formatDraftDate(state.draftScheduledAt)}</span></>
            : "The draft hasn't been scheduled yet."}
        </p>

        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Rankings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {state.players.map((player) => (
                <tr key={player.player_id}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <span>{player.player_name}</span>
                    {player.role === "admin" && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 font-medium">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {player.has_ranked ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Ranked
                      </span>
                    ) : (
                      <span className="text-amber-500 font-medium">Not yet</span>
                    )}
                  </td>
                </tr>
              ))}
              {state.pendingInvitations.map((invite) => (
                <tr key={invite.id} className="bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-500">{invite.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Invite pending
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- Post-draft ---
  const { data } = state;
  const showElimination = data.status === "in_progress" || data.status === "complete";
  const isComplete = data.status === "complete";

  // Sort: active players first, eliminated last
  const sortedPlayers = [...data.players].sort((a, b) => {
    if (a.is_eliminated === b.is_eliminated) {
      return a.player_name.localeCompare(b.player_name);
    }
    return a.is_eliminated ? 1 : -1;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Group: {data.group_name}</h1>

      {isComplete && <WinnerBanner players={data.players} />}

      <div className="space-y-4">
        {sortedPlayers.map((player) => (
          <PlayerCard
            key={player.player_id}
            player={player}
            showElimination={showElimination}
          />
        ))}
      </div>
    </div>
  );
}
