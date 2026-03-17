export type { ModalBaseProps } from "@/components/modals";

export interface Account {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  uses_points: boolean;
  is_activated: boolean;
  is_active?: boolean;
  is_archived: boolean;
  date_archived?: string | null;
  archived_by?: number | null;
  archived_by_username?: string | null;
  is_locked?: boolean;
  team_id?: number | null;
  team_name?: string | null;
  approver_teams?: { id: number; name: string }[];
  can_self_request?: boolean;
}

export interface TeamOption {
  id: number;
  name: string;
}

export const POSITION_OPTIONS = [
  { value: "", label: "Select position" },
  { value: "Sales Agent", label: "Sales Agent" },
  { value: "Approver", label: "Approver" },
  { value: "Handler", label: "Handler" },
];
