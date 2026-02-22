// Shared TypeScript types for the application

export type GroupStatus =
  | "signup"
  | "draft_order_posted"
  | "draft_complete"
  | "in_progress"
  | "complete";

export type MemberRole = "player" | "admin";

export interface Group {
  id: number;
  name: string;
  admin_user_id: string;
  status: GroupStatus;
  draft_scheduled_at: string | null;
  created_at: string;
}

export interface GroupMembership {
  group_id: number;
  group_name: string;
  role: MemberRole;
  status: GroupStatus;
}

export interface Survivor {
  id: number;
  season: number;
  name: string;
  age: number | null;
  home_town: string | null;
  previous_seasons: string | null;
  image_path: string | null;
  week_eliminated: number | null;
  eliminated_at: string | null;
}
