import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusChip } from "./StatusChip";
import type { RedemptionRequestItem, RedemptionRequest } from "../modals/types";

interface RedemptionStatusTableProps {
  items: (RedemptionRequestItem & { requestId: number; status: string; status_display: string; processing_status: string; date_requested: string; request: RedemptionRequest })[];
  onViewItem: (item: RedemptionRequestItem & { request: RedemptionRequest }) => void;
  isDark: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  error: string | null;
}

export function RedemptionStatusTable({
  items,
  onViewItem,
  isDark,
  currentPage,
  totalPages,
  onPageChange,
  loading,
  error,
}: RedemptionStatusTableProps) {
  return (
    <div
      className={`hidden md:block rounded-lg border overflow-hidden ${
        isDark ? "border-gray-800" : "border-gray-200"
      }`}
    >
      <table className="w-full">
        <thead className={isDark ? "bg-gray-900" : "bg-gray-50"}>
          <tr>
            <th
              className={`px-6 py-4 text-left text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Request ID
            </th>
            <th
              className={`px-6 py-4 text-left text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Item Code
            </th>
            <th
              className={`px-6 py-4 text-left text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Item Name
            </th>
            <th
              className={`px-6 py-4 text-left text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Variant
            </th>
            <th
              className={`px-6 py-4 text-left text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Quantity
            </th>
            <th
              className={`px-6 py-4 text-left text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Points
            </th>
            <th
              className={`px-6 py-4 text-left text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Status
            </th>
            <th
              className={`px-6 py-4 text-left text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            ></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading requests...</p>
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={8} className="px-6 py-16 text-center">
                <p className="text-red-500">{error}</p>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-16 text-center">
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                  No redemption requests found
                </p>
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr
                key={idx}
                className={`border-t ${
                  isDark ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <td className="px-6 py-4 font-medium">#{item.requestId}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isDark
                        ? "bg-gray-700 text-gray-200"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.variant_code}
                  </span>
                </td>
                <td
                  className={`px-6 py-4 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {item.catalogue_item_name}
                </td>
                <td
                  className={`px-6 py-4 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {item.variant_option || "-"}
                </td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4 font-semibold">{item.total_points}</td>
                <td className="px-6 py-4">
                  <StatusChip status={item.status} processingStatus={item.processing_status} isDark={isDark} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    className={
                      `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ` +
                      (isDark
                        ? "bg-blue-600 text-white hover:bg-blue-500"
                        : "bg-blue-600 text-white hover:bg-blue-700")
                    }
                    aria-label="View"
                    onClick={() => onViewItem(item)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div
        className={`flex items-center justify-between p-4 border-t ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
            isDark
              ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
              : "bg-white border border-gray-300 hover:bg-gray-100"
          }`}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
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
