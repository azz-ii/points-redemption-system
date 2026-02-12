import { X, ArchiveRestore } from "lucide-react";
import type { ModalBaseProps, Product } from "./types";

interface UnarchiveItemModalProps extends ModalBaseProps {
  item: Product | null;
  loading?: boolean;
  onConfirm: (id: number) => void;
}

export function UnarchiveItemModal({
  isOpen,
  onClose,
  item,
  loading,
  onConfirm,
}: UnarchiveItemModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unarchive-item-title"
      >
        <div className="flex justify-between items-center p-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArchiveRestore className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h2 id="unarchive-item-title" className="text-base font-semibold">
                Restore Item
              </h2>
              <p className="text-xs text-gray-500 mt-0">
                Restore this archived item.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-2 space-y-2">
          <p>
            Are you sure you want to restore <strong>{item.item_name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This item will be made available again in the catalogue and for redemption requests.
          </p>
        </div>

        <div className="p-2 border-t flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-3 py-1.5 rounded-lg font-semibold border transition-colors border-border bg-muted hover:bg-accent text-sm"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(item.id)}
            disabled={loading}
            className="flex-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Restoring..." : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
