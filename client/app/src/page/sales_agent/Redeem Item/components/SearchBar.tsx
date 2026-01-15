import { useTheme } from "next-themes";
import { Search, Sparkles } from "lucide-react";
import type { SearchBarProps } from "../types";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  suggestions = [],
}: SearchBarProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="mb-4 md:mb-6 space-y-2">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-soft ${
          isDark ? "bg-gray-900/80 border-gray-800" : "bg-white border-gray-300"
        }`}
      >
        <Search
          className={`h-5 w-5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 bg-transparent outline-none ${
            isDark
              ? "text-white placeholder-gray-500"
              : "text-gray-900 placeholder-gray-400"
          }`}
        />
        {value && (
          <button
            onClick={() => {
              onChange("");
              onClear?.();
            }}
            className={`text-xs font-semibold px-2 py-1 rounded-md ${
              isDark ? "bg-gray-800 text-gray-100" : "bg-gray-200 text-gray-700"
            }`}
          >
            Clear
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
              isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Quick picks
          </span>
          {suggestions.map((hint) => (
            <button
              key={hint}
              onClick={() => onChange(hint)}
              className={`px-3 py-1 rounded-full border transition-colors ${
                isDark
                  ? "border-gray-800 text-gray-100 hover:bg-gray-800"
                  : "border-gray-200 text-gray-800 hover:bg-white"
              }`}
            >
              {hint}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
