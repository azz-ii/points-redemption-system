import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import type { ModalBaseProps, ProductExtraField } from "./types";
import { PRICING_FORMULA_OPTIONS } from "./types";
import { CatalogueImageUpload } from "../components/CatalogueImageUpload";
import { ExtraFieldsFormBuilder } from "./ExtraFieldsFormBuilder";
import { API_URL } from "@/lib/config";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MarketingUser {
  id: number;
  username: string;
  full_name: string;
}

interface EditItem {
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
  currentMktgAdminUsername?: string | null;
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
  currentMktgAdminUsername,
}: EditItemModalProps) {
  const [marketingUsers, setMarketingUsers] = useState<MarketingUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pendingMktgAdmin, setPendingMktgAdmin] = useState<string | null>(null);
  // Capture the assigned handler at the moment the modal opens, not on first mount
  const originalMktgAdmin = useRef(editItem.mktg_admin);

  useEffect(() => {
    if (isOpen) {
      originalMktgAdmin.current = editItem.mktg_admin;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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

  const handleMktgAdminChange = (newValue: string) => {
    // If currently assigned to someone and changing to a different user, show confirmation
    if (
      originalMktgAdmin.current &&
      newValue &&
      newValue !== originalMktgAdmin.current &&
      currentMktgAdminUsername
    ) {
      setPendingMktgAdmin(newValue);
      return;
    }
    setEditItem({ ...editItem, mktg_admin: newValue });
  };

  const confirmReassignment = () => {
    if (pendingMktgAdmin !== null) {
      setEditItem({ ...editItem, mktg_admin: pendingMktgAdmin });
      setPendingMktgAdmin(null);
    }
  };

  const pendingUserName = pendingMktgAdmin
    ? marketingUsers.find((u) => u.id === parseInt(pendingMktgAdmin))?.full_name ||
      "selected user"
    : "";

  const originalMktgAdminResolved = originalMktgAdmin.current;

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-4xl w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
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
            <p className="text-sm text-muted-foreground mt-1">
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
        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Error Message */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded text-sm">
              {error}
            </div>
          )}

          {/* Product Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">PRODUCT INFORMATION</h3>

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
                className="text-xs text-muted-foreground mb-2 block"
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
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                placeholder="e.g., MC0001"
                aria-required="true"
              />
            </div>

            {/* Item Name */}
            <div>
              <label
                htmlFor="edit-item-name"
                className="text-xs text-muted-foreground mb-2 block"
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
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                placeholder="e.g., Platinum Polo Shirt"
                aria-required="true"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="edit-category"
                className="text-xs text-muted-foreground mb-2 block"
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
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                placeholder="e.g., Size M, Color Blue"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="edit-description"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                value={editItem.description}
                onChange={(e) =>
                  setEditItem({ ...editItem, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring resize-none text-base"
                rows={3}
                placeholder="Detailed description of the item"
              />
            </div>

            {/* Purpose */}
            <div>
              <label
                htmlFor="edit-purpose"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Purpose
              </label>
              <textarea
                id="edit-purpose"
                value={editItem.purpose}
                onChange={(e) =>
                  setEditItem({ ...editItem, purpose: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring resize-none text-base"
                rows={2}
                placeholder="Purpose of the item"
              />
            </div>

            {/* Specifications */}
            <div>
              <label
                htmlFor="edit-specs"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Specifications
              </label>
              <textarea
                id="edit-specs"
                value={editItem.specifications}
                onChange={(e) =>
                  setEditItem({ ...editItem, specifications: e.target.value })
                }
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring resize-none text-base"
                rows={2}
                placeholder="Specifications (e.g., 100% cotton, XS-XXL)"
              />
            </div>

            {/* Legend */}
            <div>
              <label
                htmlFor="edit-legend"
                className="text-xs text-muted-foreground mb-2 block"
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
                htmlFor="edit-pricing-formula"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Pricing Formula *
              </label>
              <select
                id="edit-pricing-formula"
                value={editItem.pricing_formula || "NONE"}
                onChange={(e) =>
                  setEditItem({
                    ...editItem,
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
                  htmlFor="edit-points"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  {(!editItem.pricing_formula || editItem.pricing_formula === "NONE" || editItem.pricing_formula === "DRIVER_MULTIPLIER")
                    ? "Points Required *"
                    : "Points Multiplier *"}
                </label>
                <input
                  id="edit-points"
                  type="text"
                  value={(!editItem.pricing_formula || editItem.pricing_formula === "NONE" || editItem.pricing_formula === "DRIVER_MULTIPLIER") ? editItem.points : editItem.points_multiplier}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      [(!editItem.pricing_formula || editItem.pricing_formula === "NONE" || editItem.pricing_formula === "DRIVER_MULTIPLIER") ? "points" : "points_multiplier"]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                  placeholder={
                    (!editItem.pricing_formula || editItem.pricing_formula === "NONE" || editItem.pricing_formula === "DRIVER_MULTIPLIER")
                      ? "e.g., 500"
                      : "e.g., 25 (for 25 points per unit)"
                  }
                  aria-required="true"
                />
                {editItem.pricing_formula && editItem.pricing_formula !== "NONE" && (
                  <p
                    className="text-xs mt-1 text-muted-foreground"
                  >
                    Points will be calculated based on {PRICING_FORMULA_OPTIONS.find(o => o.value === editItem.pricing_formula)?.label.split('(')[0].trim().toLowerCase() || "formula"}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="edit-price"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  {(!editItem.pricing_formula || editItem.pricing_formula === "NONE" || editItem.pricing_formula === "DRIVER_MULTIPLIER")
                    ? "Price *"
                    : "Price Multiplier *"}
                </label>
                <input
                  id="edit-price"
                  type="text"
                  value={(!editItem.pricing_formula || editItem.pricing_formula === "NONE" || editItem.pricing_formula === "DRIVER_MULTIPLIER") ? editItem.price : editItem.price_multiplier}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      [(!editItem.pricing_formula || editItem.pricing_formula === "NONE" || editItem.pricing_formula === "DRIVER_MULTIPLIER") ? "price" : "price_multiplier"]: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                  placeholder={
                    (!editItem.pricing_formula || editItem.pricing_formula === "NONE" || editItem.pricing_formula === "DRIVER_MULTIPLIER")
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
                  htmlFor="edit-min-order-qty"
                  className="text-xs text-muted-foreground mb-2 block"
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
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                  placeholder="1"
                  aria-required="true"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-max-order-qty"
                  className="text-xs text-muted-foreground mb-2 block"
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
                className="text-xs text-muted-foreground mb-2 block"
              >
                Stock
              </label>
              <p className="px-4 py-3 rounded border bg-muted border-border text-foreground text-base opacity-70">
                {editItem.stock ?? 0} {editItem.has_stock ? '' : '(not tracked)'}
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Stock can only be managed from the Inventory page
              </p>
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
                  checked={editItem.requires_sales_approval ?? true}
                  onChange={(e) =>
                    setEditItem({ ...editItem, requires_sales_approval: e.target.checked })
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
                htmlFor="edit-mktg-admin"
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
                  id="edit-mktg-admin"
                  value={editItem.mktg_admin}
                  onChange={(e) => handleMktgAdminChange(e.target.value)}
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring text-base"
                >
                  <option value="">No handler assigned</option>
                  {marketingUsers.map((user) => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.full_name || user.username}
                    </option>
                  ))}
                </select>
              )}
              {editItem.mktg_admin &&
                editItem.mktg_admin !== originalMktgAdminResolved &&
                originalMktgAdminResolved &&
                currentMktgAdminUsername && (
                  <p className="text-xs mt-1 text-amber-500">
                    Will be reassigned from {currentMktgAdminUsername} on save
                  </p>
                )}
            </div>

            {/* Extra Fields Form Builder */}
            <div className="pt-4 border-t">
              <ExtraFieldsFormBuilder
                extraFields={editItem.extra_fields || []}
                onChange={(fields) =>
                  setEditItem({ ...editItem, extra_fields: fields })
                }
              />
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
            className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors disabled:opacity-50"
          >
            {updating ? "Updating..." : "Update Product"}
          </button>
        </div>
      </div>
    </div>

    <AlertDialog
      open={pendingMktgAdmin !== null}
      onOpenChange={(open) => !open && setPendingMktgAdmin(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Reassignment</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                <span className="font-medium text-foreground">
                  {editItem.item_name}
                </span>{" "}
                is currently assigned to{" "}
                <span className="font-medium text-foreground">
                  {currentMktgAdminUsername}
                </span>
                . Changing the handler to{" "}
                <span className="font-medium text-foreground">
                  {pendingUserName}
                </span>{" "}
                will reassign this product when you save.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border border-border bg-card hover:bg-accent text-foreground">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmReassignment}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Confirm Reassignment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
