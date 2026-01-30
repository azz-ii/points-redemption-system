import { useState } from "react";
import { useTheme } from "next-themes";
import { Package, CheckCircle, Loader2, X } from "lucide-react";
import type { ModalBaseProps, RequestItem, RequestItemVariant } from "./types";

interface MarkItemsProcessedModalProps extends ModalBaseProps {
  request: RequestItem | null;
  myItems: RequestItemVariant[];
  pendingCount: number;
  onConfirm: () => Promise<void>;
}

export function MarkItemsProcessedModal({
  isOpen,
  onClose,
  request,
  myItems,
  pendingCount,
  onConfirm,
}: MarkItemsProcessedModalProps) {
  const { resolvedTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Filter to show only pending items
  const pendingItems = myItems.filter(item => !item.item_processed_by);

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
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 id="mark-processed-title" className="text-xl font-semibold">
                Mark Items as Processed
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Request #{request.id}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="hover:opacity-70 transition-opacity disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <p className="text-sm">
            You are about to mark <span className="font-semibold">{pendingCount} item(s)</span> as processed.
          </p>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Items to be processed
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded border text-sm ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {item.quantity} • {item.product_code}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-3 rounded text-sm ${
            resolvedTheme === "dark"
              ? "bg-blue-900/30 border border-blue-800"
              : "bg-blue-50 border border-blue-200"
          }`}>
            <p className="text-blue-700 dark:text-blue-300">
              This action will mark all your pending items in this request as processed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
              resolvedTheme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Mark as Processed
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
