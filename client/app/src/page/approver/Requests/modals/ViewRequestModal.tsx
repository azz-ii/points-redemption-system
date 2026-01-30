import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { RequestTimeline } from "@/components/modals";
import type { ModalBaseProps, RequestItem } from "./types";

interface ViewRequestModalProps extends ModalBaseProps {
  request: RequestItem | null;
}

export function ViewRequestModal({
  isOpen,
  onClose,
  request,
}: ViewRequestModalProps) {
  const { resolvedTheme } = useTheme();

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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-lg w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-request-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-request-title" className="text-xl font-semibold">
              Request Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Request #{request.id}
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
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Request Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Requested For</label>
                <p className="font-semibold">{request.requested_for_name}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Total Points</label>
                <p className="font-semibold">{request.total_points.toLocaleString()} pts</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Status
            </h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                request.status
              )}`}
            >
              {request.status_display}
            </span>
          </div>

          {/* Request Timeline */}
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

          {/* Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Items ({request.items.length})
            </h3>
            <div className="space-y-2">
              {request.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <p className="font-semibold">{item.product_name}</p>
                  {item.product_code && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.product_code}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Qty: {item.quantity} × {item.points_per_item} pts ={" "}
                    {item.total_points} pts
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
