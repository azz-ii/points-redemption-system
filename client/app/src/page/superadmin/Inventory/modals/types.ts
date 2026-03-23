export type { ModalBaseProps } from "@/components/modals";

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryItem {
  id: number;
  item_code: string;
  item_name: string;
  category: string;
  points: string;
  price: string;
  stock: number;
  committed_stock: number;
  available_stock: number;
  has_stock: boolean;
  legend: "Collateral" | "Giveaway" | "Asset" | "Benefit";
  stock_status: StockStatus;
}

export const getStatusColor = (status: StockStatus): string => {
  switch (status) {
    case "In Stock":
      return "bg-success/15 text-[color-mix(in_srgb,var(--color-success)_70%,black)] dark:text-success";
    case "Low Stock":
      return "bg-warning/15 text-[color-mix(in_srgb,var(--color-warning)_70%,black)] dark:text-warning";
    case "Out of Stock":
      return "bg-destructive/15 text-[color-mix(in_srgb,var(--color-destructive)_70%,black)] dark:text-destructive";
    default:
      return "bg-slate-500/15 text-[color-mix(in_srgb,var(--color-slate-500)_70%,black)] dark:text-slate-300";
  }
};

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

export const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "In Stock", label: "In Stock" },
  { value: "Low Stock", label: "Low Stock" },
  { value: "Out of Stock", label: "Out of Stock" },
] as const;
