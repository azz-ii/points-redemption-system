import { useState, useRef } from "react";
import { CheckCircle, Loader2, X, Package, Camera, Trash2 } from "lucide-react";
import type { ModalBaseProps, RedemptionItem, RequestItemVariant, ProcessItemData } from "./types";

interface MarkAsProcessedModalProps extends ModalBaseProps {
  item: RedemptionItem | null;
  myItems?: RequestItemVariant[];
  pendingCount?: number;
  onConfirm: (items: ProcessItemData[], photo?: File) => Promise<void>;
}

export function MarkAsProcessedModal({
  isOpen,
  onClose,
  item,
  myItems = [],
  onConfirm,
}: MarkAsProcessedModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Build per-item state: { enabled, qty, notes }
  type ItemState = { enabled: boolean; qty: number; notes: string };
  const pendingItems = myItems.filter((it) => !it.item_processed_by);

  const buildInitialState = (): Record<number, ItemState> => {
    const state: Record<number, ItemState> = {};
    for (const it of pendingItems) {
      const isFixed = !it.pricing_type || it.pricing_type === "FIXED";
      const remaining = it.remaining_quantity ?? it.quantity;
      state[it.id] = { enabled: true, qty: isFixed ? remaining : 1, notes: "" };
    }
    return state;
  };

  const [itemStates, setItemStates] = useState<Record<number, ItemState>>(buildInitialState);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !item) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select a PNG, JPG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }
    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setSelectedPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = async () => {
    const selectedItems: ProcessItemData[] = [];
    for (const it of pendingItems) {
      const s = itemStates[it.id];
      if (!s?.enabled) continue;
      const isFixed = !it.pricing_type || it.pricing_type === "FIXED";
      selectedItems.push({
        item_id: it.id,
        ...(isFixed ? { fulfilled_quantity: s.qty } : {}),
        ...(s.notes ? { notes: s.notes } : {}),
      });
    }
    if (selectedItems.length === 0) return;
    setIsSubmitting(true);
    try {
      await onConfirm(selectedItems, selectedPhoto ?? undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const updateState = (id: number, patch: Partial<ItemState>) =>
    setItemStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const enabledCount = Object.values(itemStates).filter((s) => s.enabled).length;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-2xl w-full border border-border max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-processed-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 id="mark-processed-title" className="text-xl font-semibold">
                Mark Items as Processed
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Request #{item.id}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="hover:opacity-70 transition-opacity disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-5">
          <p className="text-sm text-muted-foreground">
            Select the items to fulfill and adjust quantities as needed.
          </p>

          {pendingItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Package className="h-8 w-8" />
              <p className="text-sm">All your items have already been processed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingItems.map((it) => {
                const s = itemStates[it.id] ?? { enabled: true, qty: 1, notes: "" };
                const isFixed = !it.pricing_type || it.pricing_type === "FIXED";
                const remaining = it.remaining_quantity ?? it.quantity;
                const alreadyFulfilled = it.fulfilled_quantity ?? 0;

                return (
                  <div
                    key={it.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      s.enabled
                        ? "border-border bg-muted/40"
                        : "border-border/40 bg-muted/10 opacity-50"
                    }`}
                  >
                    {/* Item header with checkbox */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id={`item-check-${it.id}`}
                        checked={s.enabled}
                        onChange={(e) => updateState(it.id, { enabled: e.target.checked })}
                        disabled={isSubmitting}
                        className="mt-1 h-4 w-4 accent-green-600 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`item-check-${it.id}`}
                          className="font-medium text-sm cursor-pointer"
                        >
                          {it.product_name}
                        </label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Code: {it.product_code}
                          {it.pricing_type && it.pricing_type !== "FIXED" && (
                            <> &bull; {it.pricing_type}</>
                          )}
                        </p>

                        {/* Progress bar for FIXED items with prior partial fulfillment */}
                        {isFixed && alreadyFulfilled > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Fulfilled so far: {alreadyFulfilled} / {it.quantity}</span>
                              <span>{remaining} remaining</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${Math.round((alreadyFulfilled / it.quantity) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Quantity input for FIXED items */}
                        {isFixed && s.enabled && (
                          <div className="mt-3 flex items-center gap-3">
                            <label className="text-xs text-muted-foreground whitespace-nowrap">
                              Fulfill now:
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={remaining}
                              value={s.qty}
                              onChange={(e) => {
                                const v = Math.max(1, Math.min(remaining, parseInt(e.target.value) || 1));
                                updateState(it.id, { qty: v });
                              }}
                              disabled={isSubmitting}
                              className="w-20 text-sm border border-border rounded-md px-2 py-1 bg-background focus:ring-1 focus:ring-green-500 focus:outline-none"
                            />
                            <span className="text-xs text-muted-foreground">/ {remaining} remaining</span>
                          </div>
                        )}

                        {/* Notes */}
                        {s.enabled && (
                          <div className="mt-2">
                            <input
                              type="text"
                              placeholder="Notes (optional)"
                              value={s.notes}
                              onChange={(e) => updateState(it.id, { notes: e.target.value })}
                              disabled={isSubmitting}
                              className="w-full text-xs border border-border rounded-md px-2 py-1 bg-background placeholder:text-muted-foreground focus:ring-1 focus:ring-green-500 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Items marked with partial quantities will remain available for future fulfillment passes.
            </p>
          </div>

          {/* Processing photo upload */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Handover Photo</label>
              <span className="text-xs text-muted-foreground">(optional)</span>
            </div>
            {photoPreview ? (
              <div className="relative inline-block">
                <img
                  src={photoPreview}
                  alt="Processing photo preview"
                  className="h-24 w-24 object-cover rounded-lg border border-border"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isSubmitting}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  aria-label="Remove photo"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <p className="text-xs text-muted-foreground mt-1 truncate max-w-[6rem]">{selectedPhoto?.name}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-3 py-2 text-xs border border-dashed border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                Attach photo
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-8 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {enabledCount} of {pendingItems.length} item(s) selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 bg-card hover:bg-accent text-foreground border border-border"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || enabledCount === 0}
              className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              aria-label="Confirm processing"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Confirm
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
