import { getStatusClasses } from "@/components/ui/status-badge";
import { X } from "lucide-react";
import { RequestTimeline } from "@/components/modals";
import { ProcessingPhotosGallery } from "@/components/ProcessingPhotosGallery";
import type { ModalBaseProps, RequestItem } from "./types";

interface ViewRequestModalProps extends ModalBaseProps {
  request: RequestItem | null;
  onApprove?: (request: RequestItem) => void;
  onReject?: (request: RequestItem) => void;
}

export function ViewRequestModal({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}: ViewRequestModalProps) {
  if (!isOpen || !request) return null;

return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-request-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-request-title" className="text-xl font-semibold">
              Request Details
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
        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Request Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Requested For</label>
                <p className="font-semibold">{request.requested_for_name}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Total Points</label>
                <p className="font-semibold">{request.total_points.toLocaleString()} pts</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Status
            </h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                request.status
              )}`}
            >
              {request.status_display}
            </span>
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
              ar_status: request.ar_status,
              ar_uploaded_by_name: request.ar_uploaded_by_name,
              ar_uploaded_at: request.ar_uploaded_at,
            }}
            showProcessing={true}
            showCancellation={true}
          />

          {/* Processing Photos */}
          {request.processing_photos && request.processing_photos.length > 0 && (
            <ProcessingPhotosGallery photos={request.processing_photos} />
          )}

          {/* Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Items ({request.items.length})
            </h3>
            <div className="space-y-2">
              {request.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded border bg-muted border-border"
                >
                  <p className="font-semibold">{item.product_name}</p>
                  {item.product_code && (
                    <p className="text-xs text-muted-foreground">
                      {item.product_code}
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
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        {request.status === "PENDING" && (onApprove || onReject) && (
          <div className="p-8 flex gap-3 justify-end">
            {onReject && (
              <button
                onClick={() => { onClose(); onReject(request); }}
                className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                Reject
              </button>
            )}
            {onApprove && (
              <button
                onClick={() => { onClose(); onApprove(request); }}
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
              >
                Approve
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
