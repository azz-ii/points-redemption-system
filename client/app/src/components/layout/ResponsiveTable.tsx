import { ReactNode } from "react";
import { useTheme } from "next-themes";

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
  const { resolvedTheme } = useTheme();

  return (
    <div
      className={`w-full overflow-x-auto ${
        resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"
      } rounded-lg border ${
        resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div
        className={`inline-block min-w-full align-middle ${className}`}
        style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
