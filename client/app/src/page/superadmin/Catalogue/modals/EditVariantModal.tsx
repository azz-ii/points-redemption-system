import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { ModalBaseProps, CatalogueVariant } from "./types";

interface EditVariantData {
  item_code: string;
  option_description: string;
  points: string;
  price: string;
  image_url: string;
}

interface EditVariantModalProps extends ModalBaseProps {
  variant: CatalogueVariant | null;
  data: EditVariantData;
  setData: React.Dispatch<React.SetStateAction<EditVariantData>>;
  updating: boolean;
  error: string | null;
  onConfirm: () => void;
}

export function EditVariantModal({
  isOpen,
  onClose,
  variant,
  data,
  setData,
  updating,
  error,
  onConfirm,
}: EditVariantModalProps) {
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
            <h2 className="text-xl font-semibold">Edit Variant</h2>
            <p
              className={`text-sm ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Update variant details
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
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Item Code */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Item Code *
              </label>
              <input
                type="text"
                value={data.item_code}
                onChange={(e) =>
                  setData({
                    ...data,
                    item_code: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500`}
                placeholder="e.g., MC0001"
              />
            </div>

            {/* Option Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Variant Description (Optional)
              </label>
              <input
                type="text"
                value={data.option_description}
                onChange={(e) =>
                  setData({
                    ...data,
                    option_description: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500`}
                placeholder="e.g., Size S, Color Blue"
              />
            </div>

            {/* Points */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Points Required *
              </label>
              <input
                type="text"
                value={data.points}
                onChange={(e) =>
                  setData({
                    ...data,
                    points: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500`}
                placeholder="e.g., 500"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <input
                type="text"
                value={data.price}
                onChange={(e) =>
                  setData({
                    ...data,
                    price: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500`}
                placeholder="e.g., ₱130.00"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                value={data.image_url}
                onChange={(e) =>
                  setData({
                    ...data,
                    image_url: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500`}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={updating}
            className={`px-6 py-2 rounded-lg border transition-colors ${
              resolvedTheme === "dark"
                ? "border-gray-600 hover:bg-gray-800 disabled:opacity-50"
                : "border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={updating}
            className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? "Updating..." : "Update Variant"}
          </button>
        </div>
      </div>
    </div>
  );
}
