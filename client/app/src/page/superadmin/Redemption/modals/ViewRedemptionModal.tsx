import { X } from "lucide-react";
import { useTheme } from "next-themes";
import type { ModalBaseProps, RedemptionItem } from "./types";

interface ViewRedemptionModalProps extends ModalBaseProps {
  item: RedemptionItem | null;
}

export function ViewRedemptionModal({
  isOpen,
  onClose,
  item,
}: ViewRedemptionModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`relative w-full max-w-lg rounded-lg shadow-xl border divide-y ${
          resolvedTheme === "dark"
            ? "bg-gray-900 text-white border-gray-700 divide-gray-700"
            : "bg-gray-50 text-gray-900 border-gray-200 divide-gray-200"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-redemption-title"
      >
        {/* Header */}
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 id="view-redemption-title" className="text-xl font-semibold">Redemption Details</h2>
              <p className="text-sm text-gray-500 mt-1">
                View request information
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                resolvedTheme === "dark"
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-200"
              }`}
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <p className="text-xs text-gray-500 mb-1">Request ID</p>
            <p className="font-semibold">{item.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Requested By</p>
            <p className="font-semibold">{item.requested_by_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Requested For</p>
            <p className="font-semibold">{item.requested_for_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Date Requested</p>
            <p className="font-semibold">
              {new Date(item.date_requested).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                item.status === "Approved"
                  ? "bg-green-500 text-white"
                  : item.status === "Rejected"
                  ? "bg-red-500 text-white"
                  : "bg-yellow-400 text-black"
              }`}
            >
              {item.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Points</p>
            <p className="font-semibold">{item.total_points.toLocaleString()}</p>
          </div>
          {item.reviewed_by_name && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Reviewed By</p>
              <p className="font-semibold">{item.reviewed_by_name}</p>
            </div>
          )}
          {item.date_reviewed && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Date Reviewed</p>
              <p className="font-semibold">
                {new Date(item.date_reviewed).toLocaleString()}
              </p>
            </div>
          )}
          {item.remarks && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Remarks</p>
              <p className="font-semibold">{item.remarks}</p>
            </div>
          )}
          {item.rejection_reason && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Rejection Reason</p>
              <p className="font-semibold text-red-500">{item.rejection_reason}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 mb-2">Items</p>
            <div className="space-y-2">
              {item.items.map((reqItem) => (
                <div
                  key={reqItem.id}
                  className={`p-3 rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-sm">
                    {reqItem.catalogue_item_name}
                    {reqItem.variant_name && ` - ${reqItem.variant_name}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Qty: {reqItem.quantity}  {reqItem.points_per_item} pts ={" "}
                    {reqItem.total_points} pts
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
