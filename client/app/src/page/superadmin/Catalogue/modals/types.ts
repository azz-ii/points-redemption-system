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
  legend: "GIVEAWAY" | "MERCH" | "PROMO" | "AD_MATERIALS" | "POINT_OF_SALE" | "ASSET" | "OTHERS";
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
}

export const LEGEND_OPTIONS = [
  { value: "GIVEAWAY", label: "Giveaway" },
  { value: "MERCH", label: "Merch" },
  { value: "PROMO", label: "Promo" },
  { value: "AD_MATERIALS", label: "Ad Materials" },
  { value: "POINT_OF_SALE", label: "Point of Sale" },
  { value: "ASSET", label: "Asset" },
  { value: "OTHERS", label: "Others" },
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
    case "ASSET":
      return "bg-green-500 text-white";
    case "OTHERS":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

// Backward compatibility aliases
export type CatalogueItem = Product;
export type Variant = Product;
export type CatalogueVariant = Product;
