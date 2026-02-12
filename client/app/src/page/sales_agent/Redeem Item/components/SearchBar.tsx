import { Search } from "lucide-react";
import type { SearchBarProps } from "../types";

export function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <div className="mb-4 md:mb-6">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-background border-border"
      >
        <Search
          className="h-5 w-5 text-muted-foreground"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
        />
      </div>
    </div>
  );
}
