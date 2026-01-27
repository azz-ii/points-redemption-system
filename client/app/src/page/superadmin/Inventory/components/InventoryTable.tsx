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
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Item Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Item Code
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Variant
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Category
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Total Stock
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Committed
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Available
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Reorder Level
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
              <td colSpan={10} className="px-6 py-32 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-gray-500">Loading inventory items...</p>
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={10} className="px-6 py-32 text-center">
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
              <td colSpan={10} className="px-6 py-32 text-center">
                <p className="text-gray-500">
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
                className={`hover:${
                  resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                } transition-colors`}
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-medium">{item.item_name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-mono">{item.item_code}</span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {item.option_description || "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${ getLegendColor(
                      item.legend
                    )}`}
                  >
                    {item.legend}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-sm font-semibold ${
                      item.stock === 0
                        ? "text-red-500"
                        : item.stock <= item.reorder_level
                        ? "text-yellow-500"
                        : ""
                    }`}
                  >
                    {item.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-orange-500">
                    {item.committed_stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-sm font-semibold ${
                      item.available_stock === 0
                        ? "text-red-500"
                        : item.available_stock <= item.reorder_level
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {item.available_stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{item.reorder_level}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      item.stock_status
                    )}`}
                  >
                    {item.stock_status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onViewItem(item)}
                      className="px-4 py-2 rounded flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditItem(item)}
                      className={`px-4 py-2 rounded flex items-center ${
                        resolvedTheme === "dark"
                          ? "bg-gray-600 hover:bg-gray-500 text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                      } font-semibold transition-colors`}
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
