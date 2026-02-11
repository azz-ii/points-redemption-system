import { useTheme } from "next-themes";
import { AlertTriangle } from "lucide-react";

interface SetInventoryConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmationType: "bulk" | "reset";
  bulkStockDelta: number;
  trackedItemsCount: number;
  loading: boolean;
  password: string;
  onPasswordChange: (password: string) => void;
}

export function SetInventoryConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  confirmationType,
  bulkStockDelta,
  trackedItemsCount,
  loading,
  password,
  onPasswordChange,
}: SetInventoryConfirmationModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (password.trim() && !loading) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`rounded-lg shadow-2xl w-full max-w-md mx-4 ${
          resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center gap-3 p-4 border-b ${
            resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div
            className={`p-2 rounded-full ${
              confirmationType === "reset"
                ? resolvedTheme === "dark"
                  ? "bg-red-900/30"
                  : "bg-red-100"
                : resolvedTheme === "dark"
                ? "bg-orange-900/30"
                : "bg-orange-100"
            }`}
          >
            <AlertTriangle
              className={`h-6 w-6 ${
                confirmationType === "reset"
                  ? "text-red-500"
                  : "text-orange-500"
              }`}
            />
          </div>
          <h3
            className={`text-lg font-semibold ${
              resolvedTheme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {confirmationType === "reset"
              ? "Confirm Reset All Stock"
              : "Confirm Bulk Stock Update"}
          </h3>
        </div>

        {/* Content */}
        <div className="p-4">
          <div
            className={`mb-4 ${
              resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {confirmationType === "reset" ? (
              <>
                <p className="font-medium mb-2">
                  You are about to reset ALL stock to 0 for{" "}
                  <span className="font-bold text-red-500">
                    {trackedItemsCount}
                  </span>{" "}
                  inventory-tracked item(s).
                </p>
                <p className="text-sm">
                  This action is <strong>permanent</strong> and cannot be undone.
                  All affected items will have their stock balance set to zero.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium mb-2">
                  You are about to apply{" "}
                  <span
                    className={`font-bold ${
                      bulkStockDelta > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {bulkStockDelta > 0 ? "+" : ""}
                    {bulkStockDelta}
                  </span>{" "}
                  stock to{" "}
                  <span className="font-bold text-orange-500">
                    {trackedItemsCount}
                  </span>{" "}
                  inventory-tracked item(s).
                </p>
                <p className="text-sm">
                  This action is <strong>permanent</strong> and cannot be undone.
                </p>
              </>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${
                resolvedTheme === "dark"
                  ? "text-gray-300"
                  : "text-gray-700"
              }`}
            >
              Enter Your Password to Confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter your password"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                }
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                resolvedTheme === "dark"
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              disabled={loading}
            />
          </div>

          <p
            className={`text-xs mt-3 ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Click "Confirm" to proceed or "Cancel" to go back.
          </p>
        </div>

        {/* Footer */}
        <div
          className={`flex gap-3 p-4 border-t ${
            resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              resolvedTheme === "dark"
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !password.trim()}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors text-white ${
              confirmationType === "reset"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-orange-600 hover:bg-orange-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
