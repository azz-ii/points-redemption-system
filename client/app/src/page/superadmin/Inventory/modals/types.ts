export type { ModalBaseProps } from "@/components/modals";

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface InventoryItem {
  id: number;
  catalogue_item_id: number;
  item_name: string;
  item_code: string;
  option_description: string | null;
  points: string;
  price: string;
  image_url: string | null;
  stock: number;
  committed_stock: number;
  available_stock: number;
  reorder_level: number;
  legend: "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT";
  stock_status: StockStatus;
}

export const getStatusColor = (status: StockStatus): string => {
  switch (status) {
    case "In Stock":
      return "bg-green-500 text-white";
    case "Low Stock":
      return "bg-yellow-400 text-black";
    case "Out of Stock":
      return "bg-red-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

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

export const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "In Stock", label: "In Stock" },
  { value: "Low Stock", label: "Low Stock" },
  { value: "Out of Stock", label: "Out of Stock" },
] as const;
