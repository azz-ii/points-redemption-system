import type { ReactNode } from "react";
import { useTheme } from "next-themes";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}

/**
 * PageHeader - Consistent page header with title, optional subtitle, and actions
 * Responsive layout: stacks on mobile, side-by-side on desktop
 */
export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = "",
}: PageHeaderProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {breadcrumbs && <div className="mb-3 sm:mb-4 text-sm">{breadcrumbs}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight truncate ${
              resolvedTheme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`mt-1 sm:mt-2 text-sm sm:text-base ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
