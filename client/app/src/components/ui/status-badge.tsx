import { cn } from "@/lib/utils";

const STATUS_CLASSES: Record<string, string> = {
  // Approval statuses
  APPROVED: "bg-success/15 text-[color-mix(in_srgb,var(--color-success)_70%,black)] dark:bg-success/20 dark:text-success",
  ACTIVE: "bg-success/15 text-[color-mix(in_srgb,var(--color-success)_70%,black)] dark:bg-success/20 dark:text-success",
  PENDING: "bg-warning/20 text-[color-mix(in_srgb,var(--color-warning)_70%,black)] dark:bg-warning/20 dark:text-warning",
  REJECTED: "bg-destructive/15 text-[color-mix(in_srgb,var(--color-destructive)_70%,black)] dark:bg-destructive/20 dark:text-destructive-foreground",
  INACTIVE: "bg-destructive/15 text-[color-mix(in_srgb,var(--color-destructive)_70%,black)] dark:bg-destructive/20 dark:text-destructive-foreground",
  ARCHIVED: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  WITHDRAWN: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",

  // Processing statuses
  PROCESSED: "bg-info/15 text-[color-mix(in_srgb,var(--color-info)_70%,black)] dark:bg-info/20 dark:text-info",
  COMPLETED: "bg-info/15 text-[color-mix(in_srgb,var(--color-info)_70%,black)] dark:bg-info/20 dark:text-info",
  NOT_PROCESSED: "bg-muted text-[color-mix(in_srgb,var(--color-muted-foreground)_70%,black)] dark:bg-muted dark:text-muted-foreground",
  PARTIALLY_PROCESSED: "bg-warning/20 text-[color-mix(in_srgb,var(--color-warning)_70%,black)] dark:bg-warning/20 dark:text-warning",
  CANCELLED: "bg-destructive/15 text-[color-mix(in_srgb,var(--color-destructive)_70%,black)] dark:bg-destructive/20 dark:text-destructive-foreground",
  AWAITING_AR: "bg-warning/20 text-[color-mix(in_srgb,var(--color-warning)_70%,black)] dark:bg-warning/20 dark:text-warning",
};

const DEFAULT_CLASSES = "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground";

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
