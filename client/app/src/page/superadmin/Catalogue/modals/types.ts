export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
}

export interface CatalogueItem {
  id: number;
  reward: string | null;
  item_name: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT";
  needs_driver: boolean;
  date_added: string;
  added_by: number | null;
  mktg_admin: number | null;
  mktg_admin_name: string | null;
  approver: number | null;
  approver_name: string | null;
  is_archived: boolean;
  date_archived: string | null;
  archived_by: number | null;
}

export interface Variant {
  id: number;
  catalogue_item: CatalogueItem;
  item_code: string;
  option_description: string | null;
  points: string;
  price: string;
  image_url: string | null;
  stock: number;
  reorder_level: number;
}

export interface CatalogueVariant {
  id: string;
  catalogue_item_id: number;
  reward: string | null;
  item_name: string;
  item_code: string;
  description: string;
  purpose: string;
  specifications: string;
  option_description: string | null;
  points: string;
  price: string;
  legend: "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT";
  needs_driver: boolean;
  image_url: string | null;
  is_archived: boolean;
  date_added: string;
  mktg_admin: number | null;
  mktg_admin_name: string | null;
  approver: number | null;
  approver_name: string | null;
}

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LEGEND_OPTIONS = [
  { value: "COLLATERAL", label: "Collateral (Red)" },
  { value: "GIVEAWAY", label: "Giveaway (Blue)" },
  { value: "ASSET", label: "Asset (Yellow)" },
  { value: "BENEFIT", label: "Benefit (Green)" },
] as const;

export const getLegendColor = (legend: string): string => {
  switch (legend) {
    case "COLLATERAL":
      return "bg-red-500 text-white";
    case "GIVEAWAY":
      return "bg-blue-500 text-white";
    case "ASSET":
      return "bg-yellow-500 text-black";
    case "BENEFIT":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};
