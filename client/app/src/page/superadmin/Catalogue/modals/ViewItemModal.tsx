import { useTheme } from "next-themes";
import { X } from "lucide-react";
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
  const { resolvedTheme } = useTheme();

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-4xl w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-item-title"
      >
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-item-title" className="text-xl font-semibold">
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
          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID */}
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Product ID
                </p>
                <p className="font-semibold">
                  {product.id}
                </p>
              </div>

              {/* Item Code */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Item Code</p>
                <p className="font-mono font-semibold">
                  {product.item_code}
                </p>
              </div>

              {/* Item Name */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Item Name</p>
                <p className="font-semibold">
                  {product.item_name}
                </p>
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
                <p className="text-xs text-gray-500 mb-1">Points</p>
                <p className="font-semibold">{product.points}</p>
              </div>

              {/* Price */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Price</p>
                <p className="font-semibold">₱{product.price}</p>
              </div>

              {/* Stock Information */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Stock / Available / Committed</p>
                <p className="font-semibold">
                  {product.stock} / {product.available_stock} / {product.committed_stock}
                </p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p
                  className={`leading-relaxed ${
                    resolvedTheme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  {product.description}
                </p>
              </div>
            )}

            {/* Purpose */}
            {product.purpose && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Purpose</p>
                <p
                  className={`leading-relaxed ${
                    resolvedTheme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  {product.purpose}
                </p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Specifications</p>
                <p
                  className={`leading-relaxed ${
                    resolvedTheme === "dark"
                      ? "text-gray-300"
                      : "text-gray-700"
                  }`}
                >
                  {product.specifications}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg border transition-colors ${
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
