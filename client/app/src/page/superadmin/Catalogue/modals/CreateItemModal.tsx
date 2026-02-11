import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { ModalBaseProps } from "./types";
import { PRICING_TYPE_OPTIONS } from "./types";
import { CatalogueImageUpload } from "../components/CatalogueImageUpload";

interface NewItem {
  item_code: string;
  item_name: string;
  category: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: "GIVEAWAY" | "MERCH" | "PROMO" | "AD_MATERIALS" | "POINT_OF_SALE" | "ASSET" | "OTHERS";
  pricing_type: "FIXED" | "PER_SQFT" | "PER_INVOICE" | "PER_DAY" | "PER_EU_SRP";
  points: string;
  price: string;
  min_order_qty: string;
  max_order_qty: string;
  stock: string;
  has_stock: boolean;
  requires_sales_approval: boolean;
  points_multiplier: string;
  price_multiplier: string;
}

interface CreateItemModalProps extends ModalBaseProps {
  newItem: NewItem;
  setNewItem: React.Dispatch<React.SetStateAction<NewItem>>;
  creating: boolean;
  error: string | null;
  onConfirm: () => void;
  imageFile: File | null;
  imagePreview: string | null;
  onImageSelect: (file: File | null) => void;
  onImageRemove: () => void;
}

