import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { ModalBaseProps, Product } from "./types";
import { getLegendColor, PRICING_TYPE_OPTIONS } from "./types";

interface ViewProductModalProps extends ModalBaseProps {
  product: Product | null;
}

export function ViewProductModal({
  isOpen,
  onClose,
  product,
}: ViewProductModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !product) return null;

  const pricingLabel = PRICING_TYPE_OPTIONS.find(opt => opt.value === product.pricing_type)?.label || product.pricing_type;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-3xl w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-product-title"
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 id="view-product-title" className="text-lg font-semibold">
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

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Product ID */}
            <div>
              <label className="block text-xs font-medium mb-1">Product ID</label>
              <input
                type="text"
                value={product.id}
                disabled
                className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>

            {/* Item Code */}
            <div>
              <label className="block text-xs font-medium mb-1">Item Code</label>
              <input
                type="text"
                value={product.item_code}
                disabled
                className={`w-full px-3 py-2 rounded border cursor-not-allowed font-mono ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-xs font-medium mb-1">Item Name</label>
              <input
                type="text"
                value={product.item_name}
                disabled
                className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <input
                type="text"
                value={product.category || "-"}
                disabled
                className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-medium mb-1">Price</label>
              <input
                type="text"
                value={product.price}
                disabled
                className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>

            {/* Points */}
            <div>
              <label className="block text-xs font-medium mb-1">Points Required</label>
              <input
                type="text"
                value={product.points}
                disabled
                className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>

            {/* Legend */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Legend</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                  product.legend
                )}`}
              >
                {product.legend.replace(/_/g, " ")}
              </span>
            </div>

            {/* Pricing Type */}
            <div>
              <label className="block text-xs font-medium mb-1">Pricing Type</label>
              <input
                type="text"
                value={pricingLabel}
                disabled
                className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>

            {/* Tracks Inventory */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Inventory Tracking</p>
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
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Total Stock</label>
                  <input
                    type="text"
                    value={product.stock}
                    disabled
                    className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                      resolvedTheme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-300"
                        : "bg-gray-100 border-gray-300 text-gray-600"
                    } focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Available Stock</label>
                  <input
                    type="text"
                    value={product.available_stock}
                    disabled
                    className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                      resolvedTheme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-300"
                        : "bg-gray-100 border-gray-300 text-gray-600"
                    } focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Committed Stock</label>
                  <input
                    type="text"
                    value={product.committed_stock}
                    disabled
                    className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                      resolvedTheme === "dark"
                        ? "bg-gray-700 border-gray-600 text-gray-300"
                        : "bg-gray-100 border-gray-300 text-gray-600"
                    } focus:outline-none`}
                  />
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">Stock Status</label>
                <input
                  type="text"
                  value="Made to order - No stock tracking"
                  disabled
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-blue-400"
                      : "bg-gray-100 border-gray-300 text-blue-600"
                  } focus:outline-none`}
                />
              </div>
            )}

            {/* Order Quantity Limits */}
            <div>
              <label className="block text-xs font-medium mb-1">Min Order Qty</label>
              <input
                type="text"
                value={product.min_order_qty ?? 1}
                disabled
                className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Max Order Qty</label>
              <input
                type="text"
                value={product.max_order_qty ?? "Unlimited"}
                disabled
                className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 border-gray-600 text-gray-300"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                } focus:outline-none`}
              />
            </div>

            {/* Description */}
            {product.description && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea
                  value={product.description}
                  disabled
                  rows={3}
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed resize-none ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } focus:outline-none`}
                />
              </div>
            )}

            {/* Purpose */}
            {product.purpose && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <textarea
                  value={product.purpose}
                  disabled
                  rows={2}
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed resize-none ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } focus:outline-none`}
                />
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Specifications</label>
                <textarea
                  value={product.specifications}
                  disabled
                  rows={2}
                  className={`w-full px-3 py-2 rounded border cursor-not-allowed resize-none ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-gray-100 border-gray-300 text-gray-600"
                  } focus:outline-none`}
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`px-3 py-2 rounded-lg border transition-colors text-sm ${
              resolvedTheme === "dark"
                ? "border-gray-600 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
