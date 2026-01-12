import { useTheme } from "next-themes";
import { ShoppingCart } from "lucide-react";
import type { ItemsEmptyStateProps } from "../types";

export function ItemsEmptyState({ searchQuery, activeCategory }: ItemsEmptyStateProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex flex-col items-center justify-center py-16 mb-8">
      <ShoppingCart className={`h-12 w-12 mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
      <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {searchQuery || activeCategory !== "All" 
          ? "No items match your search criteria" 
          : "No items available in the catalogue"}
      </p>
    </div>
  );
}
