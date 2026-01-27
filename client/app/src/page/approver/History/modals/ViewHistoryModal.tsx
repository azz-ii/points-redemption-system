import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { RequestTimeline } from "@/components/modals";
import type { HistoryItem } from "../types";

interface ViewHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HistoryItem | null;
}

export function ViewHistoryModal({
  isOpen,
  onClose,
  item,
}: ViewHistoryModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !item) return null;

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

  const getProcessingStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return "bg-blue-500 text-white";
      case "CANCELLED":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-2xl w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-history-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-history-title" className="text-xl font-semibold">
              Request History Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
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
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Request Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Request Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Requested For</label>
                <p className="font-semibold">{item.requested_for_name}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Team</label>
                <p className="font-semibold">
                  {item.team_name || <span className="text-gray-400 italic">No Team</span>}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Total Points</label>
              <p className="font-semibold">{item.total_points.toLocaleString()} pts</p>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
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
                  {item.status_display}
                </span>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Processing Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getProcessingStatusBadgeColor(
                    item.processing_status
                  )}`}
                >
                  {item.processing_status_display}
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
              Items ({item.items.length})
            </h3>
            <div className="space-y-2">
              {item.items.map((requestItem) => (
                <div
                  key={requestItem.id}
                  className={`p-3 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex gap-3">
                    {requestItem.image_url && (
                      <img
                        src={requestItem.image_url}
                        alt={requestItem.catalogue_item_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">
                        {requestItem.catalogue_item_name}
                      </p>
                      {requestItem.variant_option && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {requestItem.variant_option}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Code: {requestItem.variant_code}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Qty: {requestItem.quantity} × {requestItem.points_per_item} pts ={" "}
                        {requestItem.total_points} pts
                      </p>
                    </div>
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
