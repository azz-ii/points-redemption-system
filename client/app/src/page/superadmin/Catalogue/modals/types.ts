export type { ModalBaseProps } from "@/components/modals";

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
}

export interface ProductExtraField {
  id?: number;
  field_key: string;
  label: string;
  field_type: "TEXT" | "NUMBER" | "CHOICE";
  choices_json?: string[] | null;
  is_required: boolean;
  display_order: number;
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
  pricing_formula?: "NONE" | "DRIVER_MULTIPLIER" | "AREA_RATE" | "PER_SQFT" | "PER_INVOICE" | "PER_DAY" | null;
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
  points_multiplier?: number | string | null;
  extra_fields?: ProductExtraField[];
}

export const LEGEND_OPTIONS = [
  { value: "Collateral", label: "Collateral" },
  { value: "Giveaway", label: "Giveaway" },
  { value: "Asset", label: "Asset" },
  { value: "Benefit", label: "Benefit" },
] as const;

export const FIELD_TYPE_OPTIONS = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "CHOICE", label: "Choice (Dropdown)" },
] as const;

export const PRICING_FORMULA_OPTIONS = [
  { value: "NONE", label: "None (use standard pricing)" },
  { value: "PER_SQFT", label: "Per Square Foot (sqft × multiplier)" },
  { value: "PER_INVOICE", label: "Per Invoice Amount (amount × multiplier)" },
  { value: "PER_DAY", label: "Per Day (days × multiplier)" },
  { value: "DRIVER_MULTIPLIER", label: "Driver Multiplier (2x if with driver)" },
  { value: "AREA_RATE", label: "Area Rate (L × W × H × rate)" },
] as const;

export const getLegendColor = (legend: string): string => {
  switch (legend) {
    case "Collateral":
      return "bg-red-500/15 text-[color-mix(in_srgb,var(--color-red-500)_70%,black)] dark:text-red-300";
    case "Giveaway":
      return "bg-blue-500/15 text-[color-mix(in_srgb,var(--color-blue-500)_70%,black)] dark:text-blue-300";
    case "Asset":
      return "bg-amber-500/15 text-[color-mix(in_srgb,var(--color-amber-500)_70%,black)] dark:text-amber-300";
    case "Benefit":
      return "bg-emerald-500/15 text-[color-mix(in_srgb,var(--color-emerald-500)_70%,black)] dark:text-emerald-300";
    default:
      return "bg-slate-500/15 text-[color-mix(in_srgb,var(--color-slate-500)_70%,black)] dark:text-slate-300";
  }
};

// Backward compatibility aliases
export type CatalogueItem = Product;
export type Variant = Product;
export type CatalogueVariant = Product;
