import type { ReactNode } from "react";
import { useTheme } from "next-themes";

interface ContentCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  noBorder?: boolean;
}

/**
 * ContentCard - Consistent card component for content sections
 * Provides standard padding, borders, and shadows
 */
export function ContentCard({
  children,
  title,
  subtitle,
  headerActions,
  className = "",
  padding = "md",
  noBorder = false,
}: ContentCardProps) {
  const { resolvedTheme } = useTheme();

  const paddingClasses = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`rounded-lg ${
        noBorder
          ? ""
          : resolvedTheme === "dark"
            ? "border border-gray-800 bg-gray-800/50"
            : "border border-gray-200 bg-white shadow-sm"
      } ${className}`}
    >
      {(title || headerActions) && (
        <div
          className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b px-4 sm:px-6 py-4 ${
            resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {title && (
            <div className="min-w-0 flex-1">
              <h2
                className={`text-lg sm:text-xl font-semibold truncate ${
                  resolvedTheme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className={`mt-1 text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {headerActions && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
}
