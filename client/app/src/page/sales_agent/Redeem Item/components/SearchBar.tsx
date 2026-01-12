import { useTheme } from "next-themes";
import { Search } from "lucide-react";
import type { SearchBarProps } from "../types";

export function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="mb-4 md:mb-6">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
          isDark
            ? "bg-gray-900 border-gray-800"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <Search
          className={`h-5 w-5 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`}
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
      </div>
    </div>
  );
}
