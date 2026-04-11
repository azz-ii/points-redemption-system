import { getStatusClasses } from "@/components/ui/status-badge";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { MobileCardsSkeleton } from "@/components/shared/mobile-cards-skeleton";
import type { RequestItem } from "../modals/types";

interface RequestsMobileCardsProps {
  requests: RequestItem[];
  loading: boolean;
  onView: (request: RequestItem) => void;
  onApprove: (request: RequestItem) => void;
  onReject: (request: RequestItem) => void;
  currentUserUsername?: string;
}

export function RequestsMobileCards({
  requests,
  loading,
  onView,
  onApprove,
  onReject,
  currentUserUsername,
}: RequestsMobileCardsProps) {

if (loading) {
    return <MobileCardsSkeleton count={6} showHeader={false} />;
  }

  if (requests.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-sm text-muted-foreground">No requests found</p>
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
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${getStatusClasses(
                request.status
              )}`}
            >
              {request.status_display}
            </span>
          </div>

          <div className="space-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Team:</span>
              <span className="font-medium">
                {request.team_name || <span className="text-muted-foreground italic">No Team</span>}
              </span>
            </div>
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
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">
                {new Date(request.date_requested).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onView(request)}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 bg-muted hover:bg-accent text-foreground"
            >
              <Eye className="h-4 w-4" />
              View
            </button>
            {request.status === "PENDING" && request.requested_by_username !== currentUserUsername && (
              <>
                <button
                  onClick={() => onApprove(request)}
                  className="flex-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => onReject(request)}
                  className="flex-1 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
