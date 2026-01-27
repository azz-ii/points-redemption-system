import { useTheme } from "next-themes";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-lg w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-stock-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 id="edit-stock-title" className="text-xl font-semibold">
                Update Stock
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  previewStatus
                )}`}
              >
                {previewStatus}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Modify stock levels for {item.item_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Item Info (Read-only) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Item Information
            </h3>
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
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
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
          </div>

          {/* Stock Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Stock Levels
            </h3>
            
            {/* Current Stock Info (Read-only) */}
            <div
              className={`p-3 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <p className="text-xs text-gray-500 mb-2">Current Stock Breakdown</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Total:</span>
                  <p className="font-semibold">{item.stock}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Committed:</span>
                  <p className="font-semibold text-orange-500">{item.committed_stock}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Available:</span>
                  <p
                    className={`font-semibold ${
                      item.available_stock === 0
                        ? "text-red-500"
                        : item.available_stock <= item.reorder_level
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {item.available_stock}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {item.committed_stock > 0
                  ? `${item.committed_stock} unit${item.committed_stock > 1 ? 's' : ''} reserved for pending/approved requests`
                  : 'No units currently committed'}
              </p>
            </div>

            <div>
              <label
                htmlFor="stock-input"
                className="text-xs text-gray-500 mb-2 block"
              >
                New Total Stock *
              </label>
              <input
                id="stock-input"
                type="number"
                value={data.stock}
                onChange={(e) => setData({ ...data, stock: e.target.value })}
                min="0"
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500`}
                placeholder="Enter stock quantity"
                aria-required="true"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ensure total stock ≥ committed stock ({item.committed_stock}) to avoid issues
              </p>
            </div>

            <div>
              <label
                htmlFor="reorder-level-input"
                className="text-xs text-gray-500 mb-2 block"
              >
                Reorder Level *
              </label>
              <input
                id="reorder-level-input"
                type="number"
                value={data.reorder_level}
                onChange={(e) =>
                  setData({ ...data, reorder_level: e.target.value })
                }
                min="0"
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500`}
                placeholder="Enter reorder level"
                aria-required="true"
              />
              <p className="text-xs text-gray-500 mt-1">
                Low stock alert triggers when available stock falls to this level
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8">
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={updating}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                resolvedTheme === "dark"
                  ? "bg-white hover:bg-gray-100 text-gray-900"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              } disabled:opacity-50`}
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={updating}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                resolvedTheme === "dark"
                  ? "bg-white hover:bg-gray-100 text-gray-900 disabled:opacity-50"
                  : "bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
              }`}
            >
              {updating ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
