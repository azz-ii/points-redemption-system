import type { CategoryFiltersProps } from "../types";

export function CategoryFilters({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFiltersProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
            activeCategory === cat
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-accent"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
