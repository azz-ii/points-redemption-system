import { X } from "lucide-react";
import { useTheme } from "next-themes";
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
                <label className="block text-xs text-gray-500 mb-1">Requested By</label>
                <p className="font-semibold">{request.requested_by_name}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Requested For</label>
                <p className="font-semibold">{request.requested_for_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Total Points</label>
                <p className="font-semibold">{request.total_points.toLocaleString()} pts</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date Requested</label>
                <p className="font-semibold">
                  {new Date(request.date_requested).toLocaleString()}
                </p>
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

          {/* Review Info */}
          {(request.reviewed_by_name || request.date_reviewed || request.remarks || request.rejection_reason) && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Review Information
              </h3>
              {request.reviewed_by_name && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Reviewed By</label>
                  <p className="font-semibold">{request.reviewed_by_name}</p>
                </div>
              )}
              {request.date_reviewed && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date Reviewed</label>
                  <p className="font-semibold">
                    {new Date(request.date_reviewed).toLocaleString()}
                  </p>
                </div>
              )}
              {request.remarks && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Remarks</label>
                  <p className="font-semibold">{request.remarks}</p>
                </div>
              )}
              {request.rejection_reason && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Rejection Reason</label>
                  <p className="font-semibold text-red-500">{request.rejection_reason}</p>
                </div>
              )}
            </div>
          )}

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
                  <p className="font-semibold">{item.catalogue_item_name}</p>
                  {item.variant_name && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.variant_name}
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
