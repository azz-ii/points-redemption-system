import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import type { ModalBaseProps, ProductExtraField } from "./types";
import { PRICING_FORMULA_OPTIONS } from "./types";
import { CatalogueImageUpload } from "../components/CatalogueImageUpload";
import { ExtraFieldsFormBuilder } from "./ExtraFieldsFormBuilder";
import { API_URL } from "@/lib/config";

interface MarketingUser {
  id: number;
  username: string;
  full_name: string;
}

interface NewItem {
  item_code: string;
  item_name: string;
  category: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: "Collateral" | "Giveaway" | "Asset" | "Benefit";
  pricing_formula: "NONE" | "DRIVER_MULTIPLIER" | "AREA_RATE" | "PER_SQFT" | "PER_INVOICE" | "PER_DAY" | null;
  points: string;
  price: string;
  min_order_qty: string;
  max_order_qty: string;
  stock: string;
  has_stock: boolean;
  requires_sales_approval: boolean;
  points_multiplier: string;
  price_multiplier: string;
  mktg_admin: string;
  extra_fields: ProductExtraField[];
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
  const [marketingUsers, setMarketingUsers] = useState<MarketingUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch(
          `${API_URL}/users/?position=Handler,Admin&page_size=1000`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          setMarketingUsers(data.results || []);
        }
      } catch (err) {
        console.error("Error fetching marketing users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-4xl w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
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
            <p className="text-sm text-muted-foreground mt-1">
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
        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Error Message */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded text-sm">
              {error}
            </div>
          )}

          {/* Shared Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">PRODUCT INFORMATION</h3>

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
                className="text-xs text-muted-foreground mb-2 block"
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
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                placeholder="e.g., MC0001"
                aria-required="true"
              />
            </div>

            {/* Item Name */}
            <div>
              <label
                htmlFor="item-name-input"
                className="text-xs text-muted-foreground mb-2 block"
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
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                placeholder="e.g., Platinum Polo Shirt"
                aria-required="true"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category-input"
                className="text-xs text-muted-foreground mb-2 block"
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
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                placeholder="e.g., Size M, Color Blue"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description-input"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Description
              </label>
              <textarea
                id="description-input"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring resize-none text-base"
                rows={3}
                placeholder="Detailed description of the item"
              />
            </div>

            {/* Purpose */}
            <div>
              <label
                htmlFor="purpose-input"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Purpose
              </label>
              <textarea
                id="purpose-input"
                value={newItem.purpose}
                onChange={(e) =>
                  setNewItem({ ...newItem, purpose: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring resize-none text-base"
                rows={2}
                placeholder="Purpose of the item"
              />
            </div>

            {/* Specifications */}
            <div>
              <label
                htmlFor="specs-input"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Specifications
              </label>
              <textarea
                id="specs-input"
                value={newItem.specifications}
                onChange={(e) =>
                  setNewItem({ ...newItem, specifications: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring resize-none text-base"
                rows={2}
                placeholder="Specifications (e.g., 100% cotton, XS-XXL)"
              />
            </div>

            {/* Legend */}
            <div>
              <label
                htmlFor="legend-select"
                className="text-xs text-muted-foreground mb-2 block"
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
                      | "Collateral"
                      | "Giveaway"
                      | "Asset"
                      | "Benefit",
                  })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                aria-required="true"
              >
                <option value="Collateral">Collateral</option>
                <option value="Giveaway">Giveaway</option>
                <option value="Asset">Asset</option>
                <option value="Benefit">Benefit</option>
              </select>
            </div>

            {/* Pricing Formula */}
            <div>
              <label
                htmlFor="pricing-formula-select"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Pricing Formula *
              </label>
              <select
                id="pricing-formula-select"
                value={newItem.pricing_formula || "NONE"}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    pricing_formula: (e.target.value === "NONE" ? null : e.target.value) as any,
                  })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                aria-required="true"
              >
                {PRICING_FORMULA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="points-input"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  {(!newItem.pricing_formula || newItem.pricing_formula === "NONE" || newItem.pricing_formula === "DRIVER_MULTIPLIER")
                    ? "Points Required *"
                    : "Points Multiplier *"}
                </label>
                <input
                  id="points-input"
                  type="text"
                  value={(!newItem.pricing_formula || newItem.pricing_formula === "NONE" || newItem.pricing_formula === "DRIVER_MULTIPLIER") ? newItem.points : newItem.points_multiplier}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      [(!newItem.pricing_formula || newItem.pricing_formula === "NONE" || newItem.pricing_formula === "DRIVER_MULTIPLIER") ? "points" : "points_multiplier"]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                  placeholder={
                    (!newItem.pricing_formula || newItem.pricing_formula === "NONE" || newItem.pricing_formula === "DRIVER_MULTIPLIER")
                      ? "e.g., 500"
                      : "e.g., 25 (for 25 points per unit)"
                  }
                  aria-required="true"
                />
                {newItem.pricing_formula && newItem.pricing_formula !== "NONE" && (
                  <p
                    className="text-xs mt-1 text-muted-foreground"
                  >
                    Points will be calculated based on {PRICING_FORMULA_OPTIONS.find(o => o.value === newItem.pricing_formula)?.label.split('(')[0].trim().toLowerCase() || "formula"}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price-input"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  {(!newItem.pricing_formula || newItem.pricing_formula === "NONE" || newItem.pricing_formula === "DRIVER_MULTIPLIER")
                    ? "Price *"
                    : "Price Multiplier *"}
                </label>
                <input
                  id="price-input"
                  type="text"
                  value={(!newItem.pricing_formula || newItem.pricing_formula === "NONE" || newItem.pricing_formula === "DRIVER_MULTIPLIER") ? newItem.price : newItem.price_multiplier}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      [(!newItem.pricing_formula || newItem.pricing_formula === "NONE" || newItem.pricing_formula === "DRIVER_MULTIPLIER") ? "price" : "price_multiplier"]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                  placeholder={
                    (!newItem.pricing_formula || newItem.pricing_formula === "NONE" || newItem.pricing_formula === "DRIVER_MULTIPLIER")
                      ? "e.g., ₱130.00"
                      : "e.g., 25.00 (for ₱25.00 per unit)"
                  }
                  aria-required="true"
                />
              </div>
            </div>

            {/* Order Quantity Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="min-order-qty-input"
                  className="text-xs text-muted-foreground mb-2 block"
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
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                  placeholder="1"
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="max-order-qty-input"
                  className="text-xs text-muted-foreground mb-2 block"
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
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
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
                htmlFor="stock-input"
                className="text-xs text-muted-foreground mb-2 block"
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
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-5 h-5 rounded border bg-card border-border focus:ring-ring accent-blue-600"
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
                  checked={newItem.requires_sales_approval}
                  onChange={(e) =>
                    setNewItem({ ...newItem, requires_sales_approval: e.target.checked })
                  }
                  className="w-5 h-5 rounded border bg-card border-border focus:ring-ring accent-blue-600"
                />
                <span className="text-sm font-medium">Requires Sales Approval</span>
              </label>
              <p
                className="text-xs mt-1 ml-8 text-muted-foreground"
              >
                If unchecked, requests with this product will skip sales approval and go directly to marketing
              </p>
            </div>

            {/* Marketing Handler */}
            <div>
              <label
                htmlFor="create-mktg-admin"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Marketing Handler
              </label>
              {loadingUsers ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading users...
                </div>
              ) : (
                <select
                  id="create-mktg-admin"
                  value={newItem.mktg_admin}
                  onChange={(e) =>
                    setNewItem({ ...newItem, mktg_admin: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                >
                  <option value="">No handler (assign later)</option>
                  {marketingUsers.map((user) => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.full_name || user.username}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs mt-1 text-muted-foreground">
                Optional. You can assign a marketing handler later.
              </p>
            </div>

            {/* Extra Fields Form Builder */}
            <div className="pt-4 border-t">
              <ExtraFieldsFormBuilder
                extraFields={newItem.extra_fields || []}
                onChange={(fields) =>
                  setNewItem({ ...newItem, extra_fields: fields })
                }
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-6 py-3 rounded-lg font-semibold border transition-colors border-border hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={creating}
            className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
