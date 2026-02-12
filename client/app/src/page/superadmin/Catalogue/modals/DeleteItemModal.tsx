import { X, Archive } from "lucide-react";
import type { ModalBaseProps, CatalogueVariant } from "./types";

interface ArchiveItemModalProps extends ModalBaseProps {
  item: CatalogueVariant | null;
  loading?: boolean;
  onConfirm: (id: number) => void;
}

export function ArchiveItemModal({
  isOpen,
  onClose,
  item,
  loading,
  onConfirm,
}: ArchiveItemModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="archive-item-title"
      >
        <div className="flex justify-between items-center p-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Archive className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h2 id="archive-item-title" className="text-base font-semibold">
                Archive Item
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

        <div className="p-2 space-y-2">
          <p>
            Are you sure you want to archive <strong>{item.item_name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            Archived items will no longer appear in the catalogue or be available for redemption requests. You can restore them later.
          </p>
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
            onClick={() => onConfirm(item.id)}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
