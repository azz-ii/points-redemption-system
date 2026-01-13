import { useTheme } from "next-themes";
import { X, Plus, Trash2 } from "lucide-react";
import type { ModalBaseProps, User } from "./types";

interface EditItemVariant {
  id: number | null;
  item_code: string;
  option_description: string;
  points: string;
  price: string;
  image_url: string;
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
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="edit-item-title" className="text-xl font-semibold">
              Edit Catalogue Item
            </h2>
            <p
              className={`text-sm ${
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

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-500">Loading variants...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Shared Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Item Details</h3>

                {/* Reward */}
                <div>
                  <label
                    htmlFor="edit-reward"
                    className="block text-sm font-medium mb-2"
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
                    htmlFor="edit-item-name"
                    className="block text-sm font-medium mb-2"
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
                    htmlFor="edit-description"
                    className="block text-sm font-medium mb-2"
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
                    htmlFor="edit-purpose"
                    className="block text-sm font-medium mb-2"
                  >
                    Purpose
                  </label>
                  <textarea
                    id="edit-purpose"
                    value={editItem.purpose}
                    onChange={(e) =>
                      setEditItem({ ...editItem, purpose: e.target.value })
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
                    htmlFor="edit-specs"
                    className="block text-sm font-medium mb-2"
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
                  <label className="block text-sm font-medium mb-2">
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
                    className={`w-full px-3 py-2 rounded border ${
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

                {/* Marketing Admin */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Marketing Admin (Optional)
                  </label>
                  <select
                    value={editItem.mktg_admin || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        mktg_admin: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
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

                {/* Approver */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Approver (Optional)
                  </label>
                  <select
                    value={editItem.approver || ""}
                    onChange={(e) =>
                      setEditItem({
                        ...editItem,
                        approver: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                  >
                    <option value="">Select Approver</option>
                    {users
                      .filter((u) => u.position === "Approver")
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
                      checked={editItem.needs_driver}
                      onChange={(e) =>
                        setEditItem({ ...editItem, needs_driver: e.target.checked })
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
                    className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Add Variant
                  </button>
                </div>

                {editItem.variants.map((variant, index) => (
                  <div key={index} className="border rounded p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-medium">
                        Variant {index + 1}
                      </h4>
                      {editItem.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveVariant(index)}
                          className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Item Code */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Item Code *
                        </label>
                        <input
                          type="text"
                          value={variant.item_code}
                          onChange={(e) =>
                            onUpdateVariant(index, "item_code", e.target.value)
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
                          value={variant.option_description}
                          onChange={(e) =>
                            onUpdateVariant(
                              index,
                              "option_description",
                              e.target.value
                            )
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
                          value={variant.points}
                          onChange={(e) =>
                            onUpdateVariant(index, "points", e.target.value)
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
                        <label className="block text-sm font-medium mb-2">
                          Price *
                        </label>
                        <input
                          type="text"
                          value={variant.price}
                          onChange={(e) =>
                            onUpdateVariant(index, "price", e.target.value)
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
                          value={variant.image_url}
                          onChange={(e) =>
                            onUpdateVariant(index, "image_url", e.target.value)
                          }
                          className={`w-full px-3 py-2 rounded border ${
                            resolvedTheme === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="https://example.com/image.jpg"
                        />
                        {/* Image Preview */}
                        {variant.image_url && (
                          <div className="mt-2 bg-gray-300 aspect-video overflow-hidden rounded">
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
            </>
          )}
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
            {updating ? "Updating..." : "Update Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
