import { useState } from "react";
import { X, Package, CheckCircle, Clock, ChevronDown } from "lucide-react";
import { RequestTimeline } from "@/components/modals";
import { ProcessingPhotosGallery } from "@/components/ProcessingPhotosGallery";
import type { ModalBaseProps, RequestItem } from "./types";

interface ViewHistoryModalProps extends ModalBaseProps {
  request: RequestItem | null;
}

export function ViewHistoryModal({
  isOpen,
  onClose,
  request,
}: ViewHistoryModalProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItemExpand = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  if (!isOpen || !request) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-800/50 dark:text-yellow-300";
      case "APPROVED":
        return "bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300";
      case "REJECTED":
        return "bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-900/40 dark:border-rose-800/50 dark:text-rose-300";
      default:
        return "bg-slate-100 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700/50 dark:text-slate-300";
    }
  };

  const getProcessingStatusColor = (status: string) => {
    switch (status) {
      case "NOT_PROCESSED":
        return "bg-zinc-100 border border-zinc-200 text-zinc-800 dark:bg-zinc-900/40 dark:border-zinc-800/50 dark:text-zinc-300";
      case "PROCESSED":
        return "bg-blue-100 border border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800/50 dark:text-blue-300";
      case "CANCELLED":
        return "bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-900/40 dark:border-rose-800/50 dark:text-rose-300";
      default:
        return "bg-slate-100 border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700/50 dark:text-slate-300";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
      <div
        className="bg-card rounded-lg shadow-xl max-w-3xl w-full border border-border max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-history-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 id="view-history-title" className="text-lg font-semibold">
                Request Details
              </h2>
              <p className="text-sm text-muted-foreground">
                Request #{request.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 divide-y divide-border">
          {/* Request Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Requested By</label>
                <p className="font-semibold">{request.requested_by_name}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Requested For</label>
                <p className="font-semibold">{request.requested_for_name}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Total Points</label>
                <p className="font-semibold">{request.total_points.toLocaleString()} pts</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Date Requested</label>
                <p className="font-semibold">
                  {new Date(request.date_requested).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4 pt-6">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              Status
            </h3>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Approval Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                    request.status
                  )}`}
                >
                  {request.status_display}
                </span>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Processing Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getProcessingStatusColor(
                    request.processing_status
                  )}`}
                >
                  {request.processing_status_display}
                </span>
              </div>
            </div>
            {request.date_processed && (
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Date Processed</label>
                <p className="font-semibold">
                  {new Date(request.date_processed).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Request Timeline */}
          <div className="pt-6">
            <RequestTimeline
              data={{
                requested_by_name: request.requested_by_name,
                date_requested: request.date_requested,
                reviewed_by_name: request.reviewed_by_name,
                date_reviewed: request.date_reviewed,
                requires_marketing_approval: request.requires_marketing_approval,
                marketing_approval_status: request.marketing_approval_status,
                marketing_approved_by_name: request.marketing_approved_by_name,
                marketing_approval_date: request.marketing_approval_date,
                marketing_rejection_reason: request.marketing_rejection_reason,
                processed_by_name: request.processed_by_name,
                date_processed: request.date_processed,
                cancelled_by_name: request.cancelled_by_name,
                date_cancelled: request.date_cancelled,
                initial_remarks: request.initial_remarks,
                approver_remarks: request.approver_remarks,
                processing_remarks: request.processing_remarks,
                rejection_reason: request.rejection_reason,
                status: request.status,
                processing_status: request.processing_status,
                ar_status: request.ar_status,
                ar_uploaded_by_name: request.ar_uploaded_by_name,
                ar_uploaded_at: request.ar_uploaded_at,
                requested_for_type: request.requested_for_type,
              }}
              showProcessing={true}
              showCancellation={true}
            />
          </div>

          {/* Processing Photos */}
          {request.processing_photos && request.processing_photos.length > 0 && (
            <div className="pt-6">
              <ProcessingPhotosGallery photos={request.processing_photos} />
            </div>
          )}

          {/* Items */}
          <div className="space-y-4 pt-6">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
              <Package className="inline h-4 w-4 mr-1" />
              Items ({request.items.length})
            </h3>
            <div className="space-y-2">
              {request.items.map((item) => {
                const isFixed = !item.pricing_type || item.pricing_type === "FIXED";
                const fulfilledQty = item.fulfilled_quantity ?? 0;
                const isFullyProcessed = !!item.item_processed_by;
                const isPartial = !isFullyProcessed && fulfilledQty > 0;
                const logs = item.fulfillment_logs ?? [];
                const isExpanded = expandedItems.has(item.id);
                const hasLogs = logs.length > 0;

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-muted/50 border-border overflow-hidden"
                  >
                    {/* Item Header - always visible */}
                    <div className="p-4">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{item.product_name}</p>
                          {item.product_code && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Code: {item.product_code}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Qty: {item.quantity} × {item.points_per_item} pts ={" "}
                            {item.total_points} pts
                          </p>
                          
                          {item.extra_data && Object.keys(item.extra_data).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5 border-t border-border/50 pt-2 pb-1">
                              {Object.entries(item.extra_data).map(([key, value]) => {
                                if (value === null || value === undefined || value === '') return null;
                                let displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                                let displayValue = String(value);
                                if (key === 'driver_type') {
                                  displayKey = 'Driver';
                                  displayValue = value === 'WITH_DRIVER' ? 'With Driver' : 'Without Driver';
                                } else if (key === 'driver_name') displayKey = 'Driver Name';
                                else if (key === 'invoice_amount') displayKey = 'Amount';
                                
                                return (
                                  <span key={key} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground border border-border">
                                    {displayKey}: {displayValue}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Status Badge */}
                        {isFullyProcessed ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold shrink-0">
                            <CheckCircle className="h-4 w-4" />
                            Processed
                          </span>
                        ) : isPartial ? (
                          <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
                            Partial ({fulfilledQty}/{item.quantity})
                          </span>
                        ) : null}
                      </div>

                      {/* Progress bar for FIXED items with any fulfillment */}
                      {isFixed && fulfilledQty > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Fulfilled: {fulfilledQty} / {item.quantity}</span>
                            {!isFullyProcessed && (
                              <span>{(item.remaining_quantity ?? 0)} remaining</span>
                            )}
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isFullyProcessed ? "bg-green-500" : "bg-amber-500"}`}
                              style={{ width: `${Math.round((fulfilledQty / item.quantity) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Original "Processed by" text display - keeping for backward compatibility */}
                      {item.item_processed_by_name && !hasLogs && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Processed by: {item.item_processed_by_name}
                        </p>
                      )}
                    </div>

                    {/* Fulfillment History - Collapsible */}
                    {hasLogs && (
                      <div className="border-t border-border/50">
                        <button
                          onClick={() => toggleItemExpand(item.id)}
                          className="w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                          aria-expanded={isExpanded}
                        >
                          <span className="text-xs font-medium text-muted-foreground">
                            Fulfillment History ({logs.length} pass{logs.length !== 1 ? 'es' : ''})
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="px-4 pb-3 pt-1 space-y-2 bg-muted/25 border-t border-border/50">
                            {logs.map((log, idx) => (
                              <div
                                key={log.id}
                                className="flex items-start gap-2 text-xs text-muted-foreground"
                              >
                                <Clock className="h-3 w-3 mt-0.5 shrink-0 text-primary/60" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium">
                                    Pass #{idx + 1}: {log.fulfilled_quantity > 0 ? `${log.fulfilled_quantity} units` : "Fully processed"} by{" "}
                                    <span className="text-primary/80">{log.fulfilled_by_name ?? "Unknown"}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground/80 mt-0.5">
                                    {new Date(log.fulfilled_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                  {log.notes && (
                                    <div className="text-xs text-muted-foreground mt-1 border-l-2 border-primary/30 pl-2 italic">
                                      "{log.notes}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
            aria-label="Close request details"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
