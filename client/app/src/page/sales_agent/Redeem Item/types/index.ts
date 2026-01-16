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
  onNotificationClick: () => void;
  onHistoryClick?: () => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  suggestions?: string[];
}

export interface CategoryFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  counts?: Record<string, number>;
}

export interface ItemsGridProps {
  items: RedeemItem[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  activeCategory: string;
  onAddToCart: (item: RedeemItem) => void;
  onRetry?: () => void;
  onResetFilters?: () => void;
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
  onResetFilters?: () => void;
}
