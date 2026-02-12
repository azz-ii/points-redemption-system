import { X } from "lucide-react";
import type { ModalBaseProps, Distributor } from "./types";

interface DeleteDistributorModalProps extends ModalBaseProps {
  distributor: Distributor | null;
  onConfirm: () => void;
}

export function DeleteDistributorModal({
  isOpen,
  onClose,
  distributor,
  onConfirm,
}: DeleteDistributorModalProps) {
  if (!isOpen || !distributor) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-distributor-title"
        aria-describedby="delete-distributor-message"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 id="delete-distributor-title" className="text-lg font-semibold">
              Delete Distributor
            </h2>
            <p
              className="text-sm text-muted-foreground"
            >
              Confirm deletion
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <p id="delete-distributor-message" className="text-base">
            Are you sure you want to delete <strong>{distributor.name}</strong>?
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border font-semibold transition-colors border-gray-600 hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
