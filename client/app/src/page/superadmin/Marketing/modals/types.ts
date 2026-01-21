export interface Account {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  is_banned: boolean;
}

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
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
  { value: "COLLATERAL", label: "Collateral" },
  { value: "GIVEAWAY", label: "Giveaway" },
  { value: "ASSET", label: "Asset" },
  { value: "BENEFIT", label: "Benefit" },
];
