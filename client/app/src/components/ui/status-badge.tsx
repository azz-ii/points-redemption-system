import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<string, string> = {
  // Approval statuses
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  INACTIVE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  ARCHIVED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  WITHDRAWN: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",

  // Processing statuses
  PROCESSED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  NOT_PROCESSED: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  CANCELLED: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  AWAITING_AR: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const DEFAULT_CLASSES = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

/**
 * Returns dark-mode-safe Tailwind classes for a given status string.
 * Use this when you need to apply status colors to a custom element.
 */
export function getStatusClasses(status: string): string {
  return STATUS_CLASSES[status.toUpperCase()] ?? DEFAULT_CLASSES;
}

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
  children?: React.ReactNode;
}

/**
 * A standardized status badge with consistent dark mode support.
 */
export function StatusBadge({ status, label, size = "sm", className, children }: StatusBadgeProps) {
  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-xs"
    : "px-3 py-1 text-xs";

  return (
    <span
      className={cn(
        "inline-block rounded-full font-semibold",
        sizeClasses,
        getStatusClasses(status),
        className
      )}
    >
      {children ?? label ?? status}
    </span>
  );
}
