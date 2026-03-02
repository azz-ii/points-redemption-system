import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  loading?: boolean;
  onClick?: () => void;
  active?: boolean;
}

export function StatCard({ label, value, icon, color = "text-foreground", loading, onClick, active }: StatCardProps) {
  return (
    <div
      className={`p-3 rounded-lg border bg-card transition-all ${
        onClick ? "cursor-pointer hover:border-primary/50 hover:shadow-sm" : ""
      } ${active ? "border-primary ring-1 ring-primary/30 shadow-sm" : "border-border"}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-6 w-10 rounded bg-muted" />
        </div>
      ) : (
        <>
          <div className={`flex items-center gap-1.5 mb-1 ${color}`}>
            {icon}
            <p className="text-xs font-medium truncate">{label}</p>
          </div>
          <p className="text-xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
        </>
      )}
    </div>
  );
}
