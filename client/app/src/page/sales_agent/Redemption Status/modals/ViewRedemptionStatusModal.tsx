import { useEffect, useState } from "react";
import {
  X,
  AlertTriangle,
  Loader2,
  FileText,
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AcknowledgementReceiptPreview } from "@/components/AcknowledgementReceiptPreview";
import { RequestTimeline } from "@/components/modals";
import { ProcessingPhotosGallery } from "@/components/ProcessingPhotosGallery";
import { fetchWithCsrf } from "@/lib/csrf";
import { StatusChip } from "../components/StatusChip";
import { AcknowledgementReceiptModal } from "./AcknowledgementReceiptModal";
import { EditRedemptionRequestModal } from "./EditRedemptionRequestModal.tsx";
import type { ViewRedemptionStatusModalProps } from "./types";

function normalizeMediaUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    // If the URL points to the local MEDIA path, route it through the
    // Django API media endpoint so it bypasses IIS static routing issues.
    if (parsed.pathname.startsWith("/media/")) {
      return `${window.location.origin}/api/media${parsed.pathname.replace(/^\/media/, "")}${parsed.search}${parsed.hash}`;
    }
    if (parsed.pathname.startsWith("/api/media/")) {
      return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    if (url.startsWith("/media/")) {
      return `${window.location.origin}/api/media${url.replace(/^\/media/, "")}`;
    }
    if (url.startsWith("/api/media/")) {
      return `${window.location.origin}${url}`;
    }
    if (url.startsWith("/")) {
      return `${window.location.origin}${url}`;
    }
    return url;
  }
}

function getMediaFilename(url: string, fallback: string): string {
  const trimmed = url.split("?")[0].split("#")[0];
  const filename = trimmed.split("/").pop();
  return filename || fallback;
}

