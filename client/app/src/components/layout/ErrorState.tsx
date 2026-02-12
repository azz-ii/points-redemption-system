import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

/**
 * ErrorState - Consistent error display component
 * Used when something goes wrong
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  action,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4 text-center ${className}`}
    >
      <div className="mb-4 sm:mb-6 text-destructive">
        <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">
        {title}
      </h3>
      <p className="text-sm sm:text-base max-w-md mb-6 text-muted-foreground">
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
