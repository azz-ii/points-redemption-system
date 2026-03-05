import { Eye, CheckCircle } from "lucide-react";
import { MobileCardsSkeleton } from "@/components/shared/mobile-cards-skeleton";
import type { RedemptionItem } from "../modals/types";

interface RedemptionMobileCardsProps {
  paginatedItems: RedemptionItem[];
  filteredItems: RedemptionItem[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (item: RedemptionItem) => void;
  onMarkProcessed: (item: RedemptionItem) => void;
  canMarkProcessed: (item: RedemptionItem) => boolean;
}

export function RedemptionMobileCards({
  paginatedItems,
  filteredItems,
  loading,
  onView,
  onMarkProcessed,
  canMarkProcessed,
}: RedemptionMobileCardsProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "APPROVED":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getProcessingStatusColor = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
      case "NOT_PROCESSED":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";
      case "PROCESSED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div
      className="border rounded-lg overflow-hidden bg-card border-border transition-colors"
    >
      <div className="space-y-3 p-4">
        {loading ? (
          <MobileCardsSkeleton count={6} showHeader={false} />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No requests found
          </div>
        ) : (
          paginatedItems.map((item) => (
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
                <div className="flex flex-col gap-1 items-end">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                      item.status
                    )}`}
                  >
                    {item.status_display || item.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getProcessingStatusColor(
                      item.processing_status
                    )}`}
                  >
                    {item.processing_status_display || item.processing_status?.replace(/_/g, ' ') || "Not Processed"}
                  </span>
                </div>
              </div>
              <div className="space-y-1 mb-3 text-xs">
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
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {new Date(item.date_requested).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onView(item)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                {canMarkProcessed(item) && (
                  <button
                    onClick={() => onMarkProcessed(item)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Process
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
