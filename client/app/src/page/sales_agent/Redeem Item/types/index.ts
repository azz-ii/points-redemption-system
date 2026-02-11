import type { RedeemItemData } from "@/lib/api";

// Re-export RedeemItemData as RedeemItem for consistency
export type RedeemItem = RedeemItemData;

// Page Navigation
export type SalesPages = "dashboard" | "redemption-status" | "redeem-items";

// Component Props Types
export interface RedeemItemHeaderProps {
  userPoints: number;
  userLoading: boolean;
  cartItemsCount: number;
  onCartClick: () => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface CategoryFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export interface ItemsGridProps {
  items: RedeemItem[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  activeCategory: string;
  onAddToCart: (item: RedeemItem) => void;
  onRetry?: () => void;
}

export interface ItemCardProps {
  item: RedeemItem;
  onAddToCart: (item: RedeemItem) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// ItemsLoadingState has no props - uses theme from context
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ItemsLoadingStateProps {}

export interface ItemsErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export interface ItemsEmptyStateProps {
  searchQuery: string;
  activeCategory: string;
}
