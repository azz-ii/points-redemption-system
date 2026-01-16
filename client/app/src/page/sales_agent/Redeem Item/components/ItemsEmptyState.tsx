import { useTheme } from "next-themes";
import { ShoppingCart } from "lucide-react";
import type { ItemsEmptyStateProps } from "../types";

export function ItemsEmptyState({
  searchQuery,
  activeCategory,
  onResetFilters,
}: ItemsEmptyStateProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex flex-col items-center justify-center py-16 mb-8 text-center gap-3">
      <ShoppingCart
        className={`h-12 w-12 ${isDark ? "text-gray-600" : "text-gray-400"}`}
      />
      <p
        className={`text-lg font-semibold ${
          isDark ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {searchQuery || activeCategory !== "All"
          ? "No items match your filters"
          : "No items available in the catalogue"}
      </p>
      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        Try adjusting your search or category to see more options.
      </p>
      {onResetFilters && (
        <button
          onClick={onResetFilters}
          className="mt-2 px-4 py-2 rounded-lg bg-brand text-white font-semibold shadow-soft hover:shadow-strong transition-shadow"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