export function CreateItemModal({
  isOpen,
  onClose,
  newItem,
  setNewItem,
  creating,
  error,
  onConfirm,
  imageFile: _imageFile,
  imagePreview,
  onImageSelect,
  onImageRemove,
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
              Add Catalogue Product
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create a new product in the catalogue
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
            <div className="w-full mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Shared Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">PRODUCT INFORMATION</h3>

            {/* Product Image Upload */}
            <CatalogueImageUpload
              onImageSelect={onImageSelect}
              onImageRemove={onImageRemove}
              preview={imagePreview}
            />

            {/* Item Code */}
            <div>
              <label
                htmlFor="item-code-input"
                className="text-xs text-gray-500 mb-2 block"
              >
                Item Code *
              </label>
              <input
                id="item-code-input"
                type="text"
                value={newItem.item_code}
                onChange={(e) =>
                  setNewItem({ ...newItem, item_code: e.target.value })
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

            {/* Item Name */}
            <div>
              <label
                htmlFor="item-name-input"
                className="text-xs text-gray-500 mb-2 block"
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

            {/* Category */}
            <div>
              <label
                htmlFor="category-input"
                className="text-xs text-gray-500 mb-2 block"
              >
                Category
              </label>
              <input
                id="category-input"
                type="text"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 text-base`}
                placeholder="e.g., Size M, Color Blue"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description-input"
                className="text-xs text-gray-500 mb-2 block"
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
                className="text-xs text-gray-500 mb-2 block"
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
                className="text-xs text-gray-500 mb-2 block"
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
                className="text-xs text-gray-500 mb-2 block"
              >
                Legend *
              </label>
              <select
                id="legend-select"
                value={newItem.legend}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    legend: e.target.value as
                      | "GIVEAWAY"
                      | "MERCH"
                      | "PROMO"
                      | "AD_MATERIALS"
                      | "POINT_OF_SALE"
                      | "ASSET"
                      | "OTHERS",
                  })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 text-base`}
                aria-required="true"
              >
                <option value="GIVEAWAY">Giveaway</option>
                <option value="MERCH">Merch</option>
                <option value="PROMO">Promo</option>
                <option value="AD_MATERIALS">Ad Materials</option>
                <option value="POINT_OF_SALE">Point of Sale</option>
                <option value="ASSET">Asset</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>

            {/* Pricing Type */}
            <div>
              <label
                htmlFor="pricing-type-select"
                className="text-xs text-gray-500 mb-2 block"
              >
                Pricing Type *
              </label>
              <select
                id="pricing-type-select"
                value={newItem.pricing_type}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    pricing_type: e.target.value as "FIXED" | "PER_SQFT" | "PER_INVOICE" | "PER_DAY" | "PER_EU_SRP",
                  })
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

            {/* Points */}
            <div>
              <label
                htmlFor="points-input"
                className="text-xs text-gray-500 mb-2 block"
              >
                {newItem.pricing_type === "FIXED"
                  ? "Points Required *"
                  : "Points Multiplier *"}
              </label>
              <input
                id="points-input"
                type="text"
                value={newItem.pricing_type === "FIXED" ? newItem.points : newItem.points_multiplier}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    [newItem.pricing_type === "FIXED" ? "points" : "points_multiplier"]: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 text-base`}
                placeholder={
                  newItem.pricing_type === "FIXED"
                    ? "e.g., 500"
                    : "e.g., 25 (for 25 points per unit)"
                }
                aria-required="true"
              />
              {newItem.pricing_type !== "FIXED" && (
                <p
                  className={`text-xs mt-1 ${
                    resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  Points will be calculated: {newItem.pricing_type === "PER_SQFT" ? "sq ft" : newItem.pricing_type === "PER_INVOICE" ? "invoice amount" : newItem.pricing_type === "PER_DAY" ? "days" : "EU SRP"} × multiplier
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price-input"
                className="text-xs text-gray-500 mb-2 block"
              >
                {newItem.pricing_type === "FIXED"
                  ? "Price *"
                  : "Price Multiplier *"}
              </label>
              <input
                id="price-input"
                type="text"
                value={newItem.pricing_type === "FIXED" ? newItem.price : newItem.price_multiplier}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    [newItem.pricing_type === "FIXED" ? "price" : "price_multiplier"]: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 text-base`}
                placeholder={
                  newItem.pricing_type === "FIXED"
                    ? "e.g., ₱130.00"
                    : "e.g., 25.00 (for ₱25.00 per unit)"
                }
                aria-required="true"
              />
            </div>

            {/* Order Quantity Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="min-order-qty-input"
                  className="text-xs text-gray-500 mb-2 block"
                >
                  Min Order Qty *
                </label>
                <input
                  id="min-order-qty-input"
                  type="number"
                  min="1"
                  value={newItem.min_order_qty}
                  onChange={(e) =>
                    setNewItem({ ...newItem, min_order_qty: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500 text-base`}
                  placeholder="1"
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="max-order-qty-input"
                  className="text-xs text-gray-500 mb-2 block"
                >
                  Max Order Qty
                </label>
                <input
                  id="max-order-qty-input"
                  type="number"
                  min="1"
                  value={newItem.max_order_qty}
                  onChange={(e) =>
                    setNewItem({ ...newItem, max_order_qty: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500 text-base`}
                  placeholder="Leave empty for unlimited"
                />
                <p
                  className={`text-xs mt-1 ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Leave empty for unlimited
                </p>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="stock-input"
                className="text-xs text-gray-500 mb-2 block"
              >
                Initial Stock
              </label>
              <input
                id="stock-input"
                type="number"
                min="0"
                value={newItem.stock}
                onChange={(e) =>
                  setNewItem({ ...newItem, stock: e.target.value })
                }
                disabled={!newItem.has_stock}
                className={`w-full px-4 py-3 rounded border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:border-blue-500 text-base disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="e.g., 100"
              />
            </div>

            {/* Has Stock Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItem.has_stock}
                  onChange={(e) =>
                    setNewItem({ ...newItem, has_stock: e.target.checked })
                  }
                  className={`w-5 h-5 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  } focus:ring-blue-500 accent-blue-600`}
                />
                <span className="text-sm font-medium">Track Inventory</span>
              </label>
              <p
                className={`text-xs mt-1 ml-8 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Uncheck for made-to-order items that don't require stock tracking
              </p>
            </div>

            {/* Requires Sales Approval Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItem.requires_sales_approval}
                  onChange={(e) =>
                    setNewItem({ ...newItem, requires_sales_approval: e.target.checked })
                  }
                  className={`w-5 h-5 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600"
                      : "bg-white border-gray-300"
                  } focus:ring-blue-500 accent-blue-600`}
                />
                <span className="text-sm font-medium">Requires Sales Approval</span>
              </label>
              <p
                className={`text-xs mt-1 ml-8 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                If unchecked, requests with this product will skip sales approval and go directly to marketing
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={creating}
            className={`px-6 py-3 rounded-lg font-semibold border transition-colors ${
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
            {creating ? "Creating..." : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
