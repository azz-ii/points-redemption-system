import { X, Package, CheckCircle } from "lucide-react";
import { RequestTimeline } from "@/components/modals";
import type { ModalBaseProps, RequestItem } from "./types";

interface ViewHistoryModalProps extends ModalBaseProps {
  request: RequestItem | null;
}

export function ViewHistoryModal({
  isOpen,
  onClose,
  request,
}: ViewHistoryModalProps) {
  if (!isOpen || !request) return null;

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

  const getProcessingStatusColor = (status: string) => {
    switch (status) {
      case "NOT_PROCESSED":
        return "bg-orange-400 text-black";
      case "PROCESSED":
        return "bg-blue-500 text-white";
      case "CANCELLED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
      <div
        className="bg-card rounded-lg shadow-xl max-w-3xl w-full border border-border max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-history-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 id="view-history-title" className="text-lg font-semibold">
                Request Details
              </h2>
              <p className="text-sm text-muted-foreground">
                Request #{request.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 divide-y divide-border">
          {/* Request Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Requested By</label>
                <p className="font-semibold">{request.requested_by_name}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Requested For</label>
                <p className="font-semibold">{request.requested_for_name}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Total Points</label>
                <p className="font-semibold">{request.total_points.toLocaleString()} pts</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Date Requested</label>
                <p className="font-semibold">
                  {new Date(request.date_requested).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4 pt-6">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Status
            </h3>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Approval Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                    request.status
                  )}`}
                >
                  {request.status_display}
                </span>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Processing Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getProcessingStatusColor(
                    request.processing_status
                  )}`}
                >
                  {request.processing_status_display}
                </span>
              </div>
            </div>
            {request.date_processed && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Date Processed</label>
                <p className="font-semibold">
                  {new Date(request.date_processed).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Request Timeline */}
          <div className="pt-6">
            <RequestTimeline
              data={{
                requested_by_name: request.requested_by_name,
                date_requested: request.date_requested,
                reviewed_by_name: request.reviewed_by_name,
                date_reviewed: request.date_reviewed,
                requires_sales_approval: request.requires_sales_approval,
                sales_approval_status: request.sales_approval_status,
                sales_approved_by_name: request.sales_approved_by_name,
                sales_approval_date: request.sales_approval_date,
                sales_rejection_reason: request.sales_rejection_reason,
                requires_marketing_approval: request.requires_marketing_approval,
                marketing_approval_status: request.marketing_approval_status,
                marketing_approved_by_name: request.marketing_approved_by_name,
                marketing_approval_date: request.marketing_approval_date,
                marketing_rejection_reason: request.marketing_rejection_reason,
                processed_by_name: request.processed_by_name,
                date_processed: request.date_processed,
                cancelled_by_name: request.cancelled_by_name,
                date_cancelled: request.date_cancelled,
                remarks: request.remarks,
                rejection_reason: request.rejection_reason,
                status: request.status,
                processing_status: request.processing_status,
              }}
              showProcessing={true}
              showCancellation={true}
            />
          </div>

          {/* Items */}
          <div className="space-y-4 pt-6">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              <Package className="inline h-4 w-4 mr-1" />
              Items ({request.items.length})
            </h3>
            <div className="space-y-2">
              {request.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border bg-muted/50 border-border"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{item.product_name}</p>
                      {item.product_code && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Code: {item.product_code}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Qty: {item.quantity} × {item.points_per_item} pts ={" "}
                        {item.total_points} pts
                      </p>
                      {item.item_processed_by_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Processed by: {item.item_processed_by_name}
                        </p>
                      )}
                    </div>
                    {item.item_processed_by && (
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
        <div className="flex items-center justify-end p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
            aria-label="Close request details"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
