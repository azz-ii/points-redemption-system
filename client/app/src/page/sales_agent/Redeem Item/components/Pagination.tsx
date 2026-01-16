import { useTheme } from "next-themes";
import type { PaginationProps } from "../types";

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className={`px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
          currentPage === 1
            ? isDark
              ? "bg-gray-800 text-gray-600 cursor-not-allowed"
              : "bg-gray-200 text-gray-600 cursor-not-allowed"
            : isDark
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-gray-200 text-gray-900 hover:bg-gray-300"
        }`}
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
            page === currentPage
              ? isDark
                ? "bg-blue-600 text-white"
                : "bg-blue-600 text-white"
              : isDark
              ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "bg-gray-200 text-gray-900 hover:bg-gray-300"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className={`px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${
          currentPage === totalPages
            ? isDark
              ? "bg-gray-800 text-gray-600 cursor-not-allowed"
              : "bg-gray-200 text-gray-600 cursor-not-allowed"
            : isDark
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-gray-200 text-gray-900 hover:bg-gray-300"
        }`}
      >
        Next
      </button>
    </div>
  );
}
