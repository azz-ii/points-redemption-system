import { useState } from "react";
import { useTheme } from "next-themes";
import { Package, CheckCircle, Loader2 } from "lucide-react";
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
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 id="mark-processed-title" className="text-xl font-semibold">
              Mark Items as Processed
            </h2>
          </div>

          <p className="text-sm mb-4">
            You are about to mark <span className="font-semibold">{pendingCount} item(s)</span> as processed for request{" "}
            <span className="font-semibold">#{request.id}</span>.
          </p>

          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Items to be processed:
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-2 rounded border text-sm ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <p className="font-medium">{item.catalogue_item_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {item.quantity} • {item.variant_code}
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

        <div className="p-8 border-t flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className={`flex-1 py-3 rounded font-semibold transition-colors disabled:opacity-50 ${
              resolvedTheme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
