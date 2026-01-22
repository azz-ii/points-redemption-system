import { useState } from "react";
import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { ModalBaseProps, RequestItem } from "./types";

interface ApproveRequestModalProps extends ModalBaseProps {
  request: RequestItem | null;
  onConfirm: (remarks: string) => void;
}

export function ApproveRequestModal({
  isOpen,
  onClose,
  request,
  onConfirm,
}: ApproveRequestModalProps) {
  const { resolvedTheme } = useTheme();
  const [remarks, setRemarks] = useState("");

  if (!isOpen || !request) return null;

  const handleConfirm = () => {
    onConfirm(remarks);
    setRemarks("");
  };

  const handleClose = () => {
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-request-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="approve-request-title" className="text-xl font-semibold">
              Approve Request
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Request for {request.requested_for_name}
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
            Are you sure you want to approve this request for{" "}
            <span className="font-semibold">{request.requested_for_name}</span>?
          </p>

          <div>
            <label
              htmlFor="approve-remarks"
              className="text-xs text-gray-500 mb-2 block"
            >
              Remarks (Optional)
            </label>
            <textarea
              id="approve-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks..."
              className={`w-full px-4 py-3 rounded border resize-none ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              } focus:outline-none focus:border-blue-500`}
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex gap-3">
          <button
            onClick={handleClose}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-white hover:bg-gray-100 text-gray-900"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
