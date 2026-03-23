import { Eye } from "lucide-react";
import { MobileCardsSkeleton } from "@/components/shared/mobile-cards-skeleton";
import type { RequestItem } from "../../ProcessRequests/modals/types";

interface HistoryMobileCardsProps {
  requests: RequestItem[];
  loading: boolean;
  onView: (request: RequestItem) => void;
}

export function HistoryMobileCards({
  requests,
  loading,
  onView,
}: HistoryMobileCardsProps) {
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

  if (loading) {
    return <MobileCardsSkeleton count={6} showHeader={false} />;
  }

  if (requests.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-sm text-muted-foreground">No processed requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="p-4 rounded-lg border bg-card border-border"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-sm">
                {request.requested_by_name}
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                  request.status
                )}`}
              >
                {request.status_display}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${getProcessingStatusColor(
                  request.processing_status
                )}`}
              >
                {request.processing_status_display}
              </span>
            </div>
          </div>

          <div className="space-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">For:</span>
              <span className="font-medium">{request.requested_for_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Points:</span>
              <span className="font-medium">
                {request.total_points.toLocaleString()} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requested:</span>
              <span className="font-medium">
                {new Date(request.date_requested).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processed:</span>
              <span className="font-medium">
                {request.date_processed
                  ? new Date(request.date_processed).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>

          <button
            onClick={() => onView(request)}
            className="w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}
