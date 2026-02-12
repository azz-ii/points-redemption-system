import { useState } from "react";
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
      <div
        className="bg-card rounded-lg shadow-xl max-w-2xl w-full border border-border max-h-[85vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-processed-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 id="mark-processed-title" className="text-lg font-semibold">
                Mark Items as Processed
              </h2>
              <p className="text-sm text-muted-foreground">
                Request #{request.id}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              You are about to mark <span className="font-semibold text-foreground">{pendingCount} item(s)</span> as processed.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Items to be processed
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg border bg-muted/50 border-border"
                >
                  <p className="font-medium text-sm">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Code: {item.product_code} • Qty: {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This action will mark all your pending items in this request as processed.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Cancel marking items as processed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
            aria-label="Confirm marking items as processed"
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
