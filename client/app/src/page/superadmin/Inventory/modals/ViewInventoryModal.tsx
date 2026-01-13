import { useTheme } from "next-themes";
import { X, Package } from "lucide-react";
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
              <h2 className="text-xl font-bold">Inventory Details</h2>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View stock information
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
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <p
              className={`text-sm mb-1 ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Item Name
            </p>
            <p className="font-semibold text-lg">{item.item_name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p
                className={`text-sm mb-1 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Item Code
              </p>
              <p className="font-mono font-semibold">{item.item_code}</p>
            </div>
            <div>
              <p
                className={`text-sm mb-1 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Category
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                  item.legend
                )}`}
              >
                {item.legend}
              </span>
            </div>
          </div>

          {item.option_description && (
            <div>
              <p
                className={`text-sm mb-1 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Variant
              </p>
              <p className="font-medium">{item.option_description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p
                className={`text-sm mb-1 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Points
              </p>
              <p className="font-semibold">{item.points}</p>
            </div>
            <div>
              <p
                className={`text-sm mb-1 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Price
              </p>
              <p className="font-semibold">{item.price}</p>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg ${
              resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            <p
              className={`text-sm mb-3 font-medium ${
                resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Stock Information
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p
                  className={`text-sm mb-1 ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Current Stock
                </p>
                <p className="font-semibold text-2xl">{item.stock}</p>
              </div>
              <div>
                <p
                  className={`text-sm mb-1 ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Reorder Level
                </p>
                <p className="font-semibold text-2xl">{item.reorder_level}</p>
              </div>
            </div>
            <div className="mt-3">
              <p
                className={`text-sm mb-1 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Status
              </p>
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

        {/* Modal Footer */}
        <div
          className={`p-6 border-t ${
            resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-sm ${
              resolvedTheme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            } transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
