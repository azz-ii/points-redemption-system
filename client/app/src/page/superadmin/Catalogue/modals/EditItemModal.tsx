import { useTheme } from "next-themes";
import { X, Plus, Trash2, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ModalBaseProps, User } from "./types";
import { PRICING_TYPE_OPTIONS } from "./types";

interface EditItemVariant {
  id: number | null;
  item_code: string;
  option_description: string;
  points: string;
  price: string;
  image_url: string;
  pricing_type: "FIXED" | "PER_SQFT" | "PER_INVOICE" | "PER_DAY" | "PER_EU_SRP";
  points_multiplier: string;
  price_multiplier: string;
}

interface EditItem {
  reward: string;
  item_name: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT";
  needs_driver: boolean;
  mktg_admin: number | null;
  approver: number | null;
  variants: EditItemVariant[];
}

interface EditItemModalProps extends ModalBaseProps {
  editItem: EditItem;
  setEditItem: React.Dispatch<React.SetStateAction<EditItem>>;
  loading: boolean;
  updating: boolean;
  error: string | null;
  onConfirm: () => void;
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onUpdateVariant: (index: number, field: string, value: string) => void;
  users: User[];
}

export function EditItemModal({
  isOpen,
  onClose,
  editItem,
  setEditItem,
  loading,
  updating,
  error,
  onConfirm,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
  users,
}: EditItemModalProps) {
  const { resolvedTheme } = useTheme();
  const [variantsOpen, setVariantsOpen] = useState(true);

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
        aria-labelledby="edit-item-title"
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 id="edit-item-title" className="text-lg font-semibold">
              Edit Catalogue Item
            </h2>
            <p
              className={`text-xs ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Update item details and variants
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

        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-xs">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="text-xs text-gray-500">Loading variants...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Shared Fields */}
              <div className="space-y-2">
                <h3 className="text-base font-medium">Item Details</h3>

                {/* Reward */}
                <div>
                  <label
                    htmlFor="edit-reward"
                    className="block text-xs font-medium mb-1"
                  >
                    Reward Category (Optional)
                  </label>
                  <input
                    id="edit-reward"
                    type="text"
                    value={editItem.reward}
                    onChange={(e) =>
                      setEditItem({ ...editItem, reward: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border text-sm ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., PLATINUM, GOLD, SILVER"
                  />
                </div>

                {/* Item Name */}
                <div>
                  <label
                    htmlFor="edit-item-name"
                    className="block text-xs font-medium mb-1"
                  >
                    Item Name *
                  </label>
                  <input
                    id="edit-item-name"
                    type="text"
                    value={editItem.item_name}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        item_name: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 rounded border text-sm ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., Platinum Polo Shirt"
                    aria-required="true"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="edit-description"
                    className="block text-xs font-medium mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    value={editItem.description}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        description: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 rounded border text-sm ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500 resize-none`}
                    rows={2}
                    placeholder="Detailed description of the item"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label
                    htmlFor="edit-purpose"
                    className="block text-xs font-medium mb-1"
                  >
                    Purpose
                  </label>
                  <textarea
                    id="edit-purpose"
                    value={editItem.purpose}
                    onChange={(e) =>
                      setEditItem({ ...editItem, purpose: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border text-sm ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500 resize-none`}
                    rows={2}
                    placeholder="Purpose of the item"
                  />
                </div>

                {/* Specifications */}
                <div>
                  <label
                    htmlFor="edit-specs"
                    className="block text-xs font-medium mb-1"
                  >
                    Specifications
                  </label>
                  <textarea
                    id="edit-specs"
                    value={editItem.specifications}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        specifications: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 rounded border text-sm ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500 resize-none`}
                    rows={2}
                    placeholder="Specifications (e.g., 100% cotton, XS-XXL)"
                  />
                </div>

                {/* Legend */}
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Category *
                  </label>
                  <select
                    value={editItem.legend}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        legend: e.target.value as
                          | "COLLATERAL"
                          | "GIVEAWAY"
                          | "ASSET"
                          | "BENEFIT",
                      })
                    }
                    className={`w-full px-3 py-2 rounded border text-sm ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                  >
                    <option value="COLLATERAL">Collateral (Red)</option>
                    <option value="GIVEAWAY">Giveaway (Blue)</option>
                    <option value="ASSET">Asset (Yellow)</option>
                    <option value="BENEFIT">Benefit (Green)</option>
                  </select>
                </div>

                {/* Needs Driver */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editItem.needs_driver}
                      onChange={(e) =>
                        setEditItem({ ...editItem, needs_driver: e.target.checked })
                      }
                      className={`w-4 h-4 rounded border ${
                        resolvedTheme === "dark"
                          ? "bg-gray-800 border-gray-600"
                          : "bg-white border-gray-300"
                      } focus:ring-blue-500 accent-blue-600`}
                    />
                    <span className="text-xs font-medium">Needs Driver</span>
                  </label>
                  <p
                    className={`text-xs mt-0.5 ${
                      resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Check if this item requires a driver for delivery/service
                  </p>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setVariantsOpen(!variantsOpen)}
                  className="w-full flex justify-between items-center p-3 rounded border hover:bg-opacity-50 transition-colors"
                >
                  <h3 className="text-base font-medium">Variants</h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddVariant();
                      }}
                      className="px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
                    >
                      <Plus className="h-3 w-3 inline mr-0.5" />
                      Add
                    </button>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        variantsOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {variantsOpen && (
                  <div className="space-y-2">
                    {editItem.variants.map((variant, index) => (
                      <div key={index} className="border rounded p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">
                            Variant {index + 1}
                          </h4>
                          {editItem.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onRemoveVariant(index)}
                              className="px-1.5 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/* Item Code */}
                          <div>
                            <label className="block text-xs font-medium mb-0.5">
                              Item Code *
                            </label>
                            <input
                              type="text"
                              value={variant.item_code}
                              onChange={(e) =>
                                onUpdateVariant(index, "item_code", e.target.value)
                              }
                              className={`w-full px-2 py-1.5 rounded border text-sm ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
                              placeholder="e.g., MC0001"
                            />
                          </div>

                          {/* Option Description */}
                          <div>
                            <label className="block text-xs font-medium mb-0.5">
                              Variant Description (Optional)
                            </label>
                            <input
                              type="text"
                              value={variant.option_description}
                              onChange={(e) =>
                                onUpdateVariant(
                                  index,
                                  "option_description",
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1.5 rounded border text-sm ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
                              placeholder="e.g., Size S, Color Blue"
                            />
                          </div>

                          {/* Pricing Type */}
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium mb-0.5">
                              Pricing Type *
                            </label>
                            <select
                              value={variant.pricing_type}
                              onChange={(e) =>
                                onUpdateVariant(index, "pricing_type", e.target.value)
                              }
                              className={`w-full px-2 py-1.5 rounded border text-sm ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
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
                            <label className="block text-xs font-medium mb-0.5">
                              {variant.pricing_type === "FIXED"
                                ? "Points Required *"
                                : "Points Multiplier *"}
                            </label>
                            <input
                              type="text"
                              value={variant.pricing_type === "FIXED" ? variant.points : variant.points_multiplier}
                              onChange={(e) =>
                                onUpdateVariant(
                                  index,
                                  variant.pricing_type === "FIXED" ? "points" : "points_multiplier",
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1.5 rounded border text-sm ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
                              placeholder={
                                variant.pricing_type === "FIXED"
                                  ? "e.g., 500"
                                  : "e.g., 25"
                              }
                            />
                            {variant.pricing_type !== "FIXED" && (
                              <p
                                className={`text-xs mt-0.5 ${
                                  resolvedTheme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                Points: {variant.pricing_type === "PER_SQFT" ? "sq ft" : variant.pricing_type === "PER_INVOICE" ? "invoice amount" : variant.pricing_type === "PER_DAY" ? "days" : "EU SRP"} × multiplier
                              </p>
                            )}
                          </div>

                          {/* Price - Label changes based on pricing type */}
                          <div>
                            <label className="block text-xs font-medium mb-0.5">
                              {variant.pricing_type === "FIXED"
                                ? "Price *"
                                : "Price Multiplier *"}
                            </label>
                            <input
                              type="text"
                              value={variant.pricing_type === "FIXED" ? variant.price : variant.price_multiplier}
                              onChange={(e) =>
                                onUpdateVariant(
                                  index,
                                  variant.pricing_type === "FIXED" ? "price" : "price_multiplier",
                                  e.target.value
                                )
                              }
                              className={`w-full px-2 py-1.5 rounded border text-sm ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
                              placeholder={
                                variant.pricing_type === "FIXED"
                                  ? "e.g., ₱130.00"
                                  : "e.g., 25.00"
                              }
                            />
                          </div>

                          {/* Image URL */}
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium mb-0.5">
                              Image URL (Optional)
                            </label>
                            <input
                              type="url"
                              value={variant.image_url}
                              onChange={(e) =>
                                onUpdateVariant(index, "image_url", e.target.value)
                              }
                              className={`w-full px-2 py-1.5 rounded border text-sm ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
                              placeholder="https://example.com/image.jpg"
                            />
                            {/* Image Preview */}
                            {variant.image_url && (
                              <div className="mt-1 bg-gray-300 aspect-video overflow-hidden rounded">
                                <img
                                  src={variant.image_url || "/images/tshirt.png"}
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
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-3 border-t border-gray-700 flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={updating}
            className={`px-4 py-1.5 rounded-lg border text-sm transition-colors ${
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
            className="px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? "Updating..." : "Update Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
