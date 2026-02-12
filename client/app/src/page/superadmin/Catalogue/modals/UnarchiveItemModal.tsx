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
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ArchiveRestore className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 id="unarchive-item-title" className="text-xl font-semibold">
                Restore Item
              </h2>
              <p className="text-sm text-gray-500 mt-1">
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

        <div className="p-8 space-y-6">
          <p>
            Are you sure you want to restore <strong>{item.item_name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This item will be made available again in the catalogue and for redemption requests.
          </p>
        </div>

        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-lg font-semibold border transition-colors border-border bg-muted hover:bg-accent"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(item.id)}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Restoring..." : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
