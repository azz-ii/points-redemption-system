import { X } from "lucide-react";
import { RequestTimeline } from "@/components/modals";
import type { HistoryItem } from "../types";

interface ViewHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HistoryItem | null;
}

export function ViewHistoryModal({
  isOpen,
  onClose,
  item,
}: ViewHistoryModalProps) {
  if (!isOpen || !item) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getProcessingStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-2xl w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-history-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-history-title" className="text-xl font-semibold">
              Request History Details
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Requested For</label>
                <p className="font-semibold">{item.requested_for_name}</p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Team</label>
                <p className="font-semibold">
                  {item.team_name || <span className="text-muted-foreground italic">No Team</span>}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Total Points</label>
              <p className="font-semibold">{item.total_points.toLocaleString()} pts</p>
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
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                    item.status
                  )}`}
                >
                  {item.status_display}
                </span>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Processing Status</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getProcessingStatusBadgeColor(
                    item.processing_status
                  )}`}
                >
                  {item.processing_status_display}
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

          {/* Items */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Items ({item.items.length})
            </h3>
            <div className="space-y-2">
              {item.items.map((requestItem) => (
                <div
                  key={requestItem.id}
                  className="p-3 rounded border bg-muted border-border"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="font-semibold">
                        {requestItem.product_name}
                      </p>
                      {requestItem.category && (
                        <p className="text-xs text-muted-foreground">
                          {requestItem.category}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Code: {requestItem.product_code}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Qty: {requestItem.quantity} × {requestItem.points_per_item} pts ={" "}
                        {requestItem.total_points} pts
                      </p>
                      
                      {requestItem.extra_data && Object.keys(requestItem.extra_data).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 border-t border-border/50 pt-2 pb-1">
                          {Object.entries(requestItem.extra_data).map(([key, value]) => {
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
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
