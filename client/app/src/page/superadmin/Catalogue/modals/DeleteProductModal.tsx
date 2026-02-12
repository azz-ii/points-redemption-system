import { X, Archive } from "lucide-react";
import type { ModalBaseProps, Product } from "./types";

interface ArchiveProductModalProps extends ModalBaseProps {
  product: Product | null;
  loading?: boolean;
  onConfirm: (id: number) => void;
}

export function ArchiveProductModal({
  isOpen,
  onClose,
  product,
  loading,
  onConfirm,
}: ArchiveProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="archive-product-title"
        aria-describedby="archive-product-message"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
      >
        <div className="flex justify-between items-center p-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Archive className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h2 id="archive-product-title" className="text-base font-semibold">
                Archive Product
              </h2>
              <p className="text-xs text-gray-500 mt-0">
                This action can be reversed.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">
          <p id="archive-product-message">
            Are you sure you want to archive product{" "}
            <strong>{product.item_code}</strong> ({product.item_name || "No name"})?
          </p>
          <p className="text-sm text-muted-foreground">
            Archived products will no longer appear in the catalogue or be available for redemption requests. You can restore them later.
          </p>
        </div>

        <div className="p-3 border-t flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-2 rounded-lg font-semibold border transition-colors border-border bg-muted hover:bg-accent text-sm"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(product.id)}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
