export type { ModalBaseProps } from "@/components/modals";

export interface Account {
  id: number;
  username?: string | null;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  is_banned: boolean;
}

export interface ProductAssignment {
  id: number;
  item_code: string;
  item_name: string;
  legend: string;
  category: string;
  mktg_admin_id: number | null;
  mktg_admin_username: string | null;
}

export interface LegendAssignment {
  legend: string;
  mktg_admin_id: number | null;
  mktg_admin_username: string;
  item_count: number;
}

export interface LegendTotal {
  legend: string;
  total: number;
  assigned: number;
}

export const LEGEND_OPTIONS = [
  { value: "Collateral", label: "Collateral" },
  { value: "Giveaway", label: "Giveaway" },
  { value: "Asset", label: "Asset" },
  { value: "Benefit", label: "Benefit" },
];
