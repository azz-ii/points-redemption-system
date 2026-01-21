import { Eye, CheckCircle } from "lucide-react";
import { useTheme } from "next-themes";
import type { RedemptionItem } from "../modals/types";

interface RedemptionMobileCardsProps {
  paginatedItems: RedemptionItem[];
  filteredItems: RedemptionItem[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (item: RedemptionItem) => void;
  onMarkProcessed: (item: RedemptionItem) => void;
  canMarkProcessed: (item: RedemptionItem) => boolean;
}

export function RedemptionMobileCards({
  paginatedItems,
  filteredItems,
  loading,
  onView,
  onMarkProcessed,
  canMarkProcessed,
}: RedemptionMobileCardsProps) {
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

  const getProcessingStatusColor = (status: string | undefined) => {
    switch (status?.toUpperCase()) {
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

  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      } transition-colors`}
    >
      <div className="space-y-3 p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Loading requests...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No requests found
          </div>
        ) : (
          paginatedItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-sm">#{item.id}</p>
                  <p className="text-xs text-gray-500">
                    {item.requested_by_name}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                      item.status
                    )}`}
                  >
                    {item.status_display || item.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getProcessingStatusColor(
                      item.processing_status
                    )}`}
                  >
                    {item.processing_status_display || item.processing_status?.replace(/_/g, ' ') || "Not Processed"}
                  </span>
                </div>
              </div>
              <div className="space-y-1 mb-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">For:</span>
                  <span className="font-medium">{item.requested_for_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Points:</span>
                  <span className="font-medium">
                    {item.total_points.toLocaleString()} pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">
                    {new Date(item.date_requested).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onView(item)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                {canMarkProcessed(item) && (
                  <button
                    onClick={() => onMarkProcessed(item)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Process
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
