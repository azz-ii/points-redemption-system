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
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-product-title" className="text-xl font-semibold">
              View Product
            </h2>
            <p
              className={`text-sm ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
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

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product ID */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Product ID</p>
              <p className="font-semibold">{product.id}</p>
            </div>

            {/* Item Code */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Item Code</p>
              <p className="font-mono font-semibold">{product.item_code}</p>
            </div>

            {/* Item Name */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Item Name</p>
              <p className="font-semibold">{product.item_name}</p>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Category</p>
              <p className="font-semibold">
                {product.category || "-"}
              </p>
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

            {/* Points */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Points Required</p>
              <p className="font-semibold">{product.points}</p>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Price</p>
              <p className="font-semibold">{product.price}</p>
            </div>

            {/* Pricing Type */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Pricing Type</p>
              <p className="font-semibold">{pricingLabel}</p>
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
                  <p className="text-xs text-gray-500 mb-1">Total Stock</p>
                  <p className="font-semibold">{product.stock}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Available Stock</p>
                  <p className="font-semibold">{product.available_stock}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Committed Stock</p>
                  <p className="font-semibold">{product.committed_stock}</p>
                </div>
              </>
            ) : (
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Stock Status</p>
                <p className="font-semibold text-blue-600">Made to order - No stock tracking</p>
              </div>
            )}

            {/* Order Quantity Limits */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Min Order Qty</p>
              <p className="font-semibold">{product.min_order_qty ?? 1}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Max Order Qty</p>
              <p className="font-semibold">{product.max_order_qty ?? "Unlimited"}</p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p
                  className={`leading-relaxed ${
                    resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Purpose */}
            {product.purpose && (
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Purpose</p>
                <p
                  className={`leading-relaxed ${
                    resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {product.purpose}
                </p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Specifications</p>
                <p
                  className={`leading-relaxed ${
                    resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {product.specifications}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg border transition-colors ${
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
