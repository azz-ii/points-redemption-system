import { ChevronLeft, ChevronRight, CheckCircle, XCircle as XCircleIcon } from "lucide-react";
import { MobileCardsSkeleton } from "@/components/shared/mobile-cards-skeleton";
import { StatusChip } from "./StatusChip";
import type { RedemptionRequest } from "../modals/types";

interface RedemptionStatusMobileCardsProps {
  requests: RedemptionRequest[];
  filteredCount: number;
  onViewRequest: (request: RedemptionRequest) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  error: string | null;
  onCancelRequest?: (request: RedemptionRequest) => void;
  onApprove?: (request: RedemptionRequest) => void;
  onReject?: (request: RedemptionRequest) => void;
  username?: string | null;
  userPosition?: string | null;
}

export function RedemptionStatusMobileCards({
  requests,
  filteredCount,
  onViewRequest,
  currentPage,
  totalPages,
  onPageChange,
  loading,
  error,
  onCancelRequest,
  onApprove,
  onReject,
  username,
  userPosition,
}: RedemptionStatusMobileCardsProps) {
  // Show skeleton during initial load
  if (loading && requests.length === 0) {
    return <MobileCardsSkeleton count={6} headerTitle="Request History" />;
  }

  return (
    <div className="md:hidden" aria-live="polite">
      <h2 className="text-xl font-bold mb-2">Request History</h2>
      <p className="text-muted-foreground text-xs mb-4">
        Showing {requests.length} of {filteredCount} request{filteredCount !== 1 ? 's' : ''}
      </p>

      {error ? (
        <div className="text-center py-16">
          <p className="text-destructive">{error}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No redemption requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const itemCount = request.items?.length || 0;
            const formattedDate = new Date(request.date_requested).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            
            return (
              <div
                key={request.id}
                className="p-4 rounded-lg border bg-card border-border"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-semibold">{request.requested_for_name}</h3>
                  </div>
                  <StatusChip 
                    status={request.status as any} 
                    processingStatus={request.processing_status as any} 
                  />
                </div>
                
                <div className="space-y-1 mb-3">
                  <p className="text-sm text-muted-foreground">
                    {itemCount} item{itemCount !== 1 ? 's' : ''} • {request.total_points} points
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formattedDate}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => onViewRequest(request)}
                    className="flex-1 min-w-[30%] px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                    aria-label={`View details for request #${request.id}`}
                  >
                    View Details
                  </button>
                  {request.status.toUpperCase() === "PENDING" && request.sales_approval_status !== "APPROVED" && request.requested_by_name === username && onCancelRequest && (
                    <button
                      onClick={() => onCancelRequest(request)}
                      className="flex-1 min-w-[30%] px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center gap-1"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Cancel
                    </button>
                  )}
                  {request.status.toUpperCase() === "PENDING" && userPosition?.toLowerCase() === "approver" && request.requested_by_name !== username && (
                    <>
                      {onApprove && (
                        <button
                          onClick={() => onApprove(request)}
                          className="flex-1 min-w-[30%] px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                      )}
                      {onReject && (
                        <button
                          onClick={() => onReject(request)}
                          className="flex-1 min-w-[30%] px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-1"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          Reject
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-xs font-medium text-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent text-foreground"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
