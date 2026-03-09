import { X } from "lucide-react";
import type { InventoryItem, ModalBaseProps } from "./types";
import { getStatusColor, getLegendColor } from "./types";

type AdjustmentAction = "add" | "decrease";

interface EditStockData {
  action: AdjustmentAction;
  quantity: string;
  reason: string;
}

interface EditStockModalProps extends ModalBaseProps {
  item: InventoryItem | null;
  data: EditStockData;
  setData: React.Dispatch<React.SetStateAction<EditStockData>>;
  updating: boolean;
  error: string | null;
  onConfirm: () => void;
}

export function EditStockModal({
  isOpen,
  onClose,
  item,
  data,
  setData,
  updating,
  error,
  onConfirm,
}: EditStockModalProps) {
  if (!isOpen || !item) return null;

  const qty = parseInt(data.quantity) || 0;
  const delta = data.action === "decrease" ? -qty : qty;
  const previewStock = Math.max(0, item.stock + delta);

  // Calculate preview status based on preview stock
  const getPreviewStatus = () => {
    if (previewStock === 0) return "Out of Stock";
    if (previewStock <= 10) return "Low Stock";
    return "In Stock";
  };

  const previewStatus = getPreviewStatus();
  const isDecreaseWithoutReason = data.action === "decrease" && !data.reason.trim();
  const isQuantityEmpty = !data.quantity || qty === 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700 max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-stock-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 id="edit-stock-title" className="text-xl font-semibold">
                Adjust Stock
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  previewStatus
                )}`}
              >
                {previewStatus}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Adjust stock levels for {item.item_name}
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
          {/* Item Info (Read-only) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Item Information
            </h3>
            <div className="p-4 rounded-lg bg-card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{item.item_name}</p>
                  <p className="text-sm font-mono text-muted-foreground">
                    {item.item_code}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                    item.legend
                  )}`}
                >
                  {item.legend.replace("_", " ")}
                </span>
              </div>
              {item.category && (
                <p className="text-sm text-muted-foreground">
                  Category: {item.category}
                </p>
              )}
            </div>
          </div>

          {/* Stock Levels */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Stock Levels
            </h3>

            {/* Current Stock Info (Read-only) */}
            <div className="p-3 rounded-lg border bg-card border-border">
              <p className="text-xs text-muted-foreground mb-2">Current Stock Breakdown</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Total:</span>
                  <p className="font-semibold">{item.stock}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Committed:</span>
                  <p className="font-semibold text-orange-500">{item.committed_stock}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Available:</span>
                  <p
                    className={`font-semibold ${
                      item.available_stock === 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {item.available_stock}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {item.committed_stock > 0
                  ? `${item.committed_stock} unit${item.committed_stock > 1 ? "s" : ""} reserved for pending/approved requests`
                  : "No units currently committed"}
              </p>
            </div>

            {/* Action Toggle */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Action *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setData({ ...data, action: "add", reason: "" })}
                  className={`flex-1 px-4 py-3 rounded border text-sm font-semibold transition-colors ${
                    data.action === "add"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-card border-border text-foreground hover:bg-accent"
                  }`}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setData({ ...data, action: "decrease" })}
                  className={`flex-1 px-4 py-3 rounded border text-sm font-semibold transition-colors ${
                    data.action === "decrease"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-card border-border text-foreground hover:bg-accent"
                  }`}
                >
                  − Decrease Stock
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label
                htmlFor="stock-quantity-input"
                className="text-xs text-muted-foreground mb-2 block"
              >
                Quantity *
              </label>
              <input
                id="stock-quantity-input"
                type="number"
                value={data.quantity}
                onChange={(e) => setData({ ...data, quantity: e.target.value })}
                min="1"
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
                placeholder={`Enter quantity to ${data.action === "add" ? "add" : "remove"}`}
                aria-required="true"
              />
              {qty > 0 && (
                <p className="text-xs mt-1 text-muted-foreground">
                  New total stock: {item.stock} {data.action === "add" ? "+" : "−"} {qty} ={" "}
                  <span className={`font-semibold ${data.action === "decrease" ? "text-red-500" : "text-green-500"}`}>
                    {previewStock}
                  </span>
                </p>
              )}
              {data.action === "decrease" && qty > 0 && previewStock < item.committed_stock && (
                <p className="text-xs mt-1 text-red-500">
                  Cannot decrease below committed stock ({item.committed_stock})
                </p>
              )}
            </div>

            {/* Reason Input (required for decrease, optional for add) */}
            <div>
              <label
                htmlFor="stock-reason-input"
                className="text-xs text-muted-foreground mb-2 block"
              >
                {data.action === "decrease" ? "Reason *" : "Reason (optional)"}
              </label>
              <textarea
                id="stock-reason-input"
                value={data.reason}
                onChange={(e) => setData({ ...data, reason: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring resize-none"
                placeholder={data.action === "decrease"
                  ? "Enter reason for stock decrease (e.g., damaged goods, inventory correction, expired items)"
                  : "Enter reason for stock addition (optional)"}
                aria-required={data.action === "decrease"}
              />
              {isDecreaseWithoutReason && (
                <p className="text-xs mt-1 text-orange-400">
                  Reason is required when decreasing stock
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8">
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={updating}
              className="px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={
                updating ||
                isQuantityEmpty ||
                (data.action === "decrease" && isDecreaseWithoutReason) ||
                (data.action === "decrease" && previewStock < item.committed_stock)
              }
              className={`px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                data.action === "decrease"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {updating
                ? "Updating..."
                : data.action === "add"
                ? `Add ${qty || 0} Stock`
                : `Decrease ${qty || 0} Stock`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
