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
  legend: "GIVEAWAY" | "MERCH" | "PROMO" | "AD_MATERIALS" | "POINT_OF_SALE" | "OTHERS";
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
    case "GIVEAWAY":
      return "bg-blue-500 text-white";
    case "MERCH":
      return "bg-purple-500 text-white";
    case "PROMO":
      return "bg-orange-500 text-white";
    case "AD_MATERIALS":
      return "bg-red-500 text-white";
    case "POINT_OF_SALE":
      return "bg-yellow-500 text-black";
    case "OTHERS":
      return "bg-gray-500 text-white";
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
