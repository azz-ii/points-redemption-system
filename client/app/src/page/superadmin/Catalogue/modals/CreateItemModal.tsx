import { useTheme } from "next-themes";
import { X, Plus, Trash2 } from "lucide-react";
import type { ModalBaseProps, User } from "./types";
import { PRICING_TYPE_OPTIONS } from "./types";

interface NewItem {
  reward: string;
  item_name: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT";
  needs_driver: boolean;
  mktg_admin: number | null;
  approver: number | null;
  variants: Array<{
    item_code: string;
    option_description: string;
    points: string;
    price: string;
    image_url: string;
    pricing_type: "FIXED" | "PER_SQFT" | "PER_INVOICE" | "PER_DAY" | "PER_EU_SRP";
    points_multiplier: string;
    price_multiplier: string;
  }>;
}

interface CreateItemModalProps extends ModalBaseProps {
  newItem: NewItem;
  setNewItem: React.Dispatch<React.SetStateAction<NewItem>>;
  creating: boolean;
  error: string | null;
  onConfirm: () => void;
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onUpdateVariant: (index: number, field: string, value: string) => void;
  users: User[];
}

export function CreateItemModal({
  isOpen,
  onClose,
  newItem,
  setNewItem,
  creating,
  error,
  onConfirm,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
  users,
}: CreateItemModalProps) {
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
        aria-labelledby="create-item-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="create-item-title" className="text-xl font-semibold">
              Add Catalogue Item
            </h2>
            <p
              className={`text-sm ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Create a new redeemable item with variants
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
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Shared Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Item Details</h3>

            {/* Reward */}
            <div>
              <label
                htmlFor="reward-input"
                className="block text-sm font-medium mb-2"
              >
                Reward Category (Optional)
              </label>
              <input
                id="reward-input"
                type="text"
                value={newItem.reward}
                onChange={(e) =>
                  setNewItem({ ...newItem, reward: e.target.value })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 text-base`}
                placeholder="e.g., PLATINUM, GOLD, SILVER"
              />
            </div>

            {/* Item Name */}
            <div>
              <label
                htmlFor="item-name-input"
                className="block text-sm font-medium mb-2"
              >
                Item Name *
              </label>
              <input
                id="item-name-input"
                type="text"
                value={newItem.item_name}
                onChange={(e) =>
                  setNewItem({ ...newItem, item_name: e.target.value })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 text-base`}
                placeholder="e.g., Platinum Polo Shirt"
                aria-required="true"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description-input"
                className="block text-sm font-medium mb-2"
              >
                Description
              </label>
              <textarea
                id="description-input"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 resize-none text-base`}
                rows={3}
                placeholder="Detailed description of the item"
              />
            </div>

            {/* Purpose */}
            <div>
              <label
                htmlFor="purpose-input"
                className="block text-sm font-medium mb-2"
              >
                Purpose
              </label>
              <textarea
                id="purpose-input"
                value={newItem.purpose}
                onChange={(e) =>
                  setNewItem({ ...newItem, purpose: e.target.value })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 resize-none text-base`}
                rows={2}
                placeholder="Purpose of the item"
              />
            </div>

            {/* Specifications */}
            <div>
              <label
                htmlFor="specs-input"
                className="block text-sm font-medium mb-2"
              >
                Specifications
              </label>
              <textarea
                id="specs-input"
                value={newItem.specifications}
                onChange={(e) =>
                  setNewItem({ ...newItem, specifications: e.target.value })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 resize-none text-base`}
                rows={2}
                placeholder="Specifications (e.g., 100% cotton, XS-XXL)"
              />
            </div>

            {/* Legend */}
            <div>
              <label
                htmlFor="legend-select"
                className="block text-sm font-medium mb-2"
              >
                Category *
              </label>
              <select
                id="legend-select"
                value={newItem.legend}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    legend: e.target.value as
                      | "COLLATERAL"
                      | "GIVEAWAY"
                      | "ASSET"
                      | "BENEFIT",
                  })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 text-base`}
                aria-required="true"
              >
                <option value="COLLATERAL">Collateral (Red)</option>
                <option value="GIVEAWAY">Giveaway (Blue)</option>
                <option value="ASSET">Asset (Yellow)</option>
                <option value="BENEFIT">Benefit (Green)</option>
              </select>
            </div>

            {/* Marketing Admin */}
            <div>
              <label
                htmlFor="mktg-admin-select"
                className="block text-sm font-medium mb-2"
              >
                Marketing Admin (Optional)
              </label>
              <select
                id="mktg-admin-select"
                value={newItem.mktg_admin || ""}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    mktg_admin: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 text-base`}
              >
                <option value="">Select Marketing Admin</option>
                {users
                  .filter((u) => u.position === "Marketing")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.username}
                    </option>
                  ))}
              </select>
            </div>

            {/* Needs Driver */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItem.needs_driver}
                  onChange={(e) =>
                    setNewItem({ ...newItem, needs_driver: e.target.checked })
                  }
                  className={`w-5 h-5 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  } focus:ring-blue-500 accent-blue-600`}
                />
                <span className="text-sm font-medium">Needs Driver</span>
              </label>
              <p
                className={`text-xs mt-1 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Check if this item requires a driver for delivery/service
              </p>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Variants</h3>
              <button
                type="button"
                onClick={onAddVariant}
                className="px-4 py-3 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Add Variant
              </button>
            </div>

            {newItem.variants.map((variant, index) => (
              <div
                key={index}
                className={`border rounded p-4 space-y-4 ${
                  resolvedTheme === "dark"
                    ? "border-gray-700"
                    : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium">Variant {index + 1}</h4>
                  {newItem.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveVariant(index)}
                      className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Item Code */}
                  <div>
                    <label
                      htmlFor={`item-code-${index}`}
                      className="block text-sm font-medium mb-2"
                    >
                      Item Code *
                    </label>
                    <input
                      id={`item-code-${index}`}
                      type="text"
                      value={variant.item_code}
                      onChange={(e) =>
                        onUpdateVariant(index, "item_code", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded border ${
                        resolvedTheme === "dark"
                          ? "bg-gray-800 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:border-blue-500 text-base`}
                      placeholder="e.g., MC0001"
                      aria-required="true"
                    />
                  </div>

                  {/* Option Description */}
                  <div>
                    <label
                      htmlFor={`option-desc-${index}`}
                      className="block text-sm font-medium mb-2"
                    >
                      Variant Description (Optional)
                    </label>
                    <input
                      id={`option-desc-${index}`}
                      type="text"
                      value={variant.option_description}
                      onChange={(e) =>
                        onUpdateVariant(
                          index,
                          "option_description",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 rounded border ${
                        resolvedTheme === "dark"
                          ? "bg-gray-800 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:border-blue-500 text-base`}
                      placeholder="e.g., Size S, Color Blue"
                    />
                  </div>

                  {/* Pricing Type */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`pricing-type-${index}`}
                      className="block text-sm font-medium mb-2"
                    >
                      Pricing Type *
                    </label>
                    <select
                      id={`pricing-type-${index}`}
                      value={variant.pricing_type}
                      onChange={(e) =>
                        onUpdateVariant(index, "pricing_type", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded border ${
                        resolvedTheme === "dark"
                          ? "bg-gray-800 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:border-blue-500 text-base`}
                      aria-required="true"
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
                      htmlFor={`points-${index}`}
                      className="block text-sm font-medium mb-2"
                    >
                      {variant.pricing_type === "FIXED"
                        ? "Points Required *"
                        : "Points Multiplier *"}
                    </label>
                    <input
                      id={`points-${index}`}
                      type="text"
                      value={variant.pricing_type === "FIXED" ? variant.points : variant.points_multiplier}
                      onChange={(e) =>
                        onUpdateVariant(
                          index,
                          variant.pricing_type === "FIXED" ? "points" : "points_multiplier",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 rounded border ${
                        resolvedTheme === "dark"
                          ? "bg-gray-800 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:border-blue-500 text-base`}
                      placeholder={
                        variant.pricing_type === "FIXED"
                          ? "e.g., 500"
                          : "e.g., 25 (for 25 points per unit)"
                      }
                      aria-required="true"
                    />
                    {variant.pricing_type !== "FIXED" && (
                      <p
                        className={`text-xs mt-1 ${
                          resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        Points will be calculated: {variant.pricing_type === "PER_SQFT" ? "sq ft" : variant.pricing_type === "PER_INVOICE" ? "invoice amount" : variant.pricing_type === "PER_DAY" ? "days" : "EU SRP"} × multiplier
                      </p>
                    )}
                  </div>

                  {/* Price - Label changes based on pricing type */}
                  <div>
                    <label
                      htmlFor={`price-${index}`}
                      className="block text-sm font-medium mb-2"
                    >
                      {variant.pricing_type === "FIXED"
                        ? "Price *"
                        : "Price Multiplier *"}
                    </label>
                    <input
                      id={`price-${index}`}
                      type="text"
                      value={variant.pricing_type === "FIXED" ? variant.price : variant.price_multiplier}
                      onChange={(e) =>
                        onUpdateVariant(
                          index,
                          variant.pricing_type === "FIXED" ? "price" : "price_multiplier",
                          e.target.value
                        )
                      }
                      className={`w-full px-4 py-3 rounded border ${
                        resolvedTheme === "dark"
                          ? "bg-gray-800 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:border-blue-500 text-base`}
                      placeholder={
                        variant.pricing_type === "FIXED"
                          ? "e.g., ₱130.00"
                          : "e.g., 25.00 (for ₱25.00 per unit)"
                      }
                      aria-required="true"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor={`image-url-${index}`}
                      className="block text-sm font-medium mb-2"
                    >
                      Image URL (Optional)
                    </label>
                    <input
                      id={`image-url-${index}`}
                      type="url"
                      value={variant.image_url}
                      onChange={(e) =>
                        onUpdateVariant(index, "image_url", e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded border ${
                        resolvedTheme === "dark"
                          ? "bg-gray-800 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:border-blue-500 text-base`}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={creating}
            className={`px-6 py-3 rounded-lg border transition-colors ${
              resolvedTheme === "dark"
                ? "border-gray-600 hover:bg-gray-800 disabled:opacity-50"
                : "border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={creating}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
