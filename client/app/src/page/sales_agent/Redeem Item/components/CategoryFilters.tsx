import { useTheme } from "next-themes";
import type { CategoryFiltersProps } from "../types";

export function CategoryFilters({
  categories,
  activeCategory,
  onCategoryChange,
  counts,
}: CategoryFiltersProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {categories.map((cat) => {
        const count = counts?.[cat] ?? 0;
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            aria-pressed={isActive}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-colors border flex items-center gap-2 shadow-soft ${
              isActive
                ? "bg-brand text-white border-transparent"
                : isDark
                ? "bg-gray-900 border-gray-800 text-gray-200 hover:bg-gray-800"
                : "bg-white border-gray-200 text-gray-800 hover:bg-gray-100"
            }`}
          >
            <span>{cat}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                isActive
                  ? "bg-white/20 text-white"
                  : isDark
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
