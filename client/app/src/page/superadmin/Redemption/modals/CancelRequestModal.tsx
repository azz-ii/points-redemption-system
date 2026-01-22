import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import type { ModalBaseProps, RedemptionItem } from "./types";

interface CancelRequestModalProps extends ModalBaseProps {
  item: RedemptionItem | null;
  onConfirm: (reason: string, remarks: string) => void;
}

export function CancelRequestModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: CancelRequestModalProps) {
  const { resolvedTheme } = useTheme();
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error("Cancellation reason is required");
      return;
    }
    onConfirm(reason, remarks);
    setReason("");
    setRemarks("");
  };

  const handleClose = () => {
    setReason("");
    setRemarks("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-md w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-request-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="cancel-request-title" className="text-xl font-semibold">
              Cancel Request
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              This action will refund points and restore stock.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <p className="text-sm">
            Are you sure you want to cancel this request for{" "}
            <span className="font-semibold">{item.requested_for_name}</span>?
          </p>

          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="cancel-reason"
              >
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className={`w-full px-4 py-3 rounded border text-base resize-none ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
                rows={3}
                aria-required="true"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                htmlFor="cancel-remarks"
              >
                Additional Remarks (Optional)
              </label>
              <textarea
                id="cancel-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any additional remarks..."
                className={`w-full px-4 py-3 rounded border text-base resize-none ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-red-600 hover:bg-red-700 text-white"
          >
            Cancel Request
          </button>
        </div>
      </div>
    </div>
  );
}
