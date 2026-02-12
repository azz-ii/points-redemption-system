import { X, ArchiveRestore } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";

interface UnarchiveAccountModalProps extends ModalBaseProps {
  account: Account | null;
  loading: boolean;
  onConfirm: (id: number) => void;
}

export function UnarchiveAccountModal({
  isOpen,
  onClose,
  account,
  loading,
  onConfirm,
}: UnarchiveAccountModalProps) {
  if (!isOpen || !account) return null;

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(account.id);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unarchive-account-title"
        aria-describedby="unarchive-account-message"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
      >
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <ArchiveRestore className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 id="unarchive-account-title" className="text-xl font-semibold">
                Restore User
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Restore this archived account.
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

        <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
          <p id="unarchive-account-message" className="text-base">
            Are you sure you want to restore <strong>{account.full_name}</strong>{" "}
            ({account.username})?
          </p>
          <p className="text-sm text-muted-foreground">
            This account will be able to log in to the system again.
          </p>
        </div>

        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {loading ? "Restoring..." : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
