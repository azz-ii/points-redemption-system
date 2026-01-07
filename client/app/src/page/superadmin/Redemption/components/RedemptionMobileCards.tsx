import { Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";
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
  onEdit: (item: RedemptionItem) => void;
}

export function RedemptionMobileCards({
  paginatedItems,
  filteredItems,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
}: RedemptionMobileCardsProps) {
  const { resolvedTheme } = useTheme();

  return (
    <>
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
              Loading redemption requests...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No redemption requests found
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
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === "Approved"
                        ? "bg-green-500 text-white"
                        : item.status === "Rejected"
                        ? "bg-red-500 text-white"
                        : "bg-yellow-400 text-black"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="space-y-1 mb-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">For:</span>
                    <span className="font-medium">{item.requested_for_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Points:</span>
                    <span className="font-medium">
                      {item.total_points.toLocaleString()}
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
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      resolvedTheme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => onEdit(item)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                      resolvedTheme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
            resolvedTheme === "dark"
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
            resolvedTheme === "dark"
              ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
              : "bg-white border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}
