import { useTheme } from "next-themes";
import { AlertCircle } from "lucide-react";
import type { ItemsErrorStateProps } from "../types";

export function ItemsErrorState({ error, onRetry }: ItemsErrorStateProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex flex-col items-center justify-center py-16 mb-8">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className={`text-lg font-semibold mb-2 ${isDark ? "text-red-400" : "text-red-600"}`}>
        Failed to Load Items
      </p>
      <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        {error}
      </p>
      <button
        onClick={onRetry || (() => window.location.reload())}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
          isDark
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        Retry
      </button>
    </div>
  );
}
