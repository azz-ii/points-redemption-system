import type { ReactNode } from "react";

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
  maxHeight?: string;
}

/**
 * ResponsiveTable - Wrapper for tables with horizontal scroll on mobile
 * Ensures tables are usable on small screens without breaking layout
 */
export function ResponsiveTable({
  children,
  className = "",
  maxHeight,
}: ResponsiveTableProps) {
  return (
    <div className="w-full overflow-x-auto bg-card rounded-lg border border-border">
      <div
        className={`inline-block min-w-full align-middle ${className}`}
        style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
