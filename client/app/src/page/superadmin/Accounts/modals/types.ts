export type { ModalBaseProps } from "@/components/modals";

export interface Account {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  is_active?: boolean;
  is_banned: boolean;
  is_archived: boolean;
  date_archived?: string | null;
  archived_by?: number | null;
  archived_by_username?: string | null;
  profile_picture?: string | null;
}

export const POSITION_OPTIONS = [
  { value: "", label: "Select position" },
  { value: "Sales Agent", label: "Sales Agent" },
  { value: "Approver", label: "Approver" },
  { value: "Marketing", label: "Marketing" },
  { value: "Reception", label: "Reception" },
  { value: "Executive Assistant", label: "Executive Assistant" },
];
