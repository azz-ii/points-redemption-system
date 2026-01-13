import { useTheme } from "next-themes";
import { X, Package } from "lucide-react";
import type { InventoryItem, ModalBaseProps } from "./types";
import { getStatusColor, getLegendColor } from "./types";

interface EditStockData {
  stock: string;
  reorder_level: string;
}

interface EditStockModalProps extends ModalBaseProps {
  item: InventoryItem | null;
  data: EditStockData;
  setData: React.Dispatch<React.SetStateAction<EditStockData>>;
  updating: boolean;
  error: string | null;
  onConfirm: () => void;
}

export function EditStockModal({
  isOpen,
  onClose,
  item,
  data,
  setData,
  updating,
  error,
  onConfirm,
}: EditStockModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !item) return null;

  // Calculate preview status based on current form values
  const getPreviewStatus = () => {
    const stock = parseInt(data.stock) || 0;
    const reorderLevel = parseInt(data.reorder_level) || 0;
    if (stock === 0) return "Out of Stock";
    if (stock <= reorderLevel) return "Low Stock";
    return "In Stock";
  };

  const previewStatus = getPreviewStatus();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-md rounded-lg shadow-lg ${
          resolvedTheme === "dark"
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-900"
        } transition-colors`}
      >
        {/* Modal Header */}
        <div
          className={`flex justify-between items-center p-6 border-b ${
            resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Update Stock</h2>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Modify stock levels
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${
              resolvedTheme === "dark"
                ? "hover:bg-gray-800"
                : "hover:bg-gray-100"
            } transition-colors`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Item Info (Read-only) */}
          <div
            className={`p-4 rounded-lg ${
              resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{item.item_name}</p>
                <p
                  className={`text-sm font-mono ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {item.item_code}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                  item.legend
                )}`}
              >
                {item.legend}
              </span>
            </div>
            {item.option_description && (
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Variant: {item.option_description}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Stock Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Current Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={data.stock}
              onChange={(e) => setData({ ...data, stock: e.target.value })}
              min="0"
              className={`w-full px-4 py-3 rounded-lg border text-lg font-semibold ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter stock quantity"
            />
          </div>

          {/* Reorder Level Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Reorder Level <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={data.reorder_level}
              onChange={(e) =>
                setData({ ...data, reorder_level: e.target.value })
              }
              min="0"
              className={`w-full px-4 py-3 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter reorder level"
            />
            <p
              className={`text-xs mt-1 ${
                resolvedTheme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Low stock alert triggers when stock falls to this level
            </p>
          </div>

          {/* Status Preview */}
          <div
            className={`p-3 rounded-lg ${
              resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            <p
              className={`text-sm mb-2 ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Status Preview:
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                previewStatus
              )}`}
            >
              {previewStatus}
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`flex gap-3 p-6 border-t ${
            resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            disabled={updating}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm ${
              resolvedTheme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            } transition-colors disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={updating}
            className="flex-1 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {updating ? "Updating..." : "Update Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
