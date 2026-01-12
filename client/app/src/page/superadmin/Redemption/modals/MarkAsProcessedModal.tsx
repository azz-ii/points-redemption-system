import { useState } from "react";
import { useTheme } from "next-themes";
import type { ModalBaseProps, RedemptionItem } from "./types";

interface MarkAsProcessedModalProps extends ModalBaseProps {
  item: RedemptionItem | null;
  onConfirm: (remarks: string) => void;
}

export function MarkAsProcessedModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: MarkAsProcessedModalProps) {
  const { resolvedTheme } = useTheme();
  const [remarks, setRemarks] = useState("");

  if (!isOpen || !item) return null;

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
        aria-labelledby="mark-processed-title"
      >
        <div className="p-8">
          <h2 id="mark-processed-title" className="text-xl font-semibold mb-4">
            Mark as Processed
          </h2>
          <p className="text-sm mb-4">
            Are you sure you want to mark this request for{" "}
            <span className="font-semibold">{item.requested_for_name}</span> as processed?
          </p>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="processed-remarks"
            >
              Remarks (Optional)
            </label>
            <textarea
              id="processed-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks..."
              className={`w-full px-4 py-3 rounded border text-base resize-none ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              }`}
              rows={3}
            />
          </div>
        </div>

        <div className="p-8 border-t flex gap-3">
          <button
            onClick={handleClose}
            className={`flex-1 py-3 rounded font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Mark as Processed
          </button>
        </div>
      </div>
    </div>
  );
}
