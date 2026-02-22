"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGroup } from "@/lib/group-context";
import { signOut, useSession } from "@/lib/auth-client";
import type { GroupMembership } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  signup: "Sign-up",
  draft_order_posted: "Draft Ready",
  draft_complete: "Draft Complete",
  in_progress: "In Progress",
  complete: "Complete",
};

export default function NavBar() {
  const { groups, activeGroup, setActiveGroup } = useGroup();
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  function handleSelectGroup(group: GroupMembership) {
    setActiveGroup(group);
    setProfileOpen(false);
    router.refresh();
  }

  const userName = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";
  const displayName = userName.split(" ")[0] || "Account";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-blue-600 tracking-tight text-lg shrink-0">
          Survivor 50
        </Link>

        {/* Desktop nav links */}
        {activeGroup && (
          <div className="hidden sm:flex items-center gap-5 text-sm font-medium text-gray-600 ml-auto">
            <Link href="/my-survivors" className="hover:text-blue-600 transition">
              My Survivors
            </Link>
            <Link href="/group" className="hover:text-blue-600 transition">
              Group
            </Link>
            <Link href="/draft" className="hover:text-blue-600 transition">
              Draft
            </Link>
            {activeGroup.role === "admin" && (
              <Link
                href={`/groups/${activeGroup.group_id}/invite`}
                className="hover:text-blue-600 transition"
              >
                Invite
              </Link>
            )}
            {activeGroup.role === "admin" && (
              <Link href="/admin/survivors" className="hover:text-blue-600 transition">
                Manage
              </Link>
            )}
          </div>
        )}

        {/* Right side: hamburger (mobile) + profile */}
        <div className={`flex items-center gap-3 ml-5 ${!activeGroup ? "ml-auto" : ""}`}>
          {/* Hamburger — mobile only, only when a group is active */}
          {activeGroup && (
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="sm:hidden p-1 text-gray-600 hover:text-blue-600 transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
            >
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline truncate max-w-[100px]">{displayName}</span>
              <svg
                className="w-3.5 h-3.5 shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-20">
                {/* User info */}
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>

                {/* Groups section */}
                <div className="px-3 pt-2.5 pb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mb-1.5">
                    Groups
                  </p>
                  {groups.length === 0 ? (
                    <p className="text-xs text-gray-400 px-1 py-1">No groups yet.</p>
                  ) : (
                    <ul className="space-y-0.5">
                      {groups.map((g) => (
                        <li key={g.group_id}>
                          <button
                            onClick={() => handleSelectGroup(g)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center justify-between gap-2 transition ${
                              activeGroup?.group_id === g.group_id
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="flex items-center gap-1.5 min-w-0">
                              {activeGroup?.group_id === g.group_id && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                              )}
                              <span className="truncate">{g.group_name}</span>
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                              <span className="text-xs text-gray-400">
                                {STATUS_LABEL[g.status] ?? g.status}
                              </span>
                              {g.role === "admin" && (
                                <span className="text-xs bg-amber-100 text-amber-700 rounded px-1 py-0.5 font-medium">
                                  Admin
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href="/groups/new"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-1.5 w-full px-2 py-1.5 mt-0.5 text-sm text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create new group
                  </Link>
                </div>

                {/* Sign out */}
                <div className="border-t border-gray-100 mt-0.5">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile nav menu */}
      {mobileOpen && activeGroup && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <Link
            href="/my-survivors"
            onClick={() => setMobileOpen(false)}
            className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition"
          >
            My Survivors
          </Link>
          <Link
            href="/group"
            onClick={() => setMobileOpen(false)}
            className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition"
          >
            Group
          </Link>
          <Link
            href="/draft"
            onClick={() => setMobileOpen(false)}
            className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition"
          >
            Draft
          </Link>
          {activeGroup.role === "admin" && (
            <Link
              href={`/groups/${activeGroup.group_id}/invite`}
              onClick={() => setMobileOpen(false)}
              className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition"
            >
              Invite
            </Link>
          )}
          {activeGroup.role === "admin" && (
            <Link
              href="/admin/survivors"
              onClick={() => setMobileOpen(false)}
              className="px-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition"
            >
              Manage
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
