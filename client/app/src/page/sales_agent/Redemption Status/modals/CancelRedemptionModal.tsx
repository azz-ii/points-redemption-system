import { useState } from "react";
import { useTheme } from "next-themes";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { redemptionRequestsApi } from "@/lib/api";
import type { RedemptionRequest } from "./types";

interface CancelRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RedemptionRequest | null;
  onSuccess: () => void;
}

export function CancelRedemptionModal({
  isOpen,
  onClose,
  request,
  onSuccess,
}: CancelRedemptionModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [withdrawalReason, setWithdrawalReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleSubmit = async () => {
    if (!withdrawalReason.trim()) {
      setError("Please provide a reason for withdrawing this request");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await redemptionRequestsApi.withdrawRequest(
        request.id,
        withdrawalReason.trim(),
        remarks.trim() || undefined
      );
      
      // Reset form
      setWithdrawalReason("");
      setRemarks("");
      
      // Notify parent of success
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to withdraw request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setWithdrawalReason("");
      setRemarks("");
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative mx-4 w-full max-w-md rounded-xl shadow-2xl ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isDark ? "bg-red-500/20" : "bg-red-100"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  isDark ? "text-red-400" : "text-red-600"
                }`}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Withdraw Request</h2>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Request #{request.id}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`p-2 rounded-md transition-colors ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Request Info Summary */}
          <div
            className={`p-3 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <p className="text-sm">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                Distributor:{" "}
              </span>
              <span className="font-medium">{request.requested_for_name}</span>
            </p>
            <p className="text-sm mt-1">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                Total Points:{" "}
              </span>
              <span className="font-medium">{request.total_points} pts</span>
            </p>
            <p className="text-sm mt-1">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                Items:{" "}
              </span>
              <span className="font-medium">{request.items.length} item(s)</span>
            </p>
          </div>

          {/* Warning */}
          <div
            className={`p-3 rounded-lg border ${
              isDark
                ? "bg-red-500/10 border-red-500/30"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p
              className={`text-sm ${
                isDark ? "text-red-200" : "text-red-800"
              }`}
            >
              Withdrawing this request will remove it from pending review. You
              can submit a new request later if needed.
            </p>
          </div>

          {/* Withdrawal Reason */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Reason for Withdrawal <span className="text-red-500">*</span>
            </label>
            <textarea
              value={withdrawalReason}
              onChange={(e) => setWithdrawalReason(e.target.value)}
              placeholder="Please explain why you're withdrawing this request..."
              rows={3}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-500"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Remarks (Optional) */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Additional Remarks{" "}
              <span className={isDark ? "text-gray-500" : "text-gray-400"}>
                (Optional)
              </span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 rounded-lg border outline-none transition-colors ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-yellow-500"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`p-3 rounded-lg ${
                isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700"
              }`}
            >
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-3 p-4 border-t ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !withdrawalReason.trim()}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isDark
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            } ${
              isSubmitting || !withdrawalReason.trim()
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Withdrawing...
              </>
            ) : (
              "Withdraw Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
