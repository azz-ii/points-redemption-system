import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { InventoryItem, ModalBaseProps } from "./types";
import { getStatusColor, getLegendColor } from "./types";

interface ViewInventoryModalProps extends ModalBaseProps {
  item: InventoryItem | null;
}

export function ViewInventoryModal({
  isOpen,
  onClose,
  item,
}: ViewInventoryModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !item) return null;

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
        aria-labelledby="view-inventory-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-inventory-title" className="text-xl font-semibold">
              Inventory Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View stock information for {item.item_name}
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
          {/* Item Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Item Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={item.item_name}
                  disabled
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } focus:outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Item Code
                </label>
                <input
                  type="text"
                  value={item.item_code}
                  disabled
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed font-mono ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } focus:outline-none`}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                    item.legend
                  )}`}
                >
                  {item.legend}
                </span>
              </div>
              {item.option_description && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Variant
                  </label>
                  <input
                    type="text"
                    value={item.option_description}
                    disabled
                    className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                      resolvedTheme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-300"
                        : "bg-gray-100 border-gray-300 text-gray-600"
                    } focus:outline-none`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Points</label>
                <input
                  type="text"
                  value={item.points}
                  disabled
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } focus:outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="text"
                  value={item.price}
                  disabled
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } focus:outline-none`}
                />
              </div>
            </div>
          </div>

          {/* Stock Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Stock Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Stock
                </label>
                <input
                  type="text"
                  value={item.stock.toString()}
                  disabled
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } focus:outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reorder Level
                </label>
                <input
                  type="text"
                  value={item.reorder_level.toString()}
                  disabled
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } focus:outline-none`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  item.stock_status
                )}`}
              >
                {item.stock_status}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
