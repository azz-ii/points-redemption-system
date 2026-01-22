import { X } from "lucide-react";
import { useTheme } from "next-themes";
import type { ModalBaseProps, RedemptionItem } from "./types";

interface EditRedemptionModalProps extends ModalBaseProps {
  item: RedemptionItem | null;
}

export function EditRedemptionModal({
  isOpen,
  onClose,
  item,
}: EditRedemptionModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !item) return null;

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
        aria-labelledby="edit-redemption-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="edit-redemption-title" className="text-xl font-semibold">
              Edit Redemption
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update request information
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
          {/* Read-only Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Request Information
            </h3>
            <div>
              <label
                htmlFor="edit-request-id"
                className="text-xs text-gray-500 mb-2 block"
              >
                Request ID
              </label>
              <input
                id="edit-request-id"
                type="text"
                value={item.id}
                disabled
                className={`w-full px-4 py-3 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>
            <div>
              <label
                htmlFor="edit-requested-by"
                className="text-xs text-gray-500 mb-2 block"
              >
                Requested By
              </label>
              <input
                id="edit-requested-by"
                type="text"
                value={item.requested_by_name}
                disabled
                className={`w-full px-4 py-3 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>
            <div>
              <label
                htmlFor="edit-requested-for"
                className="text-xs text-gray-500 mb-2 block"
              >
                Requested For
              </label>
              <input
                id="edit-requested-for"
                type="text"
                value={item.requested_for_name}
                disabled
                className={`w-full px-4 py-3 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Status
            </h3>
            <div>
              <label
                htmlFor="edit-status"
                className="text-xs text-gray-500 mb-2 block"
              >
                Status *
              </label>
              <select
                id="edit-status"
                defaultValue={item.status}
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500`}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="edit-total-points"
                className="text-xs text-gray-500 mb-2 block"
              >
                Total Points
              </label>
              <input
                id="edit-total-points"
                type="text"
                value={item.total_points.toLocaleString()}
                disabled
                className={`w-full px-4 py-3 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8">
          <button
            onClick={onClose}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-white hover:bg-gray-100 text-gray-900 disabled:opacity-50"
                : "bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
