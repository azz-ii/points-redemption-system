import { useTheme } from "next-themes";
import { Eye, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { InventoryItem } from "../modals/types";
import { getStatusColor, getLegendColor } from "../modals/types";

interface InventoryTableProps {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  onViewItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onRetry: () => void;
  searchQuery: string;
}

export function InventoryTable({
  items,
  loading,
  error,
  onViewItem,
  onEditItem,
  onRetry,
  searchQuery,
}: InventoryTableProps) {
  const { resolvedTheme } = useTheme();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (itemId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="overflow-auto max-h-[calc(100vh-295px)]">
      <table className="w-full">
        <thead
          className={`sticky top-0 ${
            resolvedTheme === "dark"
              ? "bg-gray-800 text-gray-300"
              : "bg-gray-50 text-gray-700"
          }`}
        >
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold w-10"></th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Item Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Legend
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Available Stock
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Status
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          className={`divide-y ${
            resolvedTheme === "dark" ? "divide-gray-700" : "divide-gray-200"
          }`}
        >
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-32 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-gray-500">Loading inventory items...</p>
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={6} className="px-6 py-32 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-32 text-center">
                <p className="text-gray-500">
                  {searchQuery
                    ? "No items match your search"
                    : "No inventory items found"}
                </p>
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const isExpanded = expandedRows.has(item.id);
              return (
                <>
                  <tr
                    key={item.id}
                    className={`hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRow(item.id)}
                        className={`p-1 rounded hover:${
                          resolvedTheme === "dark"
                            ? "bg-gray-700"
                            : "bg-gray-200"
                        } transition-colors`}
                        title={isExpanded ? "Hide details" : "Show details"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {item.item_name}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {item.item_code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                          item.legend,
                        )}`}
                      >
                        {item.legend.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-semibold ${
                          item.available_stock === 0
                            ? "text-red-500"
                            : item.available_stock < 10
                              ? "text-orange-500"
                              : "text-green-500"
                        }`}
                      >
                        {item.available_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          item.stock_status,
                        )}`}
                      >
                        {item.stock_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onViewItem(item)}
                          className="px-3 py-2 rounded flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                          title="View full details"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => onEditItem(item)}
                          className={`px-3 py-2 rounded flex items-center gap-1 text-sm ${
                            resolvedTheme === "dark"
                              ? "bg-gray-600 hover:bg-gray-500 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                          } font-semibold transition-colors`}
                          title="Edit stock"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr
                      key={`${item.id}-expanded`}
                      className={`${
                        resolvedTheme === "dark"
                          ? "bg-gray-800/50"
                          : "bg-gray-50/50"
                      }`}
                    >
                      <td colSpan={6} className="px-6 py-4">
                        <div
                          className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border ${
                            resolvedTheme === "dark"
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Category
                            </p>
                            <p className="text-sm font-medium">
                              {item.category || "-"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Total Stock
                            </p>
                            <p
                              className={`text-sm font-semibold ${
                                item.stock === 0 ? "text-red-500" : ""
                              }`}
                            >
                              {item.stock}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Committed Stock
                            </p>
                            <p className="text-sm font-semibold text-orange-500">
                              {item.committed_stock}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Points Required
                            </p>
                            <p className="text-sm font-medium">
                              {item.points || "-"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Price
                            </p>
                            <p className="text-sm font-medium">
                              {item.price || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
