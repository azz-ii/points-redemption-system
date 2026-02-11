import type { ReactNode } from "react";
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4 text-center ${className}`}
    >
      <div className="mb-4 sm:mb-6 text-red-500">
        <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16" />
      </div>
      <h3
        className={`text-lg sm:text-xl font-semibold mb-2 ${
          resolvedTheme === "dark" ? "text-gray-300" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm sm:text-base max-w-md mb-6 ${
          resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
