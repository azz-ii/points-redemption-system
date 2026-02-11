import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { RequestTimeline } from "@/components/modals";
import { fetchWithCsrf } from "@/lib/csrf";
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
  const [imageLoading, setImageLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  if (!isOpen || !item || !request) return null;

  const imageUrl = "/images/tshirt.png";
  const normalizedStatus = request.status.toUpperCase();

  // Check if request can be withdrawn:
  // - Status must be PENDING
  // - Sales approval must NOT be APPROVED
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

  // Determine status display based on approval and processing status
  const getStatusDisplay = () => {
    if (normalizedStatus === "APPROVED") {
      if (request.processing_status === "PROCESSED") {
        return {
          label: "Processed",
          colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-500 dark:text-white",
          withTooltip: false,
        };
      }
      if (request.processing_status === "CANCELLED") {
        return {
          label: "Cancelled",
          colorClass: "bg-red-100 text-red-700 dark:bg-red-500 dark:text-white",
          withTooltip: true,
          tooltipText: "An Admin Has Cancelled this Request",
        };
      }
      return {
        label: "Approved",
        colorClass: "bg-green-100 text-green-700 dark:bg-green-500 dark:text-black",
        withTooltip: false,
      };
    }

    if (normalizedStatus === "PENDING") {
      return {
        label: "Pending",
        colorClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-400 dark:text-black",
        withTooltip: false,
      };
    }

    return {
      label: "Rejected",
      colorClass: "bg-red-100 text-red-700 dark:bg-red-500 dark:text-white",
      withTooltip: false,
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <TooltipProvider>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
        <div
          className="bg-card rounded-lg shadow-2xl max-w-2xl w-full border divide-y border-border divide-border"
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-redemption-status-title"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-8">
            <div>
              <h2 id="view-redemption-status-title" className="text-xl font-semibold">
                Redemption Item Details
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Request #{request.id}
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
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="md:flex md:gap-6">
              {/* Image */}
              <div className="overflow-hidden rounded-lg md:w-1/2 relative">
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse" />
                )}
                <img
                  src={imageUrl}
                  alt={item.product_name}
                  onLoad={() => setImageLoading(false)}
                  onError={(e) => {
                    e.currentTarget.src = "/images/tshirt.png";
                    setImageLoading(false);
                  }}
                  className={`w-full h-auto object-cover transition-opacity duration-300 ${
                    imageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  loading="lazy"
                />
              </div>

              {/* Details */}
              <div className="md:w-1/2 mt-4 md:mt-0 space-y-4">
                {/* Item Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Item Information
                  </h3>
                  <p
                    className="text-sm font-semibold text-green-600 dark:text-green-400"
                  >
                    {item.product_code}
                  </p>
                  <h4 className="text-xl font-bold">{item.product_name}</h4>
                  {item.category && (
                    <p className="text-sm text-muted-foreground">
                      {item.category}
                    </p>
                  )}
                </div>

                {/* Order Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Order Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Quantity</label>
                      <p className="text-sm font-medium">{item.quantity} unit{item.quantity !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Points per Item</label>
                      <p className="text-sm font-medium">{item.points_per_item} points</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </h3>
                  {statusDisplay.withTooltip ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-help ${statusDisplay.colorClass}`}
                        >
                          {statusDisplay.label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{statusDisplay.tooltipText}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.colorClass}`}
                    >
                      {statusDisplay.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Total Points Bar */}
            <div
              className="flex items-center justify-between rounded-lg px-4 py-3 bg-muted"
            >
              <p className="text-sm text-foreground">
                Total for this item
              </p>
              <p
                className="text-sm font-bold text-yellow-600 dark:text-yellow-300"
              >
                {item.total_points} Points
              </p>
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
          <div className="p-8 flex justify-between items-center">
            {withdrawError && (
              <p className="text-destructive text-sm">{withdrawError}</p>
            )}
            <div className="flex gap-3 ml-auto">
              {canWithdraw && (
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="px-6 py-3 rounded-lg font-semibold transition-colors bg-destructive hover:bg-destructive/90 text-white"
                >
                  Cancel Request
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border"
              >
                Close
              </button>
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
