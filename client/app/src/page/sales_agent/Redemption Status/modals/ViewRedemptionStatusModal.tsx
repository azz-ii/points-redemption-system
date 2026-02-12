import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { RequestTimeline } from "@/components/modals";
import { fetchWithCsrf } from "@/lib/csrf";
import { StatusChip } from "../components/StatusChip";
import type { ViewRedemptionStatusModalProps } from "./types";

export interface WithdrawConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  requestId: number;
  isSubmitting: boolean;
}

export function WithdrawConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  requestId,
  isSubmitting,
}: WithdrawConfirmationModalProps) {
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
        className="bg-card rounded-lg shadow-2xl max-w-md w-full border border-border"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="withdraw-confirmation-title"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-500/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 id="withdraw-confirmation-title" className="text-lg font-semibold">
                Cancel Request #{requestId}?
              </h3>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>

          <p className="text-sm mb-4 text-foreground">
            Are you sure you want to cancel this redemption request? The committed stock will be released back to inventory.
          </p>

          <div className="mb-4">
            <label
              htmlFor="withdrawal-reason"
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Reason for cancellation <span className="text-destructive">*</span>
            </label>
            <textarea
              id="withdrawal-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're cancelling this request..."
              rows={3}
              className={`w-full px-3 py-2 rounded-lg border text-sm resize-none bg-card border-border text-foreground placeholder-muted-foreground ${error ? "border-red-500" : ""}`}
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-destructive text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border disabled:opacity-50"
            >
              Keep Request
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
                "Yes, Cancel Request"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ViewRedemptionStatusModal({
  isOpen,
  onClose,
  item,
  request,
  onRequestWithdrawn,
}: ViewRedemptionStatusModalProps & { onRequestWithdrawn?: () => void }) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const normalizedStatus = request.status.toUpperCase();

  // Check if request can be withdrawn
  const canWithdraw =
    normalizedStatus === "PENDING" &&
    request.sales_approval_status !== "APPROVED";

  const handleWithdraw = async (reason: string) => {
    setIsSubmitting(true);
    setWithdrawError(null);
    try {
      const response = await fetchWithCsrf(`/api/redemption-requests/${request.id}/withdraw_request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawal_reason: reason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel request");
      }

      setShowWithdrawModal(false);
      onClose();
      onRequestWithdrawn?.();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "Failed to cancel request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm">
        <div
          className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-border"
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-redemption-status-title"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6">
            <div>
              <h2 id="view-redemption-status-title" className="text-xl font-semibold">
                Request Details
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Request #{request.id} • {new Date(request.date_requested).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="hover:opacity-70 transition-opacity"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Customer Name</label>
                  <p className="text-sm font-medium">{request.requested_for_name}</p>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Requested By</label>
                  <p className="text-sm font-medium">{request.requested_by_name}</p>
                </div>
                {request.team_name && (
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Team</label>
                    <p className="text-sm font-medium">{request.team_name}</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Points Source</label>
                  <p className="text-sm font-medium">{request.points_deducted_from_display}</p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Items ({request.items.length})
              </h3>
              <div className="border rounded-lg overflow-hidden border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Item</th>
                        <th className="text-left p-3 font-semibold">Code</th>
                        <th className="text-right p-3 font-semibold">Qty</th>
                        <th className="text-right p-3 font-semibold">Points/Item</th>
                        <th className="text-right p-3 font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {request.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              {item.category && (
                                <p className="text-xs text-muted-foreground">{item.category}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-muted text-foreground">
                              {item.product_code}
                            </span>
                          </td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">{item.points_per_item}</td>
                          <td className="p-3 text-right font-semibold">{item.total_points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Total Points */}
            <div className="flex items-center justify-between rounded-lg px-4 py-3 bg-muted">
              <p className="text-sm font-semibold text-foreground">
                Total Points for Request
              </p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {request.total_points} Points
              </p>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Current Status
              </h3>
              <StatusChip 
                status={request.status as any} 
                processingStatus={request.processing_status as any} 
              />
            </div>

            {/* Request Timeline */}
            <RequestTimeline
              data={{
                requested_by_name: request.requested_by_name,
                date_requested: request.date_requested,
                reviewed_by_name: request.reviewed_by_name,
                date_reviewed: request.date_reviewed,
                requires_sales_approval: request.requires_sales_approval,
                sales_approval_status: request.sales_approval_status,
                sales_approved_by_name: request.sales_approved_by_name,
                sales_approval_date: request.sales_approval_date,
                sales_rejection_reason: request.sales_rejection_reason,
                requires_marketing_approval: request.requires_marketing_approval,
                marketing_approval_status: request.marketing_approval_status,
                marketing_approved_by_name: request.marketing_approved_by_name,
                marketing_approval_date: request.marketing_approval_date,
                marketing_rejection_reason: request.marketing_rejection_reason,
                processed_by_name: request.processed_by_name,
                date_processed: request.date_processed,
                cancelled_by_name: request.cancelled_by_name,
                date_cancelled: request.date_cancelled,
                remarks: request.remarks,
                rejection_reason: request.rejection_reason,
                status: request.status,
                processing_status: request.processing_status,
              }}
              showProcessing={true}
              showCancellation={true}
            />
          </div>

          {/* Footer */}
          <div className="p-6">
            {withdrawError && (
              <p className="text-destructive text-sm mb-3">{withdrawError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border"
              >
                Close
              </button>
              {canWithdraw && (
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-colors bg-destructive hover:bg-destructive/90 text-white"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>

        <WithdrawConfirmationModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          onConfirm={handleWithdraw}
          requestId={request.id}
          isSubmitting={isSubmitting}
        />
      </div>
    </TooltipProvider>
  );
}
