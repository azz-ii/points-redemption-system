import { X, Package } from "lucide-react";
import type { ModalBaseProps, Product } from "./types";
import { getLegendColor } from "./types";

interface ViewItemModalProps extends ModalBaseProps {
  product: Product | null;
}

export function ViewItemModal({
  isOpen,
  onClose,
  product,
}: ViewItemModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-4xl w-full border divide-y border-border divide-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-item-title"
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 id="view-item-title" className="text-lg font-semibold">
              View Product
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Product details
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

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">PRODUCT DETAILS</h3>

            {/* Product Image */}
            <div className="flex justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.item_name}
                  className="w-48 h-48 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className={`w-48 h-48 rounded-lg flex flex-col items-center justify-center bg-muted border-border border-2`}>
                  <Package className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-400">No image</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID */}
              <div>
                <label className="block text-sm font-medium mb-2">Product ID</label>
                <input
                  type="text"
                  value={product.id}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Item Code */}
              <div>
                <label className="block text-sm font-medium mb-2">Item Code</label>
                <input
                  type="text"
                  value={product.item_code}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed font-mono bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Item Name</label>
                <input
                  type="text"
                  value={product.item_name}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={product.category || "-"}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Legend */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Legend</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                    product.legend
                  )}`}
                >
                  {product.legend.replace(/_/g, " ")}
                </span>
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium mb-2">Points</label>
                <input
                  type="text"
                  value={product.points}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="text"
                  value={`₱${product.price}`}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Tracks Inventory */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Inventory Tracking</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    product.has_stock
                      ? "bg-green-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {product.has_stock ? "Tracks Stock" : "Made to Order"}
                </span>
              </div>

              {/* Stock Information */}
              {product.has_stock ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Stock / Available / Committed</label>
                  <input
                    type="text"
                    value={`${product.stock} / ${product.available_stock} / ${product.committed_stock}`}
                    disabled
                    className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                  />
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Stock Status</label>
                  <input
                    type="text"
                    value="Made to order - No stock tracking"
                    disabled
                    className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Order Quantity Limits */}
              <div>
                <label className="block text-sm font-medium mb-2">Min Order Qty</label>
                <input
                  type="text"
                  value={product.min_order_qty ?? 1}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Order Qty</label>
                <input
                  type="text"
                  value={product.max_order_qty ?? "Unlimited"}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={product.description}
                  disabled
                  rows={3}
                  className="w-full px-3 py-2 rounded border cursor-not-allowed resize-none bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            )}

            {/* Purpose */}
            {product.purpose && (
              <div>
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <textarea
                  value={product.purpose}
                  disabled
                  rows={2}
                  className="w-full px-3 py-2 rounded border cursor-not-allowed resize-none bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <div>
                <label className="block text-sm font-medium mb-2">Specifications</label>
                <textarea
                  value={product.specifications}
                  disabled
                  rows={2}
                  className="w-full px-3 py-2 rounded border cursor-not-allowed resize-none bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border transition-colors border-border hover:bg-accent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
