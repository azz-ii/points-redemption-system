import { CheckCircle, X } from "lucide-react";
import type { FlattenedRequestItem } from "../modals/types";

interface BulkMarkProcessedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  items: FlattenedRequestItem[];
  isSubmitting: boolean;
}

const BulkMarkProcessedModal = ({
  isOpen,
  onClose,
  onConfirm,
  items,
  isSubmitting,
}: BulkMarkProcessedModalProps) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Bulk Mark as Processed</h2>
              <p className="text-sm text-muted-foreground">
                Mark {items.length} item{items.length !== 1 ? "s" : ""} as processed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
                Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                You are about to mark the following items as processed. Each item will be
                fulfilled for its full remaining quantity.
              </p>
            </div>

            {/* Items List */}
            <div>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">
                Items to Process
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={`${item.requestId}-${item.id}`}
                    className="rounded-lg border border-border bg-muted/50 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Code: {item.product_code} • Qty: {item.quantity} • Points: {item.total_points}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Request: #{item.requestId} • Customer: {item.requested_for_name}
                        </p>
                        {/* Show partial fulfillment progress if applicable */}
                        {(item.fulfilled_quantity ?? 0) > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Fulfilled so far: {item.fulfilled_quantity} / {item.quantity}</span>
                              <span>Will fulfill: {item.remaining_quantity ?? item.quantity}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${Math.round(((item.fulfilled_quantity ?? 0) / item.quantity) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirm Processing
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkMarkProcessedModal;
