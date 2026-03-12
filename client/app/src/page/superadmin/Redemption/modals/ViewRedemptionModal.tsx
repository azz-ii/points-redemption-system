import { X, Package, CheckCircle, Clock, XCircle } from "lucide-react";
import { RequestTimeline } from "@/components/modals";
import { ProcessingPhotosGallery } from "@/components/ProcessingPhotosGallery";
import type { ModalBaseProps, RedemptionItem, RequestItemVariant } from "./types";

interface ViewRedemptionModalProps extends ModalBaseProps {
  item: RedemptionItem | null;
  myItems?: RequestItemVariant[];
  onMarkItemProcessed?: () => void;
  onCancelRequest?: () => void;
}

export function ViewRedemptionModal({
  isOpen,
  onClose,
  item,
  myItems,
  onMarkItemProcessed,
  onCancelRequest,
}: ViewRedemptionModalProps) {
  if (!isOpen || !item) return null;

  const canProcess =
    !!onMarkItemProcessed &&
    item.status === "APPROVED" &&
    item.processing_status !== "CANCELLED" &&
    item.processing_status !== "PROCESSED";

  const canCancel =
    !!onCancelRequest &&
    item.status === "APPROVED" &&
    item.processing_status !== "CANCELLED" &&
    item.processing_status !== "PROCESSED";

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
      case "PARTIALLY_PROCESSED":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
      case "PROCESSED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Use myItems if provided (filtered items for this admin user), otherwise fall back to all items
  const displayItems = myItems || item.items;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700 max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-redemption-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-redemption-title" className="text-xl font-semibold">
              Request Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Request #{item.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Request Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Requested For</label>
                <p className="font-semibold">{item.requested_for_name}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Total Points</label>
                <p className="font-semibold">{item.total_points.toLocaleString()} pts</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Status
            </h3>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Approval Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                    item.status
                  )}`}
                >
                  {item.status_display || item.status}
                </span>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Processing Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getProcessingStatusColor(
                    item.processing_status
                  )}`}
                >
                  {item.processing_status_display || item.processing_status?.replace(/_/g, " ") || "Not Processed"}
                </span>
              </div>
            </div>
          </div>

          {/* Request Timeline */}
          <RequestTimeline
            data={{
              requested_by_name: item.requested_by_name,
              date_requested: item.date_requested,
              reviewed_by_name: item.reviewed_by_name,
              date_reviewed: item.date_reviewed,
              requires_sales_approval: item.requires_sales_approval,
              sales_approval_status: item.sales_approval_status,
              sales_approved_by_name: item.sales_approved_by_name,
              sales_approval_date: item.sales_approval_date,
              sales_rejection_reason: item.sales_rejection_reason,
              requires_marketing_approval: item.requires_marketing_approval,
              marketing_approval_status: item.marketing_approval_status,
              marketing_approved_by_name: item.marketing_approved_by_name,
              marketing_approval_date: item.marketing_approval_date,
              marketing_rejection_reason: item.marketing_rejection_reason,
              processed_by_name: item.processed_by_name,
              date_processed: item.date_processed,
              cancelled_by_name: item.cancelled_by_name,
              date_cancelled: item.date_cancelled,
              remarks: item.remarks,
              rejection_reason: item.rejection_reason,
              status: item.status,
              processing_status: item.processing_status,
              ar_status: item.ar_status,
              ar_uploaded_by_name: item.ar_uploaded_by_name,
              ar_uploaded_at: item.ar_uploaded_at,
            }}
            showProcessing={true}
            showCancellation={true}
          />

          {/* Processing Photos */}
          {item.processing_photos && item.processing_photos.length > 0 && (
            <ProcessingPhotosGallery photos={item.processing_photos} />
          )}

          {/* Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Package className="inline h-4 w-4 mr-1" />
              {myItems ? "My Assigned Items" : "Items"} ({displayItems.length})
            </h3>
            <div className="space-y-2">
              {displayItems.map((it) => {
                const isFixed = !it.pricing_type || it.pricing_type === "FIXED";
                const fulfilledQty = it.fulfilled_quantity ?? 0;
                const isFullyProcessed = !!it.item_processed_by;
                const isPartial = !isFullyProcessed && fulfilledQty > 0;
                const logs = it.fulfillment_logs ?? [];

                return (
                  <div
                    key={it.id}
                    className="p-3 rounded border bg-card border-border"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{it.product_name}</p>
                        {it.product_code && (
                          <p className="text-xs text-muted-foreground">
                            {it.product_code}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Qty: {it.quantity} &times; {it.points_per_item} pts = {it.total_points} pts
                        </p>
                      </div>
                      {isFullyProcessed ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 shrink-0">
                          <CheckCircle className="h-4 w-4" />
                          Processed
                        </span>
                      ) : isPartial ? (
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
                          Partial ({fulfilledQty}/{it.quantity})
                        </span>
                      ) : null}
                    </div>

                    {/* Progress bar for FIXED items with any fulfillment */}
                    {isFixed && fulfilledQty > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Fulfilled: {fulfilledQty} / {it.quantity}</span>
                          {!isFullyProcessed && (
                            <span>{(it.remaining_quantity ?? 0)} remaining</span>
                          )}
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isFullyProcessed ? "bg-green-500" : "bg-amber-500"}`}
                            style={{ width: `${Math.round((fulfilledQty / it.quantity) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Fulfillment log history */}
                    {logs.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Fulfillment History</p>
                        {logs.map((log, idx) => (
                          <div key={log.id} className="flex items-start gap-2 text-xs text-muted-foreground pl-1">
                            <Clock className="h-3 w-3 mt-0.5 shrink-0" />
                            <span>
                              Pass #{idx + 1}: {log.fulfilled_quantity > 0 ? `${log.fulfilled_quantity} units` : "Fully processed"} by {log.fulfilled_by_name ?? "Unknown"} on{" "}
                              {new Date(log.fulfilled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              {log.notes ? ` \u2014 ${log.notes}` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        {(canProcess || canCancel) && (
          <div className="p-8 flex justify-end gap-3">
            {canCancel && (
              <button
                onClick={onCancelRequest}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-2 font-medium"
                aria-label="Cancel request"
              >
                <XCircle className="h-4 w-4" />
                Cancel Request
              </button>
            )}
            {canProcess && (
              <button
                onClick={onMarkItemProcessed}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center gap-2 font-medium"
                aria-label="Mark items as processed"
              >
                <CheckCircle className="h-4 w-4" />
                Process
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
