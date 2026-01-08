import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatusChip } from "./StatusChip";
import type { StatusItem } from "../modals/types";

interface RedemptionStatusMobileCardsProps {
  items: StatusItem[];
  filteredCount: number;
  onViewItem: (item: StatusItem) => void;
  isDark: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RedemptionStatusMobileCards({
  items,
  filteredCount,
  onViewItem,
  isDark,
  currentPage,
  totalPages,
  onPageChange,
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
              {item.id}
            </p>
            <h3 className="text-base font-semibold mb-0.5">{item.type}</h3>
            <p
              className={`text-sm mb-3 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {item.details}
            </p>
            <div className="flex justify-between items-center mb-3">
              <StatusChip status={item.status} isDark={isDark} />
              <span
                className={`text-xs ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {item.date}
              </span>
            </div>
            <button
              onClick={() => onViewItem(item)}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isDark
                  ? "bg-white text-gray-900 hover:bg-gray-200"
                  : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"
              }`}
              aria-label={`View details for ${item.details}`}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

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