async function downloadMediaFile(url: string, filename: string) {
  const response = await fetch(normalizeMediaUrl(url), {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to download file");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

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
              <h3
                id="withdraw-confirmation-title"
                className="text-lg font-semibold"
              >
                Cancel Request #{requestId}?
              </h3>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>

          <p className="text-sm mb-4 text-foreground">
            Are you sure you want to cancel this redemption request? The
            committed stock will be released back to inventory.
          </p>

          <div className="mb-4">
            <label
              htmlFor="withdrawal-reason"
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Reason for cancellation{" "}
              <span className="text-destructive">*</span>
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
            {error && <p className="text-destructive text-sm mt-1">{error}</p>}
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
  request,
  onRequestWithdrawn,
  username,
  userPosition,
  onApprove,
  onReject,
}: ViewRedemptionStatusModalProps & { onRequestWithdrawn?: () => void }) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showARModal, setShowARModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [arError, setArError] = useState<string | null>(null);
  const [displayRequest, setDisplayRequest] = useState(request);

  useEffect(() => {
    setDisplayRequest(request);
    setArError(null);
  }, [request]);

  if (!isOpen || !displayRequest) return null;

  const normalizedStatus = displayRequest.status.toUpperCase();
  const isOwnRequest = displayRequest.requested_by_username === username;

  // Check if request can be withdrawn
  const canWithdraw =
    normalizedStatus === "PENDING" &&
    displayRequest.sales_approval_status !== "APPROVED" &&
    isOwnRequest;

  // Check if request can be approved/rejected
  const canApproveReject =
    normalizedStatus === "PENDING" &&
    userPosition?.toLowerCase() === "approver" &&
    !isOwnRequest;

  const canEdit =
    Boolean(displayRequest.is_editable) &&
    normalizedStatus === "PENDING" &&
    displayRequest.processing_status === "NOT_PROCESSED" &&
    isOwnRequest;

  // Show AR button when AR needs to be uploaded
  const canShowAR =
    displayRequest.processing_status === "PROCESSED" &&
    displayRequest.ar_status === "PENDING";

  const handleWithdraw = async (reason: string) => {
    setIsSubmitting(true);
    setWithdrawError(null);
    try {
      const response = await fetchWithCsrf(
        `/api/redemption-requests/${displayRequest.id}/withdraw_request/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ withdrawal_reason: reason }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel request");
      }

      setShowWithdrawModal(false);
      onClose();
      onRequestWithdrawn?.();
    } catch (err) {
      setWithdrawError(
        err instanceof Error ? err.message : "Failed to cancel request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArDownload = async () => {
    if (!displayRequest.acknowledgement_receipt) return;

    setArError(null);
    try {
      const filename = getMediaFilename(
        displayRequest.acknowledgement_receipt,
        `AR-${displayRequest.ar_number || displayRequest.id}.pdf`,
      );
      await downloadMediaFile(
        displayRequest.acknowledgement_receipt,
        filename,
      );
    } catch (error) {
      setArError(
        error instanceof Error ? error.message : "Failed to download file",
      );
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm">
        <div
          className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-redemption-status-title"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2
                  id="view-redemption-status-title"
                  className="text-xl font-semibold"
                >
                  Request Details
                </h2>
                <StatusChip
                  status={displayRequest.status}
                  processingStatus={displayRequest.processing_status}
                  arStatus={displayRequest.ar_status}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Request #{displayRequest.id} •{" "}
                {new Date(displayRequest.date_requested).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" },
                )}
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
          <div className="p-6 space-y-6 flex-1 overflow-y-auto min-h-0">
            {/* Receiver Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Receiver Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Receiver Name
                  </label>
                  <p className="text-sm font-medium">
                    {displayRequest.requested_for_name}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Requested By
                  </label>
                  <p className="text-sm font-medium">
                    {displayRequest.requested_by_name}
                  </p>
                </div>
                {displayRequest.team_name && (
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Team
                    </label>
                    <p className="text-sm font-medium">
                      {displayRequest.team_name}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Points Source
                  </label>
                  <p className="text-sm font-medium">
                    {displayRequest.points_deducted_from_display}
                  </p>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Items ({displayRequest.items.length})
              </h3>
              <div className="border rounded-lg overflow-hidden border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Item</th>
                        <th className="text-left p-3 font-semibold">Code</th>
                        <th className="text-right p-3 font-semibold">Qty</th>
                        <th className="text-right p-3 font-semibold">
                          Points/Item
                        </th>
                        <th className="text-right p-3 font-semibold">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRequest.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              {item.category && (
                                <p className="text-xs text-muted-foreground">
                                  {item.category}
                                </p>
                              )}
                              {item.extra_data &&
                                Object.keys(item.extra_data).length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {Object.entries(item.extra_data).map(
                                      ([key, value]) => {
                                        if (
                                          value === null ||
                                          value === undefined ||
                                          value === ""
                                        )
                                          return null;
                                        let displayKey =
                                          key.charAt(0).toUpperCase() +
                                          key.slice(1).replace(/_/g, " ");
                                        let displayValue = String(value);
                                        if (key === "driver_type") {
                                          displayKey = "Driver";
                                          displayValue =
                                            value === "WITH_DRIVER"
                                              ? "With Driver"
                                              : "Without Driver";
                                        } else if (key === "driver_name")
                                          displayKey = "Driver Name";
                                        else if (key === "invoice_amount")
                                          displayKey = "Amount";

                                        return (
                                          <span
                                            key={key}
                                            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground border border-border"
                                          >
                                            {displayKey}: {displayValue}
                                          </span>
                                        );
                                      },
                                    )}
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-muted text-foreground">
                              {item.product_code}
                            </span>
                          </td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">
                            {item.points_per_item}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {item.total_points}
                          </td>
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
                {displayRequest.total_points} Points
              </p>
            </div>

            {/* Request Timeline */}
            <RequestTimeline
              data={{
                requested_by_name: displayRequest.requested_by_name,
                date_requested: displayRequest.date_requested,
                reviewed_by_name: displayRequest.reviewed_by_name,
                date_reviewed: displayRequest.date_reviewed,
                requires_marketing_approval:
                  displayRequest.requires_marketing_approval,
                marketing_approval_status:
                  displayRequest.marketing_approval_status,
                marketing_approved_by_name:
                  displayRequest.marketing_approved_by_name,
                marketing_approval_date: displayRequest.marketing_approval_date,
                marketing_rejection_reason:
                  displayRequest.marketing_rejection_reason,
                withdrawal_reason: displayRequest.withdrawal_reason,
                processed_by_name: displayRequest.processed_by_name,
                date_processed: displayRequest.date_processed,
                cancelled_by_name: displayRequest.cancelled_by_name,
                date_cancelled: displayRequest.date_cancelled,
                initial_remarks: displayRequest.initial_remarks,
                approver_remarks: displayRequest.approver_remarks,
                processing_remarks: displayRequest.processing_remarks,
                rejection_reason: displayRequest.rejection_reason,
                status: displayRequest.status,
                processing_status: displayRequest.processing_status,
                ar_status: displayRequest.ar_status,
                ar_uploaded_by_name: displayRequest.ar_uploaded_by_name,
                ar_uploaded_at: displayRequest.ar_uploaded_at,
                requested_for_type: displayRequest.requested_for_type,
              }}
              showProcessing={true}
              showCancellation={true}
            />

            {/* Acknowledgement Receipt */}
            {displayRequest.ar_status === "UPLOADED" &&
              displayRequest.acknowledgement_receipt && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Acknowledgement Receipt{" "}
                    {displayRequest.ar_number
                      ? `(${displayRequest.ar_number})`
                      : ""}
                  </h3>
                  <AcknowledgementReceiptPreview
                    receiptUrl={displayRequest.acknowledgement_receipt}
                  />
                  {displayRequest.acknowledgement_receipt
                    .toLowerCase()
                    .endsWith(".pdf") && (
                    <button
                      type="button"
                      onClick={handleArDownload}
                      className="inline-flex items-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                    >
                      <FileText className="w-5 h-5 text-primary" />
                      <span>Download Signed AR Document</span>
                    </button>
                  )}
                </div>
              )}
            {arError && <p className="text-destructive text-sm">{arError}</p>}

            {/* Processing Photos */}
            {displayRequest.processing_photos &&
              displayRequest.processing_photos.length > 0 && (
                <ProcessingPhotosGallery
                  photos={displayRequest.processing_photos}
                />
              )}
          </div>

          {/* Footer */}
          <div className="p-6">
            {withdrawError && (
              <p className="text-destructive text-sm mb-3">{withdrawError}</p>
            )}
            <div className="flex gap-3 justify-end">
              {canApproveReject && onReject && (
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => onReject(displayRequest), 0);
                  }}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-colors bg-destructive hover:bg-destructive/90 text-white"
                >
                  Reject
                </button>
              )}
              {canApproveReject && onApprove && (
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(() => onApprove(displayRequest), 0);
                  }}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-colors bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve
                </button>
              )}
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
              {canEdit && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-colors bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Edit Request
                </button>
              )}
              {canShowAR && (
                <button
                  onClick={() => setShowARModal(true)}
                  className="px-6 py-2.5 rounded-lg font-semibold transition-colors bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Acknowledgement Receipt
                </button>
              )}
            </div>
          </div>
        </div>

        <WithdrawConfirmationModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          onConfirm={handleWithdraw}
          requestId={displayRequest.id}
          isSubmitting={isSubmitting}
        />

        <AcknowledgementReceiptModal
          isOpen={showARModal}
          onClose={() => setShowARModal(false)}
          request={displayRequest}
          onUploaded={() => {
            setShowARModal(false);
            onClose();
            onRequestWithdrawn?.();
          }}
        />

        <EditRedemptionRequestModal
          key={`${displayRequest.id}-${showEditModal ? "open" : "closed"}`}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          request={displayRequest}
          onSaved={(updatedRequest) => {
            setDisplayRequest(updatedRequest);
            setShowEditModal(false);
            onRequestWithdrawn?.();
          }}
        />
      </div>
    </TooltipProvider>
  );
}
