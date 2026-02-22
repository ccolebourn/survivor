"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { GroupMembership } from "@/lib/types";

const STORAGE_KEY = "survivor50_active_group";

interface GroupContextValue {
  groups: GroupMembership[];
  activeGroup: GroupMembership | null;
  setActiveGroup: (group: GroupMembership) => void;
  setGroups: (groups: GroupMembership[]) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

export function GroupProvider({
  children,
  initialGroups,
}: {
  children: ReactNode;
  initialGroups: GroupMembership[];
}) {
  const [groups, setGroups] = useState<GroupMembership[]>(initialGroups);
  const [activeGroup, setActiveGroupState] = useState<GroupMembership | null>(null);

  // On mount, restore the last active group from localStorage (or default to first).
  useEffect(() => {
    if (groups.length === 0) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    const found = stored
      ? groups.find((g) => g.group_id === Number(stored)) ?? groups[0]
      : groups[0];

    setActiveGroupState(found);
  }, [groups]);

  const setActiveGroup = useCallback((group: GroupMembership) => {
    setActiveGroupState(group);
    localStorage.setItem(STORAGE_KEY, String(group.group_id));
  }, []);

  return (
    <GroupContext.Provider value={{ groups, activeGroup, setActiveGroup, setGroups }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroup must be used inside <GroupProvider>");
  return ctx;
}
