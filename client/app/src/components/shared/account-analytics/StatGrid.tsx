import type { ReactNode } from "react";

interface StatGridProps {
  children: ReactNode;
  columns?: number;
}

export function StatGrid({ children, columns = 3 }: StatGridProps) {
  const colClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 4
        ? "grid-cols-2 sm:grid-cols-4"
        : columns === 5
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
          : "grid-cols-2 sm:grid-cols-3";

  return <div className={`grid ${colClass} gap-2`}>{children}</div>;
}
