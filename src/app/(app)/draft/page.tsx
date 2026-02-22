"use client";

import { useEffect, useState, useCallback } from "react";
import { useGroup } from "@/lib/group-context";
import { getDraftState, type DraftState } from "@/lib/draft-actions";
import DraftSignup from "./draft-signup";
import DraftOrderPosted from "./draft-order-posted";
import DraftResults from "./draft-results";

type PageState =
  | { mode: "loading" }
  | { mode: "no-group" }
  | { mode: "error"; message: string }
  | { mode: "ready"; data: DraftState };

export default function DraftPage() {
  const { activeGroup } = useGroup();
  const [pageState, setPageState] = useState<PageState>({ mode: "loading" });

  const fetchState = useCallback(async (groupId: number) => {
    setPageState({ mode: "loading" });
    try {
      const data = await getDraftState(groupId);
      setPageState({ mode: "ready", data });
    } catch (err) {
      setPageState({
        mode: "error",
        message: err instanceof Error ? err.message : "Failed to load draft state.",
      });
    }
  }, []);

  useEffect(() => {
    if (!activeGroup) {
      setPageState({ mode: "no-group" });
      return;
    }
    fetchState(activeGroup.group_id);
  }, [activeGroup, fetchState]);

  const handleRefresh = useCallback(() => {
    if (activeGroup) {
      fetchState(activeGroup.group_id);
    }
  }, [activeGroup, fetchState]);

  // --- Loading ---
  if (pageState.mode === "loading") {
    return (
      <div className="text-center py-20 text-gray-400 text-sm animate-pulse">
        Loading&hellip;
      </div>
    );
  }

  // --- No group ---
  if (pageState.mode === "no-group") {
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

  // --- Error ---
  if (pageState.mode === "error") {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-sm">{pageState.message}</p>
      </div>
    );
  }

  // --- Ready ---
  const { data } = pageState;
  const isAdmin = activeGroup?.role === "admin";

  if (data.status === "signup") {
    return (
      <DraftSignup
        state={data}
        isAdmin={isAdmin}
        onRefresh={handleRefresh}
      />
    );
  }

  if (data.status === "draft_order_posted") {
    return (
      <DraftOrderPosted
        state={data}
        isAdmin={isAdmin}
        onRefresh={handleRefresh}
      />
    );
  }

  // draft_complete | in_progress | complete
  return <DraftResults state={data} />;
}
