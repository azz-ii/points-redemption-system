import { X, Package, CheckCircle } from "lucide-react";
import { RequestTimeline } from "@/components/modals";
import type { RequestHistoryItem } from "./types";

interface ViewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RequestHistoryItem | null;
}

export function ViewRequestModal({
  isOpen,
  onClose,
  item,
}: ViewRequestModalProps) {
  if (!isOpen || !item) return null;

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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-request-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3">
          <div>
            <h2 id="view-request-title" className="text-lg font-semibold">
              Processed Request Details
            </h2>
            <p className="text-xs text-gray-500 mt-0">
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
        <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Request Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Requested For</label>
                <p className="font-semibold">{item.requested_for_name}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Total Points</label>
                <p className="font-semibold">{item.total_points.toLocaleString()} pts</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Status
            </h3>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Approval Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                    item.status
                  )}`}
                >
                  {item.status_display || item.status}
                </span>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Processing Status</label>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                  {item.processing_status_display || "Processed"}
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
            }}
            showProcessing={true}
            showCancellation={true}
          />

          {/* Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              <Package className="inline h-4 w-4 mr-1" />
              Items ({item.items.length})
            </h3>
            <div className="space-y-2">
              {item.items.map((it) => (
                <div
                  key={it.id}
                  className="p-3 rounded border bg-card border-border"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{it.product_name}</p>
                      {it.product_code && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Code: {it.product_code}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Legend: {it.legend}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Qty: {it.quantity} × {it.points_per_item} pts = {it.total_points} pts
                      </p>
                      {it.processed_by_name && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Processed by: {it.processed_by_name}
                          {it.date_processed && (
                            <span className="ml-1">
                              on {new Date(it.date_processed).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    {it.is_processed && (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Processed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground border border-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
