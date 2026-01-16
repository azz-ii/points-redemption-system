import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "next-themes";
import type { RequestItem } from "../modals/types";

interface RequestsMobileCardsProps {
  requests: RequestItem[];
  loading: boolean;
  onView: (request: RequestItem) => void;
  onApprove: (request: RequestItem) => void;
  onReject: (request: RequestItem) => void;
}

export function RequestsMobileCards({
  requests,
  loading,
  onView,
  onApprove,
  onReject,
}: RequestsMobileCardsProps) {
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

  const getProcessingStatusBadgeColor = (status: string) => {
    const statusUpper = status?.toUpperCase() || "";
    switch (statusUpper) {
      case "PROCESSED":
        return "bg-green-600 text-white";
      case "CANCELLED":
        return "bg-red-600 text-white";
      case "NOT_PROCESSED":
      default:
        return "bg-yellow-500 text-gray-900";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-sm text-gray-500">No requests found</p>
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
              <span className="text-gray-500 dark:text-gray-400">Request Status:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                  request.status
                )}`}
              >
                {request.status_display}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Processing Status:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${getProcessingStatusBadgeColor(
                  request.processing_status
                )}`}
              >
                {request.processing_status_display || "Not Processed"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Date Requested:</span>
              <span className="font-medium">
                {new Date(request.date_requested).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Processing Date:</span>
              <span className="font-medium">
                {request.date_processed
                  ? new Date(request.date_processed).toLocaleDateString()
                  : <span className="text-gray-400 italic">N/A</span>}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onView(request)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                resolvedTheme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              <Eye className="h-4 w-4" />
              View
            </button>
            {request.status === "PENDING" && (
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
