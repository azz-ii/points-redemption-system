import { useTheme } from "next-themes";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface InventoryPaginationProps {
  page: number;
  totalPages: number;
  rowsPerPage: number | "ALL";
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number | "ALL") => void;
  isMobile?: boolean;
}

export function InventoryPagination({
  page,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  isMobile = false,
}: InventoryPaginationProps) {
  const { resolvedTheme } = useTheme();
  const safePage = Math.min(page, totalPages);

  if (isMobile) {
    return (
      <div className="mt-4 space-y-3 pb-2">
        {/* Rows per page */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              const value =
                e.target.value === "ALL"
                  ? "ALL"
                  : parseInt(e.target.value);
              onRowsPerPageChange(value);
              onPageChange(1);
            }}
            className={`px-2 py-1 rounded border text-xs ${
              resolvedTheme === "dark"
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            } focus:outline-none focus:border-blue-500`}
          >
            <option value="15">15</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="ALL">ALL</option>
          </select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(1)}
            disabled={safePage === 1 || rowsPerPage === "ALL"}
            className={`p-1.5 rounded transition-colors ${
              resolvedTheme === "dark"
                ? "hover:bg-gray-700 disabled:opacity-30"
                : "hover:bg-gray-200 disabled:opacity-30"
            } disabled:cursor-not-allowed`}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage === 1 || rowsPerPage === "ALL"}
            className={`p-1.5 rounded transition-colors ${
              resolvedTheme === "dark"
                ? "hover:bg-gray-700 disabled:opacity-30"
                : "hover:bg-gray-200 disabled:opacity-30"
            } disabled:cursor-not-allowed`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium px-2">
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
            disabled={safePage === totalPages || rowsPerPage === "ALL"}
            className={`p-1.5 rounded transition-colors ${
              resolvedTheme === "dark"
                ? "hover:bg-gray-700 disabled:opacity-30"
                : "hover:bg-gray-200 disabled:opacity-30"
            } disabled:cursor-not-allowed`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={safePage === totalPages || rowsPerPage === "ALL"}
            className={`p-1.5 rounded transition-colors ${
              resolvedTheme === "dark"
                ? "hover:bg-gray-700 disabled:opacity-30"
                : "hover:bg-gray-200 disabled:opacity-30"
            } disabled:cursor-not-allowed`}
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between p-4 border-t ${
        resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
      }`}
    >
      {/* Left: Rows per page */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            const value =
              e.target.value === "ALL" ? "ALL" : parseInt(e.target.value);
            onRowsPerPageChange(value);
            onPageChange(1);
          }}
          className={`px-3 py-1.5 rounded border text-sm ${
            resolvedTheme === "dark"
              ? "bg-gray-800 border-gray-600 text-white"
              : "bg-white border-gray-300 text-gray-900"
          } focus:outline-none focus:border-blue-500`}
        >
          <option value="15">15</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="ALL">ALL</option>
        </select>
      </div>

      {/* Right: Page navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(1)}
          disabled={safePage === 1 || rowsPerPage === "ALL"}
          className={`p-1.5 rounded transition-colors ${
            resolvedTheme === "dark"
              ? "hover:bg-gray-800 disabled:opacity-30"
              : "hover:bg-gray-100 disabled:opacity-30"
          } disabled:cursor-not-allowed`}
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1 || rowsPerPage === "ALL"}
          className={`p-1.5 rounded transition-colors ${
            resolvedTheme === "dark"
              ? "hover:bg-gray-800 disabled:opacity-30"
              : "hover:bg-gray-100 disabled:opacity-30"
          } disabled:cursor-not-allowed`}
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium px-2">
          Page {safePage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages || rowsPerPage === "ALL"}
          className={`p-1.5 rounded transition-colors ${
            resolvedTheme === "dark"
              ? "hover:bg-gray-800 disabled:opacity-30"
              : "hover:bg-gray-100 disabled:opacity-30"
          } disabled:cursor-not-allowed`}
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={safePage === totalPages || rowsPerPage === "ALL"}
          className={`p-1.5 rounded transition-colors ${
            resolvedTheme === "dark"
              ? "hover:bg-gray-800 disabled:opacity-30"
              : "hover:bg-gray-100 disabled:opacity-30"
          } disabled:cursor-not-allowed`}
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
