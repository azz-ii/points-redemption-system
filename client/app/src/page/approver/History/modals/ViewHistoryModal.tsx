import { X } from "lucide-react";
import { useTheme } from "next-themes";
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
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h2 id="view-history-title" className="text-xl font-semibold">
              Request History Details
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded hover:${
                resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
              } transition-colors`}
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 text-base max-h-[70vh] overflow-y-auto">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Request ID
              </p>
              <p className="font-semibold">#{item.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">
                  Requested By
                </p>
                <p className="font-semibold">{item.requested_by_name}</p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">
                  Requested For
                </p>
                <p className="font-semibold">{item.requested_for_name}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Team</p>
              <p className="font-semibold">
                {item.team_name || <span className="text-gray-400 italic">No Team</span>}
              </p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Total Points
              </p>
              <p className="font-semibold">
                {item.total_points.toLocaleString()} pts
              </p>
            </div>

            <div className="flex gap-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">
                  Approval Status
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                    item.status
                  )}`}
                >
                  {item.status_display}
                </span>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">
                  Processing Status
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getProcessingStatusBadgeColor(
                    item.processing_status
                  )}`}
                >
                  {item.processing_status_display}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Date Requested
              </p>
              <p className="font-semibold">
                {new Date(item.date_requested).toLocaleString()}
              </p>
            </div>

            {item.reviewed_by_name && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                    Reviewed By
                  </p>
                  <p className="font-semibold">{item.reviewed_by_name}</p>
                </div>

                {item.date_reviewed && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">
                      Date Reviewed
                    </p>
                    <p className="font-semibold">
                      {new Date(item.date_reviewed).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {item.processed_by_name && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">
                    Processed By
                  </p>
                  <p className="font-semibold">{item.processed_by_name}</p>
                </div>

                {item.date_processed && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">
                      Date Processed
                    </p>
                    <p className="font-semibold">
                      {new Date(item.date_processed).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {item.remarks && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Remarks</p>
                <p className="font-semibold">{item.remarks}</p>
              </div>
            )}

            {item.rejection_reason && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">
                  Rejection Reason
                </p>
                <p className="font-semibold text-red-500">
                  {item.rejection_reason}
                </p>
              </div>
            )}

            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                Items ({item.items.length})
              </p>
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

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className={`flex-1 py-2 rounded font-semibold transition-colors ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
