"use client";

import { useEffect, useState } from "react";
import { useGroup } from "@/lib/group-context";
import { getUserRankings, getDraftedSurvivors } from "@/lib/survivor-actions";
import { getFreeAgentEligibility } from "@/lib/free-agent-actions";
import RankingUI from "./ranking-ui";
import DraftedView from "./drafted-view";
import type { RankedSurvivor, DraftedSurvivor } from "@/lib/survivor-actions";
import type { FreeAgentEligibility } from "@/lib/free-agent-actions";
import type { GroupStatus } from "@/lib/types";

type PageState =
  | { mode: "loading" }
  | { mode: "no-group" }
  | { mode: "ranking"; rankings: RankedSurvivor[]; groupId: number }
  | { mode: "draft-pending"; groupId: number }
  | { mode: "drafted"; survivors: DraftedSurvivor[]; status: GroupStatus; groupId: number; eligibility: FreeAgentEligibility };

export default function MySurvivorsPage() {
  const { activeGroup } = useGroup();
  const [state, setState] = useState<PageState>({ mode: "loading" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!activeGroup) {
      setState({ mode: "no-group" });
      return;
    }

    setState({ mode: "loading" });

    const status = activeGroup.status;

    if (status === "signup" || status === "draft_order_posted") {
      // Show the ranking UI
      getUserRankings(activeGroup.group_id).then((rankings) => {
        setState({ mode: "ranking", rankings, groupId: activeGroup.group_id });
      });
    } else if (status === "draft_complete" || status === "in_progress" || status === "complete") {
      // Show drafted survivors + free agent eligibility
      Promise.all([
        getDraftedSurvivors(activeGroup.group_id),
        getFreeAgentEligibility(activeGroup.group_id),
      ]).then(([survivors, eligibility]) => {
        setState({ mode: "drafted", survivors, status, groupId: activeGroup.group_id, eligibility });
      });
    } else {
      setState({ mode: "no-group" });
    }
  }, [activeGroup, refreshKey]);

  if (state.mode === "loading") {
    return (
      <div className="text-center py-20 text-gray-400 text-sm animate-pulse">Loading…</div>
    );
  }

  if (state.mode === "no-group") {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-sm mb-4">
          You&apos;re not in a group yet.
        </p>
        <a href="/groups/new" className="text-blue-600 hover:underline text-sm font-medium">
          Create a group
        </a>
        {" "}or ask your group admin to invite you.
      </div>
    );
  }

  if (state.mode === "draft-pending") {
    return (
      <div className="text-center py-20 text-gray-500 text-sm">
        The draft order has been posted. The draft has not yet started.
      </div>
    );
  }

  if (state.mode === "ranking") {
    return <RankingUI initialRankings={state.rankings} groupId={state.groupId} />;
  }

  if (state.mode === "drafted") {
    return (
      <DraftedView
        survivors={state.survivors}
        gameInProgress={state.status === "in_progress" || state.status === "complete"}
        eligibility={state.eligibility}
        groupId={state.groupId}
        onPickComplete={() => setRefreshKey((k) => k + 1)}
      />
    );
  }
}
