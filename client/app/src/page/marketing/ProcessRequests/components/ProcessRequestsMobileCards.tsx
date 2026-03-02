import { Eye, CheckCircle } from "lucide-react";
import { MobileCardsSkeleton } from "@/components/shared/mobile-cards-skeleton";
import type { FlattenedRequestItem } from "../modals/types";

interface ProcessRequestsMobileCardsProps {
  items: FlattenedRequestItem[];
  loading: boolean;
  onViewRequest: (item: FlattenedRequestItem) => void;
  onMarkItemProcessed: (item: FlattenedRequestItem) => void;
}

export function ProcessRequestsMobileCards({
  items,
  loading,
  onViewRequest,
  onMarkItemProcessed,
}: ProcessRequestsMobileCardsProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-400 text-black";
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

  if (items.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-sm text-muted-foreground">No items found</p>
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

        return (
          <div
            key={`${item.requestId}-${item.id}`}
            className="p-4 rounded-lg border bg-card border-border"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Request #{item.requestId}
                </p>
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
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white">
                    Processed
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-400 text-black">
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
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white"
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
