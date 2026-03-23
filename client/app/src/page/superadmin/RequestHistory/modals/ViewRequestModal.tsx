import { getStatusClasses } from "@/components/ui/status-badge";
import { X, Package, CheckCircle, FileText, ExternalLink } from "lucide-react";
import { RequestTimeline } from "@/components/modals";
import { ProcessingPhotosGallery } from "@/components/ProcessingPhotosGallery";
import type { RequestHistoryItem } from "./types";

function normalizeMediaUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

interface ViewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RequestHistoryItem | null;
}

export function ViewRequestModal({
  isOpen,
  onClose,
  item,
}: ViewRequestModalProps) {
  if (!isOpen || !item) return null;

return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700 max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-request-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-request-title" className="text-xl font-semibold">
              Processed Request Details
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Request #{item.id}
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
        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Request Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Requested For</label>
                <p className="font-semibold">{item.requested_for_name}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Total Points</label>
                <p className="font-semibold">{item.total_points.toLocaleString()} pts</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Status
            </h3>
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Approval Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                    item.status
                  )}`}
                >
                  {item.status_display || item.status}
                </span>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Processing Status</label>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                  {item.processing_status_display || "Processed"}
                </span>
              </div>
            </div>
          </div>

          {/* Request Timeline */}
          <RequestTimeline
            data={{
              requested_by_name: item.requested_by_name,
              date_requested: item.date_requested,
              reviewed_by_name: item.reviewed_by_name,
              date_reviewed: item.date_reviewed,
              requires_sales_approval: item.requires_sales_approval,
              sales_approval_status: item.sales_approval_status,
              sales_approved_by_name: item.sales_approved_by_name,
              sales_approval_date: item.sales_approval_date,
              sales_rejection_reason: item.sales_rejection_reason,
              requires_marketing_approval: item.requires_marketing_approval,
              marketing_approval_status: item.marketing_approval_status,
              marketing_approved_by_name: item.marketing_approved_by_name,
              marketing_approval_date: item.marketing_approval_date,
              marketing_rejection_reason: item.marketing_rejection_reason,
              processed_by_name: item.processed_by_name,
              date_processed: item.date_processed,
              cancelled_by_name: item.cancelled_by_name,
              date_cancelled: item.date_cancelled,
              remarks: item.remarks,
              rejection_reason: item.rejection_reason,
              status: item.status,
              processing_status: item.processing_status,
              ar_status: item.ar_status,
              ar_uploaded_by_name: item.ar_uploaded_by_name,
              ar_uploaded_at: item.ar_uploaded_at,
              requested_for_type: item.requested_for_type,
            }}
            showProcessing={true}
            showCancellation={true}
          />

          {/* Acknowledgement Receipt */}
          {item.ar_status === "UPLOADED" && item.acknowledgement_receipt && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Acknowledgement Receipt {item.ar_number ? `(${item.ar_number})` : ''}
              </h3>
              {item.acknowledgement_receipt.toLowerCase().endsWith(".pdf") ? (
                <a
                  href={normalizeMediaUrl(item.acknowledgement_receipt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                >
                  <FileText className="w-5 h-5 text-primary" />
                  <span>View Signed AR Document</span>
                  <ExternalLink className="w-4 h-4 ml-1 text-muted-foreground" />
                </a>
              ) : (
                <div className="border rounded-lg overflow-hidden border-border inline-block">
                  <img
                    src={normalizeMediaUrl(item.acknowledgement_receipt)}
                    alt="Acknowledgement Receipt"
                    className="max-w-full max-h-64 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Processing Photos */}
          {item.processing_photos && item.processing_photos.length > 0 && (
            <ProcessingPhotosGallery photos={item.processing_photos} />
          )}

          {/* Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              <Package className="inline h-4 w-4 mr-1" />
              Items ({item.items.length})
            </h3>
            <div className="space-y-2">
              {item.items.map((it) => (
                <div
                  key={it.id}
                  className="p-3 rounded border bg-card border-border"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{it.product_name}</p>
                      {it.product_code && (
                        <p className="text-xs text-muted-foreground">
                          Code: {it.product_code}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Legend: {it.item_legend || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Qty: {it.quantity} × {it.points_per_item} pts = {it.total_points} pts
                      </p>
                      {it.extra_data && Object.keys(it.extra_data).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 border-t border-border/50 pt-2 pb-1">
                          {Object.entries(it.extra_data).map(([key, value]) => {
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
                      {it.item_processed_by_name ? (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Processed by: {it.item_processed_by_name}
                          {it.item_processed_at && (
                            <span className="ml-1">
                              on {new Date(it.item_processed_at).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      ) : (it.fulfilled_quantity ?? 0) > 0 ? (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Partially processed: {it.fulfilled_quantity}/{it.quantity} units
                        </p>
                      ) : null}
                    </div>
                    {it.is_fully_fulfilled ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Processed
                      </span>
                    ) : (it.fulfilled_quantity ?? 0) > 0 ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Partial
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
