import { useTheme } from "next-themes";
import { X } from "lucide-react";
import { Image } from "@/components/ui/image";
import type { ModalBaseProps, Variant } from "./types";
import { getLegendColor } from "./types";

interface ViewItemModalProps extends ModalBaseProps {
  viewVariants: Variant[];
  loading: boolean;
}

export function ViewItemModal({
  isOpen,
  onClose,
  viewVariants,
  loading,
}: ViewItemModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen) return null;

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
              View Catalogue Item
            </h2>
            <p
              className={`text-sm ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Item details and variants
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
          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-500">Loading variants...</p>
            </div>
          ) : viewVariants.length > 0 ? (
            <>
              {/* Shared Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Item Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Catalogue Item ID
                    </p>
                    <p className="font-semibold">
                      {viewVariants[0].catalogue_item.id}
                    </p>
                  </div>

                  {/* Reward */}
                  {viewVariants[0].catalogue_item.reward && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Reward Category
                      </p>
                      <p className="font-semibold uppercase">
                        {viewVariants[0].catalogue_item.reward}
                      </p>
                    </div>
                  )}

                  {/* Item Name */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Item Name</p>
                    <p className="font-semibold">
                      {viewVariants[0].catalogue_item.item_name}
                    </p>
                  </div>

                  {/* Legend */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                        viewVariants[0].catalogue_item.legend
                      )}`}
                    >
                      {viewVariants[0].catalogue_item.legend}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p
                    className={`leading-relaxed ${
                      resolvedTheme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {viewVariants[0].catalogue_item.description}
                  </p>
                </div>

                {/* Purpose */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Purpose</p>
                  <p
                    className={`leading-relaxed ${
                      resolvedTheme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {viewVariants[0].catalogue_item.purpose}
                  </p>
                </div>

                {/* Specifications */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Specifications</p>
                  <p
                    className={`leading-relaxed ${
                      resolvedTheme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }`}
                  >
                    {viewVariants[0].catalogue_item.specifications}
                  </p>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Variants ({viewVariants.length})
                  </h3>
                </div>

                {viewVariants.map((variant, index) => (
                  <div
                    key={variant.id}
                    className={`border rounded p-4 space-y-4 ${
                      resolvedTheme === "dark"
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-medium">
                        Variant {index + 1}
                      </h4>
                      <span className="text-xs text-gray-500">
                        ID: {variant.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Item Code */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Item Code</p>
                        <p className="font-mono font-semibold text-sm">
                          {variant.item_code}
                        </p>
                      </div>

                      {/* Option Description */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Variant Description
                        </p>
                        <p className="font-semibold text-sm">
                          {variant.option_description || "-"}
                        </p>
                      </div>

                      {/* Points */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Points Required
                        </p>
                        <p className="font-semibold">{variant.points}</p>
                      </div>

                      {/* Price */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="font-semibold">{variant.price}</p>
                      </div>

                      {/* Image */}
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">Image</p>
                        <div className="bg-gray-300 aspect-video overflow-hidden rounded">
                          <Image
                            src={variant.image_url || ""}
                            alt={`${variant.item_code} - ${
                              variant.option_description || "Variant"
                            }`}
                            fallback="/images/tshirt.png"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No variants found.</p>
            </div>
          )}
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
