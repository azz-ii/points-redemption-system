import { ShoppingCart } from "lucide-react";
import type { ItemsEmptyStateProps } from "../types";

export function ItemsEmptyState({ searchQuery, activeCategory }: ItemsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 mb-8">
      <ShoppingCart className="h-12 w-12 mb-4 text-muted-foreground" />
      <p className="text-lg text-muted-foreground">
        {searchQuery || activeCategory !== "All" 
          ? "No items match your search criteria" 
          : "No items available in the catalogue"}
      </p>
    </div>
  );
}
