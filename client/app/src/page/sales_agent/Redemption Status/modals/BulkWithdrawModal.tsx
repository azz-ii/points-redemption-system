import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { BulkWithdrawModalProps } from "./types";

export function BulkWithdrawModal({
  isOpen,
  onClose,
  onConfirm,
  requests,
  isSubmitting,
}: BulkWithdrawModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }
    setError(null);
    await onConfirm(reason);
  };

  const handleClose = () => {
    setReason("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-md w-full border divide-y border-border divide-border"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bulk-withdraw-title"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/20">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 id="bulk-withdraw-title" className="text-lg font-semibold">
              Cancel {requests.length} Request{requests.length !== 1 ? 's' : ''}?
            </h3>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <p className="text-sm mb-4 text-foreground">
            Are you sure you want to cancel these {requests.length} redemption request{requests.length !== 1 ? 's' : ''}? 
            The committed stock will be released back to inventory.
          </p>

          {/* List of requests */}
          <div className="mb-4 p-3 rounded-lg bg-muted max-h-32 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Selected Requests:
            </p>
            <ul className="text-sm space-y-1">
              {requests.map((request) => (
                <li key={request.id} className="text-foreground">
                  Request #{request.id} - {request.requested_for_name} ({request.total_points} pts)
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label
              htmlFor="bulk-withdrawal-reason"
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Reason for cancellation <span className="text-destructive">*</span>
            </label>
            <textarea
              id="bulk-withdrawal-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're cancelling these requests..."
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border text-sm resize-none bg-card border-border text-foreground placeholder-muted-foreground ${
                error ? "border-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-destructive text-sm mt-1">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border disabled:opacity-50"
          >
            Keep Requests
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2 bg-destructive hover:bg-destructive/90 text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              `Yes, Cancel ${requests.length}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
