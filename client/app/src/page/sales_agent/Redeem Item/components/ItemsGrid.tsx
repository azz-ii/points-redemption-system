import { ItemsLoadingState } from "./ItemsLoadingState";
import { ItemsErrorState } from "./ItemsErrorState";
import { ItemsEmptyState } from "./ItemsEmptyState";
import { ItemCard } from "./ItemCard";
import type { ItemsGridProps } from "../types";

export function ItemsGrid({
  items,
  loading,
  error,
  searchQuery,
  activeCategory,
  onAddToCart,
  onRetry,
}: ItemsGridProps) {
  if (loading) {
    return <ItemsLoadingState />;
  }

  if (error) {
    return <ItemsErrorState error={error} onRetry={onRetry} />;
  }

  if (items.length === 0) {
    return <ItemsEmptyState searchQuery={searchQuery} activeCategory={activeCategory} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
