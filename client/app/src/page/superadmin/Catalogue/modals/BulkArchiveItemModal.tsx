import { X, Archive } from "lucide-react";
import type { ModalBaseProps, Product } from "./types";

interface BulkArchiveItemModalProps extends ModalBaseProps {
  items: Product[];
  loading?: boolean;
  onConfirm: () => void;
}

export function BulkArchiveItemModal({
  isOpen,
  onClose,
  items,
  loading,
  onConfirm,
}: BulkArchiveItemModalProps) {
  if (!isOpen || items.length === 0) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bulk-archive-title"
      >
        <div className="flex justify-between items-center p-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Archive className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h2 id="bulk-archive-title" className="text-base font-semibold">
                Archive Multiple Items
              </h2>
              <p className="text-xs text-gray-500 mt-0">
                This action can be reversed.
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

        <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
          <p>
            Are you sure you want to archive <strong>{items.length}</strong> item(s)?
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            {items.map((item) => (
              <li key={item.id}>{item.item_name} ({item.item_code})</li>
            ))}
          </ul>
        </div>

        <div className="p-3 border-t flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg font-semibold border transition-colors border-border bg-muted hover:bg-accent text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Archiving..." : `Archive ${items.length} Item(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
