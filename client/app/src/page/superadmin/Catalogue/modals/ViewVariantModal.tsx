import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { ModalBaseProps, CatalogueVariant } from "./types";

interface ViewVariantModalProps extends ModalBaseProps {
  variant: CatalogueVariant | null;
}

export function ViewVariantModal({
  isOpen,
  onClose,
  variant,
}: ViewVariantModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !variant) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-2xl w-full border ${
          resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold">View Variant</h2>
            <p
              className={`text-sm ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Variant details
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Variant ID */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Variant ID</p>
              <p className="font-semibold">{variant.id}</p>
            </div>

            {/* Item Code */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Item Code</p>
              <p className="font-mono font-semibold">{variant.item_code}</p>
            </div>

            {/* Option Description */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Variant Description</p>
              <p className="font-semibold">
                {variant.option_description || "-"}
              </p>
            </div>

            {/* Points */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Points Required</p>
              <p className="font-semibold">{variant.points}</p>
            </div>

            {/* Price */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Price</p>
              <p className="font-semibold">{variant.price}</p>
            </div>

            {/* Catalogue Item */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Catalogue Item</p>
              <p className="font-semibold">{variant.item_name}</p>
            </div>

            {/* Image URL */}
            {variant.image_url && (
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-1">Image URL</p>
                <a
                  href={variant.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-sm break-all"
                >
                  {variant.image_url}
                </a>
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
