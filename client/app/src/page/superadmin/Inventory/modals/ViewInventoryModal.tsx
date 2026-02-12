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
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-inventory-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="view-inventory-title" className="text-lg font-semibold">
                Inventory Details
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  item.stock_status
                )}`}
              >
                {item.stock_status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
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
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
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
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
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
                  className="w-full px-3 py-2 rounded border cursor-not-allowed font-mono bg-muted border-gray-600 text-foreground focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={item.category}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Legend
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                    item.legend
                  )}`}
                >
                  {item.legend.replace("_", " ")}
                </span>
              </div>
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
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="text"
                  value={item.price}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
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
                  Total Stock
                </label>
                <input
                  type="text"
                  value={item.stock.toString()}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Committed Stock
                </label>
                <input
                  type="text"
                  value={item.committed_stock.toString()}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed font-semibold bg-muted border-gray-600 text-orange-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Available Stock
                </label>
                <input
                  type="text"
                  value={item.available_stock.toString()}
                  disabled
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed font-semibold bg-muted border-gray-600 ${
                    item.available_stock === 0
                      ? "text-red-500"
                      : "text-green-500"
                  } focus:outline-none`}
                />
              </div>
            </div>
            <p
              className="text-xs text-muted-foreground"
            >
              Available Stock = Total Stock - Committed Stock (reserved for pending/approved requests)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground border border-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
