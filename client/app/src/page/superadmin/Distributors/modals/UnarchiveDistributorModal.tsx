import { X, ArchiveRestore } from "lucide-react";
import type { ModalBaseProps, Distributor } from "./types";

interface UnarchiveDistributorModalProps extends ModalBaseProps {
  distributor: Distributor | null;
  loading: boolean;
  onConfirm: (id: number) => void;
}

export function UnarchiveDistributorModal({
  isOpen,
  onClose,
  distributor,
  loading,
  onConfirm,
}: UnarchiveDistributorModalProps) {
  if (!isOpen || !distributor) return null;

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(distributor.id);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unarchive-distributor-title"
        aria-describedby="unarchive-distributor-message"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
      >
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
              <ArchiveRestore className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 id="unarchive-distributor-title" className="text-lg font-semibold">
                Restore Distributor
              </h2>
              <p className="text-xs text-gray-500 mt-0">
                Restore this archived distributor.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
          <p id="unarchive-distributor-message" className="text-base">
            Are you sure you want to restore <strong>{distributor.name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This distributor will be available for redemption requests again.
          </p>
        </div>

        <div className="p-3 border-t flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-semibold transition-colors bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {loading ? "Restoring..." : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
