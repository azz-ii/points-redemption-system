import type { ReactNode } from "react";

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
  const paddingClasses = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`rounded-lg ${
        noBorder ? "" : "border border-border bg-card shadow-sm"
      } ${className}`}
    >
      {(title || headerActions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border px-4 sm:px-6 py-4">
          {title && (
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold truncate text-foreground">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">
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
