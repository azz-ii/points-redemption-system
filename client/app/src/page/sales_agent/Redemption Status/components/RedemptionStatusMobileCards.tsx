import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusChip } from "./StatusChip";
import type { RedemptionRequestItem, RedemptionRequest } from "../modals/types";

interface RedemptionStatusMobileCardsProps {
  items: (RedemptionRequestItem & { requestId: number; status: string; status_display: string; date_requested: string; request: RedemptionRequest })[];
  filteredCount: number;
  onViewItem: (item: RedemptionRequestItem & { request: RedemptionRequest }) => void;
  isDark: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  error: string | null;
}

export function RedemptionStatusMobileCards({
  items,
  filteredCount,
  onViewItem,
  isDark,
  currentPage,
  totalPages,
  onPageChange,
  loading,
  error,
}: RedemptionStatusMobileCardsProps) {
  return (
    <div className="md:hidden" aria-live="polite">
      <h2 className="text-xl font-bold mb-2">Request History</h2>
      <p
        className={`${
          isDark ? "text-gray-400" : "text-gray-600"
        } text-xs mb-4`}
      >
        Showing {items.length} of {filteredCount} processed
      </p>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading requests...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            No redemption requests found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg ${
                isDark ? "bg-gray-800/50" : "bg-gray-50"
              }`}
            >
              <p
                className={`text-xs mb-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Request #{item.requestId} • {item.variant_code}
              </p>
              <h3 className="text-base font-semibold mb-0.5">{item.catalogue_item_name}</h3>
              <p
                className={`text-sm mb-3 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {item.variant_option || "Standard"} • Qty: {item.quantity} • {item.total_points} pts
              </p>
              <div className="flex justify-between items-center mb-3">
                <StatusChip status={item.status} isDark={isDark} />
                <span
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {new Date(item.date_requested).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => onViewItem(item)}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isDark
                    ? "bg-white text-gray-900 hover:bg-gray-200"
                    : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"
                }`}
                aria-label={`View details for ${item.catalogue_item_name}`}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
            isDark
              ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
              : "bg-white border border-gray-300 hover:bg-gray-100"
          }`}
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <span className="text-xs font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
            isDark
              ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
              : "bg-white border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
