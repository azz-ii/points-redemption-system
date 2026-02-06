import { ReactNode } from "react";
import { useTheme } from "next-themes";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState - Consistent empty state component
 * Used when no data is available
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4 text-center ${className}`}
    >
      {icon && (
        <div
          className={`mb-4 sm:mb-6 ${
            resolvedTheme === "dark" ? "text-gray-600" : "text-gray-400"
          }`}
        >
          {icon}
        </div>
      )}
      <h3
        className={`text-lg sm:text-xl font-semibold mb-2 ${
          resolvedTheme === "dark" ? "text-gray-300" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`text-sm sm:text-base max-w-md mb-6 ${
            resolvedTheme === "dark" ? "text-gray-500" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
