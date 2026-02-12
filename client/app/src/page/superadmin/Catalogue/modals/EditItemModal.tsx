import { X } from "lucide-react";
import type { ModalBaseProps } from "./types";
import { PRICING_TYPE_OPTIONS } from "./types";
import { CatalogueImageUpload } from "../components/CatalogueImageUpload";

interface EditItem {
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

interface EditItemModalProps extends ModalBaseProps {
  editItem: EditItem;
  setEditItem: React.Dispatch<React.SetStateAction<EditItem>>;
  updating: boolean;
  error: string | null;
  onConfirm: () => void;
  currentImage?: string | null;
  imageFile: File | null;
  imagePreview: string | null;
  onImageSelect: (file: File | null) => void;
  onImageRemove: () => void;
}

export function EditItemModal({
  isOpen,
  onClose,
  editItem,
  setEditItem,
  updating,
  error,
  onConfirm,
  currentImage,
  imageFile: _imageFile,
  imagePreview,
  onImageSelect,
  onImageRemove,
}: EditItemModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-4xl w-full border divide-y border-border divide-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-item-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="edit-item-title" className="text-xl font-semibold">
              Edit Product
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update product details
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

          {/* Product Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">PRODUCT INFORMATION</h3>

            {/* Product Image Upload */}
            <CatalogueImageUpload
              currentImage={currentImage}
              onImageSelect={onImageSelect}
              onImageRemove={onImageRemove}
              preview={imagePreview}
            />

            {/* Item Code */}
            <div>
              <label
                htmlFor="edit-item-code"
                className="text-xs text-gray-500 mb-2 block"
              >
                Item Code *
              </label>
              <input
                id="edit-item-code"
                type="text"
                value={editItem.item_code}
                onChange={(e) =>
                  setEditItem({ ...editItem, item_code: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-base"
                placeholder="e.g., MC0001"
                aria-required="true"
              />
            </div>

            {/* Item Name */}
            <div>
              <label
                htmlFor="edit-item-name"
                className="text-xs text-gray-500 mb-2 block"
              >
                Item Name *
              </label>
              <input
                id="edit-item-name"
                type="text"
                value={editItem.item_name}
                onChange={(e) =>
                  setEditItem({ ...editItem, item_name: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-base"
                placeholder="e.g., Platinum Polo Shirt"
                aria-required="true"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="edit-category"
                className="text-xs text-gray-500 mb-2 block"
              >
                Category
              </label>
              <input
                id="edit-category"
                type="text"
                value={editItem.category}
                onChange={(e) =>
                  setEditItem({ ...editItem, category: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-base"
                placeholder="e.g., Size M, Color Blue"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="edit-description"
                className="text-xs text-gray-500 mb-2 block"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                value={editItem.description}
                onChange={(e) =>
                  setEditItem({ ...editItem, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 resize-none text-base"
                rows={3}
                placeholder="Detailed description of the item"
              />
            </div>

            {/* Purpose */}
            <div>
              <label
                htmlFor="edit-purpose"
                className="text-xs text-gray-500 mb-2 block"
              >
                Purpose
              </label>
              <textarea
                id="edit-purpose"
                value={editItem.purpose}
                onChange={(e) =>
                  setEditItem({ ...editItem, purpose: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 resize-none text-base"
                rows={2}
                placeholder="Purpose of the item"
              />
            </div>

            {/* Specifications */}
            <div>
              <label
                htmlFor="edit-specs"
                className="text-xs text-gray-500 mb-2 block"
              >
                Specifications
              </label>
              <textarea
                id="edit-specs"
                value={editItem.specifications}
                onChange={(e) =>
                  setEditItem({ ...editItem, specifications: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 resize-none text-base"
                rows={2}
                placeholder="Specifications (e.g., 100% cotton, XS-XXL)"
              />
            </div>

            {/* Legend */}
            <div>
              <label
                htmlFor="edit-legend"
                className="text-xs text-gray-500 mb-2 block"
              >
                Legend *
              </label>
              <select
                id="edit-legend"
                value={editItem.legend}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
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
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-base"
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
                htmlFor="edit-pricing-type"
                className="text-xs text-gray-500 mb-2 block"
              >
                Pricing Type *
              </label>
              <select
                id="edit-pricing-type"
                value={editItem.pricing_type}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    pricing_type: e.target.value as "FIXED" | "PER_SQFT" | "PER_INVOICE" | "PER_DAY" | "PER_EU_SRP",
                  })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-base"
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
                htmlFor="edit-points"
                className="text-xs text-gray-500 mb-2 block"
              >
                {editItem.pricing_type === "FIXED"
                  ? "Points Required *"
                  : "Points Multiplier *"}
              </label>
              <input
                id="edit-points"
                type="text"
                value={editItem.pricing_type === "FIXED" ? editItem.points : editItem.points_multiplier}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    [editItem.pricing_type === "FIXED" ? "points" : "points_multiplier"]: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-base"
                placeholder={
                  editItem.pricing_type === "FIXED"
                    ? "e.g., 500"
                    : "e.g., 25 (for 25 points per unit)"
                }
                aria-required="true"
              />
              {editItem.pricing_type !== "FIXED" && (
                <p
                  className="text-xs mt-1 text-muted-foreground"
                >
                  Points will be calculated: {editItem.pricing_type === "PER_SQFT" ? "sq ft" : editItem.pricing_type === "PER_INVOICE" ? "invoice amount" : editItem.pricing_type === "PER_DAY" ? "days" : "EU SRP"} × multiplier
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="edit-price"
                className="text-xs text-gray-500 mb-2 block"
              >
                {editItem.pricing_type === "FIXED"
                  ? "Price *"
                  : "Price Multiplier *"}
              </label>
              <input
                id="edit-price"
                type="text"
                value={editItem.pricing_type === "FIXED" ? editItem.price : editItem.price_multiplier}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
                    [editItem.pricing_type === "FIXED" ? "price" : "price_multiplier"]: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-base"
                placeholder={
                  editItem.pricing_type === "FIXED"
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
                  htmlFor="edit-min-order-qty"
                  className="text-xs text-gray-500 mb-2 block"
                >
                  Min Order Qty *
                </label>
                <input
                  id="edit-min-order-qty"
                  type="number"
                  min="1"
                  value={editItem.min_order_qty}
                  onChange={(e) =>
                    setEditItem({ ...editItem, min_order_qty: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-base"
                  placeholder="1"
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-max-order-qty"
                  className="text-xs text-gray-500 mb-2 block"
                >
                  Max Order Qty
                </label>
                <input
                  id="edit-max-order-qty"
                  type="number"
                  min="1"
                  value={editItem.max_order_qty}
                  onChange={(e) =>
                    setEditItem({ ...editItem, max_order_qty: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-base"
                  placeholder="Leave empty for unlimited"
                />
                <p
                  className="text-xs mt-1 text-muted-foreground"
                >
                  Leave empty for unlimited
                </p>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="edit-stock"
                className="text-xs text-gray-500 mb-2 block"
              >
                Stock
              </label>
              <input
                id="edit-stock"
                type="number"
                min="0"
                value={editItem.stock}
                onChange={(e) =>
                  setEditItem({ ...editItem, stock: e.target.value })
                }
                disabled={!editItem.has_stock}
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="e.g., 100"
              />
            </div>

            {/* Has Stock Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editItem.has_stock}
                  onChange={(e) =>
                    setEditItem({ ...editItem, has_stock: e.target.checked })
                  }
                  className="w-5 h-5 rounded border bg-card border-border focus:ring-blue-500 accent-blue-600"
                />
                <span className="text-sm font-medium">Track Inventory</span>
              </label>
              <p
                className="text-xs mt-1 ml-8 text-muted-foreground"
              >
                Uncheck for made-to-order items that don't require stock tracking
              </p>
            </div>

            {/* Requires Sales Approval Toggle */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editItem.requires_sales_approval ?? true}
                  onChange={(e) =>
                    setEditItem({ ...editItem, requires_sales_approval: e.target.checked })
                  }
                  className="w-5 h-5 rounded border bg-card border-border focus:ring-blue-500 accent-blue-600"
                />
                <span className="text-sm font-medium">Requires Sales Approval</span>
              </label>
              <p
                className="text-xs mt-1 ml-8 text-muted-foreground"
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
            disabled={updating}
            className="px-6 py-3 rounded-lg font-semibold border transition-colors border-border hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={updating}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {updating ? "Updating..." : "Update Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
