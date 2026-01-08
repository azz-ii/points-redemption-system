import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusChip } from "./StatusChip";
import type { StatusItem } from "../modals/types";

interface RedemptionStatusTableProps {
  items: StatusItem[];
  onViewItem: (item: StatusItem) => void;
  isDark: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RedemptionStatusTable({
  items,
  onViewItem,
  isDark,
  currentPage,
  totalPages,
  onPageChange,
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
              ID
            </th>
            <th
              className={`px-6 py-4 text-left text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Type
            </th>
            <th
              className={`px-6 py-4 text-left text-sm font-medium ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Details
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
          {items.map((item, idx) => (
            <tr
              key={idx}
              className={`border-t ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <td className="px-6 py-4 font-medium">{item.id}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isDark
                      ? "bg-green-700 text-white"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {item.type}
                </span>
              </td>
              <td
                className={`px-6 py-4 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {item.details}
              </td>
              <td className="px-6 py-4">
                <StatusChip status={item.status} isDark={isDark} />
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
          ))}
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
