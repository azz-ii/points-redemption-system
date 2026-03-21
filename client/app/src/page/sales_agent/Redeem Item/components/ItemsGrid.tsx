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
  viewMode,
  onAddToCart,
  onViewItem,
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
    <div className={
      viewMode === "grid"
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
        : "flex flex-col gap-3"
    }>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} layout={viewMode} onAddToCart={onAddToCart} onViewItem={onViewItem} />
      ))}
    </div>
  );
}
