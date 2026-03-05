import { Eye } from "lucide-react";
import { MobileCardsSkeleton } from "@/components/shared/mobile-cards-skeleton";
import type { HistoryItem } from "../types.js";

interface HistoryMobileCardsProps {
  historyItems: HistoryItem[];
  loading: boolean;
  onView: (item: HistoryItem) => void;
}

export function HistoryMobileCards({
  historyItems,
  loading,
  onView,
}: HistoryMobileCardsProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (loading) {
    return <MobileCardsSkeleton count={6} showHeader={false} />;
  }

  if (historyItems.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-sm text-muted-foreground">No processed requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {historyItems.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-lg border bg-card border-border"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-sm">
                {item.requested_by_name}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                item.status
              )}`}
            >
              {item.status_display}
            </span>
          </div>

          <div className="space-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Team:</span>
              <span className="font-medium">
                {item.team_name || <span className="text-muted-foreground italic">No Team</span>}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">For:</span>
              <span className="font-medium">{item.requested_for_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Points:</span>
              <span className="font-medium">
                {item.total_points.toLocaleString()} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processed:</span>
              <span className="font-medium">
                {item.date_processed
                  ? new Date(item.date_processed).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">By:</span>
              <span className="font-medium">{item.processed_by_name || "-"}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onView(item)}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 bg-muted hover:bg-accent text-foreground"
            >
              <Eye className="h-4 w-4" />
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
