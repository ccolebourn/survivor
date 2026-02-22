"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGroup } from "@/lib/group-context";
import type { GroupMembership } from "@/lib/types";

interface Props {
  onClose: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  signup: "Sign-up",
  draft_order_posted: "Draft Order Posted",
  draft_complete: "Draft Complete",
  in_progress: "In Progress",
  complete: "Complete",
};

export default function GroupSelectorModal({ onClose }: Props) {
  const { groups, activeGroup, setActiveGroup } = useGroup();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
    return () => dialogRef.current?.close();
  }, []);

  function handleSelect(group: GroupMembership) {
    setActiveGroup(group);
    onClose();
    router.refresh();
  }

  function handleCreateGroup() {
    onClose();
    router.push("/groups/new");
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-2xl shadow-xl p-0 w-full max-w-sm backdrop:bg-black/40"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Groups</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-gray-500 mb-4">You have no groups yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 mb-4">
            {groups.map((g) => (
              <li key={g.group_id}>
                <button
                  onClick={() => handleSelect(g)}
                  className={`w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-between gap-2 ${
                    activeGroup?.group_id === g.group_id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-800"
                  }`}
                >
                  <span className="font-medium">{g.group_name}</span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {STATUS_LABEL[g.status] ?? g.status}
                    {g.role === "admin" && (
                      <span className="ml-2 bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">
                        Admin
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleCreateGroup}
          className="w-full rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 py-2 text-sm font-medium transition"
        >
          + Create Group
        </button>
      </div>
    </dialog>
  );
}
