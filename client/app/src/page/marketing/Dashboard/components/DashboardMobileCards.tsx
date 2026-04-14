import { Eye, CheckCircle, XCircle } from "lucide-react";
import { MobileCardsSkeleton } from "@/components/shared/mobile-cards-skeleton";
import type { FlattenedRequestItem } from "../../ProcessRequests/modals/types";

interface DashboardMobileCardsProps {
  items: FlattenedRequestItem[];
  loading: boolean;
  onViewRequest: (item: FlattenedRequestItem) => void;
  onMarkItemProcessed: (item: FlattenedRequestItem) => void;
  onCancelRequest: (item: FlattenedRequestItem) => void;
}

export function DashboardMobileCards({
  items,
  loading,
  onViewRequest,
  onMarkItemProcessed,
  onCancelRequest,
}: DashboardMobileCardsProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-800/50 dark:text-yellow-300";
      case "APPROVED":
        return "bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300";
      case "REJECTED":
        return "bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-900/40 dark:border-rose-800/50 dark:text-rose-300";
      default:
        return "bg-slate-100 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700/50 dark:text-slate-300";
    }
  };

  if (loading) {
    return <MobileCardsSkeleton count={6} showHeader={false} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-sm text-muted-foreground">No items to process</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isProcessed = !!item.item_processed_by;
        const canProcess =
          item.request_status === "APPROVED" &&
          item.request_processing_status !== "CANCELLED" &&
          !isProcessed;
        const canCancel =
          item.request_status === "APPROVED" &&
          item.request_processing_status !== "CANCELLED" &&
          item.request_processing_status !== "PROCESSED";

        return (
          <div
            key={`${item.requestId}-${item.id}`}
            className="p-4 rounded-lg border bg-card border-border"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-sm">
                  {item.product_code}
                </p>
                <h3 className="text-base font-semibold mt-1">{item.product_name}</h3>
                {item.category && (
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                )}
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                    item.request_status
                  )}`}
                >
                  {item.request_status_display}
                </span>
                {isProcessed ? (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300">
                    Processed
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-zinc-100 border border-zinc-200 text-zinc-800 dark:bg-zinc-900/40 dark:border-zinc-800/50 dark:text-zinc-300">
                    Pending
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1 mb-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{item.requested_for_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium">{item.quantity}</span>
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
                onClick={() => onViewRequest(item)}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Eye className="h-4 w-4" />
                View
              </button>
              {canProcess && (
                <button
                  onClick={() => onMarkItemProcessed(item)}
                  className="flex-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Process
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => onCancelRequest(item)}
                  className="flex-1 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
