import { useState } from "react";
import { Package, CheckCircle, Loader2, X } from "lucide-react";
import type { ModalBaseProps, RedemptionItem, RequestItemVariant } from "./types";

interface MarkAsProcessedModalProps extends ModalBaseProps {
  item: RedemptionItem | null;
  myItems?: RequestItemVariant[];
  pendingCount?: number;
  onConfirm: ((remarks?: string) => Promise<void>) | (() => Promise<void>);
}

export function MarkAsProcessedModal({
  isOpen,
  onClose,
  item,
  myItems = [],
  pendingCount = 0,
  onConfirm,
}: MarkAsProcessedModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

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
  const pendingItems = myItems.filter(it => !it.item_processed_by);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-md w-full border divide-y border-border divide-gray-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-processed-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 id="mark-processed-title" className="text-lg font-semibold">
                Mark Items as Processed
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Request #{item.id}
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
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-sm">
            You are about to mark <span className="font-semibold">{pendingCount} item(s)</span> as processed.
          </p>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Items to be processed
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {pendingItems.map((it) => (
                <div
                  key={it.id}
                  className="p-3 rounded border text-sm bg-card border-border"
                >
                  <p className="font-medium">{it.product_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {it.quantity} • {it.product_code}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded text-sm bg-blue-900/30 border border-blue-800">
            <p className="text-blue-700 dark:text-blue-300">
              This action will mark all your pending items in this request as processed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 bg-card hover:bg-accent text-foreground border border-gray-600"
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
