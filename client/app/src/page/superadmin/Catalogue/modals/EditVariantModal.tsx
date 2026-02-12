import { X } from "lucide-react";
import type { ModalBaseProps, CatalogueVariant } from "./types";
import { PRICING_TYPE_OPTIONS } from "./types";

interface EditVariantData {
  item_code: string;
  option_description: string;
  points: string;
  price: string;
  image_url: string;
  pricing_type: "FIXED" | "PER_SQFT" | "PER_INVOICE" | "PER_DAY" | "PER_EU_SRP";
  points_multiplier: string;
  price_multiplier: string;
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
  if (!isOpen || !variant) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-variant-title"
      >
        <div className="flex justify-between items-center p-2">
          <div>
            <h2 id="edit-variant-title" className="text-lg font-semibold">
              Edit Variant
            </h2>
            <p className="text-xs text-gray-500 mt-0">
              Update variant details
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

        <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Item Code */}
            <div>
              <label
                htmlFor="edit-item-code"
                className="text-xs text-gray-500 mb-1 block"
              >
                Item Code *
              </label>
              <input
                id="edit-item-code"
                type="text"
                value={data.item_code}
                onChange={(e) =>
                  setData({
                    ...data,
                    item_code: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-sm"
                placeholder="e.g., MC0001"
              />
            </div>

            {/* Option Description */}
            <div>
              <label
                htmlFor="edit-variant-desc"
                className="text-xs text-gray-500 mb-1 block"
              >
                Variant Description (Optional)
              </label>
              <input
                id="edit-variant-desc"
                type="text"
                value={data.option_description}
                onChange={(e) =>
                  setData({
                    ...data,
                    option_description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-sm"
                placeholder="e.g., Size S, Color Blue"
              />
            </div>

            {/* Pricing Type */}
            <div className="md:col-span-2">
              <label
                htmlFor="edit-variant-pricing-type"
                className="text-xs text-gray-500 mb-1 block"
              >
                Pricing Type *
              </label>
              <select
                id="edit-variant-pricing-type"
                value={data.pricing_type}
                onChange={(e) =>
                  setData({
                    ...data,
                    pricing_type: e.target.value as "FIXED" | "PER_SQFT" | "PER_INVOICE" | "PER_DAY" | "PER_EU_SRP",
                  })
                }
                className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-sm"
              >
                {PRICING_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Points - Label changes based on pricing type */}
            <div>
              <label
                htmlFor="edit-variant-points"
                className="text-xs text-gray-500 mb-1 block"
              >
                {data.pricing_type === "FIXED"
                  ? "Points Required *"
                  : "Points Multiplier *"}
              </label>
              <input
                id="edit-variant-points"
                type="text"
                value={data.pricing_type === "FIXED" ? data.points : data.points_multiplier}
                onChange={(e) =>
                  setData({
                    ...data,
                    [data.pricing_type === "FIXED" ? "points" : "points_multiplier"]: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-sm"
                placeholder={
                  data.pricing_type === "FIXED"
                    ? "e.g., 500"
                    : "e.g., 25 (for 25 points per unit)"
                }
              />
              {data.pricing_type !== "FIXED" && (
                <p
                  className="text-xs mt-0.5 text-muted-foreground"
                >
                  Points: {data.pricing_type === "PER_SQFT" ? "sq ft" : data.pricing_type === "PER_INVOICE" ? "invoice amount" : data.pricing_type === "PER_DAY" ? "days" : "EU SRP"} × multiplier
                </p>
              )}
            </div>

            {/* Price - Label changes based on pricing type */}
            <div>
              <label
                htmlFor="edit-variant-price"
                className="text-xs text-gray-500 mb-1 block"
              >
                {data.pricing_type === "FIXED"
                  ? "Price *"
                  : "Price Multiplier *"}
              </label>
              <input
                id="edit-variant-price"
                type="text"
                value={data.pricing_type === "FIXED" ? data.price : data.price_multiplier}
                onChange={(e) =>
                  setData({
                    ...data,
                    [data.pricing_type === "FIXED" ? "price" : "price_multiplier"]: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-sm"
                placeholder={
                  data.pricing_type === "FIXED"
                    ? "e.g., ₱130.00"
                    : "e.g., 25.00 (for ₱25.00 per unit)"
                }
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label
                htmlFor="edit-variant-image"
                className="text-xs text-gray-500 mb-1 block"
              >
                Image URL (Optional)
              </label>
              <input
                id="edit-variant-image"
                type="url"
                value={data.image_url}
                onChange={(e) =>
                  setData({
                    ...data,
                    image_url: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-sm"
                placeholder="https://example.com/image.jpg"
              />
              {/* Image Preview */}
              {data.image_url && (
                <div className="mt-1 bg-gray-300 h-20 overflow-hidden rounded">
                  <img
                    src={data.image_url || "/images/tshirt.png"}
                    alt="Preview"
                    onError={(e) => {
                      e.currentTarget.src = "/images/tshirt.png";
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={updating}
            className="px-4 py-2 rounded-lg font-semibold border transition-colors border-border hover:bg-accent disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={updating}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {updating ? "Updating..." : "Update Variant"}
          </button>
        </div>
      </div>
    </div>
  );
}
