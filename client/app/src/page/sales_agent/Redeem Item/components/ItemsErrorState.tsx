import { AlertCircle } from "lucide-react";
import type { ItemsErrorStateProps } from "../types";

export function ItemsErrorState({ error, onRetry }: ItemsErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 mb-8">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <p className="text-lg font-semibold mb-2 text-destructive">
        Failed to Load Items
      </p>
      <p className="text-sm mb-4 text-muted-foreground">
        {error}
      </p>
      <button
        onClick={onRetry || (() => window.location.reload())}
        className="px-4 py-2 rounded-lg font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Retry
      </button>
    </div>
  );
}
