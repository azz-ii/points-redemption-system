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
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    case "Low Stock":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "Out of Stock":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

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

export const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "In Stock", label: "In Stock" },
  { value: "Low Stock", label: "Low Stock" },
  { value: "Out of Stock", label: "Out of Stock" },
] as const;
