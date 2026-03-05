export type { ModalBaseProps } from "@/components/modals";

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
}

export interface Product {
  id: number;
  item_code: string;
  item_name: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: "Collateral" | "Giveaway" | "Asset" | "Benefit";
  category: string;
  points: string;
  price: string;
  pricing_type: "FIXED" | "PER_SQFT" | "PER_INVOICE" | "PER_DAY" | "PER_EU_SRP";
  min_order_qty: number;
  max_order_qty: number | null;
  has_stock: boolean;
  stock: number;
  committed_stock: number;
  available_stock: number;
  image: string | null;
  is_archived: boolean;
  date_added: string;
  added_by: number | null;
  date_archived: string | null;
  archived_by: number | null;
  requires_sales_approval?: boolean;
  mktg_admin: number | null;
  mktg_admin_username: string | null;
}

export const LEGEND_OPTIONS = [
  { value: "Collateral", label: "Collateral" },
  { value: "Giveaway", label: "Giveaway" },
  { value: "Asset", label: "Asset" },
  { value: "Benefit", label: "Benefit" },
] as const;

export const PRICING_TYPE_OPTIONS = [
  { value: "FIXED", label: "Fixed (Quantity-based)", description: "Standard quantity × points" },
  { value: "PER_SQFT", label: "Per Square Foot", description: "Square footage × multiplier" },
  { value: "PER_INVOICE", label: "Per Invoice Amount", description: "Invoice amount × multiplier" },
  { value: "PER_DAY", label: "Per Day", description: "Number of days × multiplier" },
  { value: "PER_EU_SRP", label: "Per EU SRP", description: "EU SRP value × multiplier" },
] as const;

export const getLegendColor = (legend: string): string => {
  switch (legend) {
    case "Collateral":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    case "Giveaway":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    case "Asset":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "Benefit":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

// Backward compatibility aliases
export type CatalogueItem = Product;
export type Variant = Product;
export type CatalogueVariant = Product;
