import { X, Package, CheckCircle } from "lucide-react";
import { useTheme } from "next-themes";
import type { ModalBaseProps, RequestItem } from "./types";

interface ViewRequestModalProps extends ModalBaseProps {
  request: RequestItem | null;
  myItems?: Array<{
    id: number;
    variant_name: string;
    variant_code: string;
    catalogue_item_name: string;
    quantity: number;
    points_per_item: number;
    total_points: number;
    image_url: string | null;
    item_processed_by?: number | null;
    item_processed_by_name?: string | null;
    item_processed_at?: string | null;
  }>;
}

export function ViewRequestModal({
  isOpen,
  onClose,
  request,
  myItems,
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

  // Use myItems if provided (filtered items for this marketing user), otherwise fall back to all items
  const displayItems = myItems || request.items;

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
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h2 id="view-request-title" className="text-xl font-semibold">
              Request Details
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
              <p className="font-semibold">#{request.id}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Requested By
              </p>
              <p className="font-semibold">{request.requested_by_name}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Requested For
              </p>
              <p className="font-semibold">{request.requested_for_name}</p>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Total Points
              </p>
              <p className="font-semibold">
                {request.total_points.toLocaleString()} pts
              </p>
            </div>

            <div className="flex gap-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                    request.status
                  )}`}
                >
                  {request.status_display}
                </span>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Processing</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getProcessingStatusColor(
                    request.processing_status
                  )}`}
                >
                  {request.processing_status_display}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">
                Date Requested
              </p>
              <p className="font-semibold">
                {new Date(request.date_requested).toLocaleString()}
              </p>
            </div>

            {request.reviewed_by_name && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">
                  Approved By
                </p>
                <p className="font-semibold">{request.reviewed_by_name}</p>
              </div>
            )}

            {request.remarks && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Remarks</p>
                <p className="font-semibold">{request.remarks}</p>
              </div>
            )}

            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                {myItems ? "My Assigned Items" : "Items"} ({displayItems.length})
              </p>
              <div className="space-y-2">
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
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
