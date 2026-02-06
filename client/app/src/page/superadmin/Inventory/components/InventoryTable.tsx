import { useTheme } from "next-themes";
import { Eye, Edit } from "lucide-react";
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

  return (
    <div className="overflow-auto max-h-[calc(100vh-295px)] rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full border-collapse">
        <thead
          className={`sticky top-0 z-10 ${
            resolvedTheme === "dark"
              ? "bg-gray-800 text-gray-200 border-b-2 border-gray-700"
              : "bg-gray-100 text-gray-800 border-b-2 border-gray-300"
          }`}
        >
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              Item Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              Item Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              Legend
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              Total Stock
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              Committed
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              Available
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          className={`${
            resolvedTheme === "dark"
              ? "divide-y divide-gray-700"
              : "divide-y divide-gray-200"
          }`}
        >
          {loading ? (
            <tr>
              <td colSpan={9} className="px-4 py-20 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  <p
                    className={`text-sm ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Loading inventory items...
                  </p>
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={9} className="px-4 py-20 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <p className="text-red-500 text-sm">{error}</p>
                  <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-20 text-center">
                <p
                  className={`text-sm ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {searchQuery
                    ? "No items match your search"
                    : "No inventory items found"}
                </p>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className={`${
                  resolvedTheme === "dark"
                    ? "hover:bg-gray-800/50"
                    : "hover:bg-gray-50"
                } transition-colors`}
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium">{item.item_name}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-sm font-mono ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {item.item_code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">{item.category || "-"}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getLegendColor(
                      item.legend,
                    )}`}
                  >
                    {item.legend.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-sm font-bold ${
                      item.stock === 0
                        ? "text-red-500"
                        : resolvedTheme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800"
                    }`}
                  >
                    {item.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-bold text-orange-500">
                    {item.committed_stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-sm font-bold ${
                      item.available_stock === 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {item.available_stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusColor(
                      item.stock_status,
                    )}`}
                  >
                    {item.stock_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onViewItem(item)}
                      className="p-2 rounded-lg flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm hover:shadow"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditItem(item)}
                      className={`p-2 rounded-lg flex items-center justify-center ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      } transition-colors shadow-sm hover:shadow`}
                      title="Edit Stock"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
