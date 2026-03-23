import { X, Package } from "lucide-react";
import type { ModalBaseProps, Product } from "./types";
import { getLegendColor } from "./types";
import { MarketingHandlerSection } from "../components";

interface ViewItemModalProps extends ModalBaseProps {
  product: Product | null;
  onAssignmentChange?: () => void;
}

export function ViewItemModal({
  isOpen,
  onClose,
  product,
  onAssignmentChange,
}: ViewItemModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-4xl w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-item-title"
      >
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-item-title" className="text-xl font-semibold">
              View Product
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Product details
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

        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">PRODUCT DETAILS</h3>

            {/* Product Image */}
            <div className="flex justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.item_name}
                  className="w-48 h-48 rounded-lg object-cover border-2 border-border"
                />
              ) : (
                <div className={`w-48 h-48 rounded-lg flex flex-col items-center justify-center bg-muted border-border border-2`}>
                  <Package className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No image</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID */}
              <div>
                <label className="block text-sm font-medium mb-2">Product ID</label>
                <input
                  type="text"
                  value={product.id}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Item Code */}
              <div>
                <label className="block text-sm font-medium mb-2">Item Code</label>
                <input
                  type="text"
                  value={product.item_code}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed font-mono bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Item Name</label>
                <input
                  type="text"
                  value={product.item_name}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={product.category || "-"}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Legend */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Legend</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                    product.legend
                  )}`}
                >
                  {product.legend.replace(/_/g, " ")}
                </span>
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium mb-2">Points</label>
                <input
                  type="text"
                  value={product.points}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="text"
                  value={`₱${product.price}`}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Tracks Inventory */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Inventory Tracking</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    product.has_stock
                      ? "bg-emerald-500/15 text-[color-mix(in_srgb,var(--color-emerald-500)_70%,black)] dark:text-emerald-300"
                      : "bg-blue-500/15 text-[color-mix(in_srgb,var(--color-blue-500)_70%,black)] dark:text-blue-300"
                  }`}
                >
                  {product.has_stock ? "Tracks Stock" : "Made to Order"}
                </span>
              </div>

              {/* Stock Information */}
              {product.has_stock ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Stock / Available / Committed</label>
                  <input
                    type="text"
                    value={`${product.stock} / ${product.available_stock} / ${product.committed_stock}`}
                    disabled
                    className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                  />
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Stock Status</label>
                  <input
                    type="text"
                    value="Made to order - No stock tracking"
                    disabled
                    className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-primary focus:outline-none"
                  />
                </div>
              )}

              {/* Order Quantity Limits */}
              <div>
                <label className="block text-sm font-medium mb-2">Min Order Qty</label>
                <input
                  type="text"
                  value={product.min_order_qty ?? 1}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Order Qty</label>
                <input
                  type="text"
                  value={product.max_order_qty ?? "Unlimited"}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Pricing Formula */}
              {product.pricing_formula && product.pricing_formula !== "NONE" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Pricing Formula</label>
                  <input
                    type="text"
                    value={product.pricing_formula.replace(/_/g, " ")}
                    disabled
                    className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Custom Fields */}
            {product.extra_fields && product.extra_fields.length > 0 && (
              <div className="pt-2">
                <label className="block text-sm font-medium mb-2">Custom Fields</label>
                <div className="border rounded-md overflow-hidden bg-card">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground w-1/3 border-b">Label</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground w-1/4 border-b">Type</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground w-1/4 border-b">Required</th>
                        <th className="px-4 py-2 text-left font-medium text-muted-foreground border-b">Choices</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {product.extra_fields.map((field) => (
                        <tr key={field.id || field.field_key} className="hover:bg-muted/50">
                          <td className="px-4 py-2 text-foreground font-medium">{field.label}</td>
                          <td className="px-4 py-2 text-muted-foreground">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">
                              {field.field_type}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {field.is_required ? (
                              <span className="text-red-500">Yes</span>
                            ) : (
                              <span>No</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground truncate max-w-[200px]">
                            {field.field_type === "CHOICE" && field.choices_json
                              ? field.choices_json.join(", ")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={product.description}
                  disabled
                  rows={3}
                  className="w-full px-3 py-2 rounded border cursor-not-allowed resize-none bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            )}

            {/* Purpose */}
            {product.purpose && (
              <div>
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <textarea
                  value={product.purpose}
                  disabled
                  rows={2}
                  className="w-full px-3 py-2 rounded border cursor-not-allowed resize-none bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            )}

            {/* Specifications */}
            {product.specifications && (
              <div>
                <label className="block text-sm font-medium mb-2">Specifications</label>
                <textarea
                  value={product.specifications}
                  disabled
                  rows={2}
                  className="w-full px-3 py-2 rounded border cursor-not-allowed resize-none bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Marketing Handler Assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">MARKETING HANDLER</h3>
            <MarketingHandlerSection
              productId={product.id}
              productName={product.item_name}
              currentMktgAdminId={product.mktg_admin}
              currentMktgAdminUsername={product.mktg_admin_username}
              onAssignmentChange={onAssignmentChange ?? (() => {})}
            />
          </div>
        </div>

        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border transition-colors border-border hover:bg-accent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
