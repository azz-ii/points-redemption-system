// Shared types for Teams modals

export type { ModalBaseProps } from "@/components/modals";

export interface ApproverDetails {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
}

export interface Team {
  id: number;
  name: string;
  approver: number | null;
  approver_details?: ApproverDetails;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

export interface UserDetails {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
}

export interface TeamMember {
  id: number;
  team: number;
  team_name: string;
  user: number;
  user_details: UserDetails;
  joined_at: string;
}

export interface TeamDetail extends Team {
  members?: TeamMember[];
}

export interface NewTeamData {
  name: string;
  approver: number | null;
}

export interface EditTeamData {
  name: string;
  approver: number | null;
}

export interface ApproverOption {
  id: number;
  full_name: string;
  email: string;
}

// Marketing admin option for team assignment
export interface MarketingAdminOption {
  id: number;
  full_name: string;
  email: string;
}

export interface SalesAgentOption {
  id: number;
  username: string;
  full_name: string;
  email: string;
  points: number;
}

export interface User {
  id: number;
  team: number | null;
}
