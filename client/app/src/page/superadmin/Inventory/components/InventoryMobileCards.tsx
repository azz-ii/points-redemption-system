import { useTheme } from "next-themes";
import { Eye, Edit } from "lucide-react";
import type { InventoryItem } from "../modals/types";
import { getStatusColor, getLegendColor } from "../modals/types";

interface InventoryMobileCardsProps {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  onViewItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onRetry: () => void;
  searchQuery: string;
}

export function InventoryMobileCards({
  items,
  loading,
  error,
  onViewItem,
  onEditItem,
  onRetry,
  searchQuery,
}: InventoryMobileCardsProps) {
  const { resolvedTheme } = useTheme();

  if (loading) {
    return (
      <div className="text-center py-32">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-32">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 text-sm">
          {searchQuery
            ? "No items match your search"
            : "No inventory items found"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-4 rounded-lg border ${
            resolvedTheme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } transition-colors`}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <p className="font-semibold">{item.item_name}</p>
              <p
                className={`text-xs font-mono ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {item.item_code}
              </p>
              {item.option_description && (
                <p
                  className={`text-xs mt-1 ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {item.option_description}
                </p>
              )}
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                item.legend
              )}`}
            >
              {item.legend}
            </span>
          </div>

          {/* Stock Info */}
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
            <div
              className={`p-2 rounded ${
                resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <span
                className={
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }
              >
                Stock
              </span>
              <p
                className={`font-bold text-lg ${
                  item.stock === 0
                    ? "text-red-500"
                    : item.stock <= item.reorder_level
                    ? "text-yellow-500"
                    : ""
                }`}
              >
                {item.stock}
              </p>
            </div>
            <div
              className={`p-2 rounded ${
                resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <span
                className={
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }
              >
                Reorder
              </span>
              <p className="font-bold text-lg">{item.reorder_level}</p>
            </div>
            <div
              className={`p-2 rounded ${
                resolvedTheme === "dark" ? "bg-gray-700" : "bg-gray-50"
              }`}
            >
              <span
                className={
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }
              >
                Status
              </span>
              <div className="mt-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                    item.stock_status
                  )}`}
                >
                  {item.stock_status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onViewItem(item)}
              className="flex-1 px-3 py-2 rounded flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white transition-colors font-semibold text-sm"
            >
              <Eye className="h-4 w-4" />
              View
            </button>
            <button
              onClick={() => onEditItem(item)}
              className={`flex-1 px-3 py-2 rounded flex items-center justify-center gap-2 ${
                resolvedTheme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              } transition-colors font-semibold text-sm`}
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
