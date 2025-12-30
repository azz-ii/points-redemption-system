// Shared types for Teams modals

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  region: string;
  member_count?: number;
  distributor_count?: number;
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
  distributors?: DistributorOption[];
}

export interface NewTeamData {
  name: string;
  approver: number | null;
  region: string;
}

export interface EditTeamData {
  name: string;
  approver: number | null;
  region: string;
}

export interface ApproverOption {
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

export interface DistributorOption {
  id: number;
  name: string;
  contact_email: string;
  phone: string;
  location: string;
  region: string;
  points?: number;
  team?: number | null;
}

export interface User {
  id: number;
  team: number | null;
}
