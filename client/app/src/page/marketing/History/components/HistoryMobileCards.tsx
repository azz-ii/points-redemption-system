import { Eye } from "lucide-react";
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-400 text-black";
      case "APPROVED":
        return "bg-green-500 text-white";
      case "REJECTED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getProcessingStatusColor = (status: string) => {
    switch (status) {
      case "NOT_PROCESSED":
        return "bg-orange-400 text-black";
      case "PROCESSED":
        return "bg-blue-500 text-white";
      case "CANCELLED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading history...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-sm text-gray-500">No processed requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className={`p-4 rounded-lg border ${
            resolvedTheme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-sm">#{request.id}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
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
              <span className="text-gray-500 dark:text-gray-400">For:</span>
              <span className="font-medium">{request.requested_for_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Points:</span>
              <span className="font-medium">
                {request.total_points.toLocaleString()} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Requested:</span>
              <span className="font-medium">
                {new Date(request.date_requested).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Processed:</span>
              <span className="font-medium">
                {request.date_processed
                  ? new Date(request.date_processed).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>

          <button
            onClick={() => onView(request)}
            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
              resolvedTheme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}
