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
        return "bg-green-500 text-white";
      case "REJECTED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return <MobileCardsSkeleton count={6} showHeader={false} />;
  }

  if (historyItems.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-sm text-gray-500">No processed requests found</p>
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
              <p className="font-semibold text-sm">#{item.id}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
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
              <span className="text-gray-500 dark:text-gray-400">Team:</span>
              <span className="font-medium">
                {item.team_name || <span className="text-gray-400 italic">No Team</span>}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">For:</span>
              <span className="font-medium">{item.requested_for_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Points:</span>
              <span className="font-medium">
                {item.total_points.toLocaleString()} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Processed:</span>
              <span className="font-medium">
                {item.date_processed
                  ? new Date(item.date_processed).toLocaleDateString()
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">By:</span>
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
