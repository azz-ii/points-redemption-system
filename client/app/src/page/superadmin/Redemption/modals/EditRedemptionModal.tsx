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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`relative w-full max-w-lg rounded-lg shadow-xl border divide-y ${
          resolvedTheme === "dark"
            ? "bg-gray-900 text-white border-gray-700 divide-gray-700"
            : "bg-gray-50 text-gray-900 border-gray-200 divide-gray-200"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-redemption-title"
      >
        {/* Header */}
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 id="edit-redemption-title" className="text-xl font-semibold">Edit Redemption</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update request information
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

        {/* Form Content */}
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Request ID</label>
            <input
              type="text"
              value={item.id}
              disabled
              className={`w-full px-4 py-3 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-500"
                  : "bg-gray-100 border-gray-300 text-gray-500"
              } cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Requested By
            </label>
            <input
              type="text"
              value={item.requested_by_name}
              disabled
              className={`w-full px-4 py-3 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-500"
                  : "bg-gray-100 border-gray-300 text-gray-500"
              } cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Requested For
            </label>
            <input
              type="text"
              value={item.requested_for_name}
              disabled
              className={`w-full px-4 py-3 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-500"
                  : "bg-gray-100 border-gray-300 text-gray-500"
              } cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              defaultValue={item.status}
              className={`w-full px-4 py-3 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Total Points</label>
            <input
              type="text"
              value={item.total_points.toLocaleString()}
              disabled
              className={`w-full px-4 py-3 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-gray-500"
                  : "bg-gray-100 border-gray-300 text-gray-500"
              } cursor-not-allowed`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-white text-gray-900 hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
