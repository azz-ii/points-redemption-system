import { X, Archive } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";

interface ArchiveAccountModalProps extends ModalBaseProps {
  account: Account | null;
  loading: boolean;
  onConfirm: (id: number) => void;
}

export function ArchiveAccountModal({
  isOpen,
  onClose,
  account,
  loading,
  onConfirm,
}: ArchiveAccountModalProps) {
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
        aria-labelledby="archive-account-title"
        aria-describedby="archive-account-message"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
      >
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Archive className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 id="archive-account-title" className="text-base font-semibold">
                Archive User
              </h2>
              <p className="text-xs text-gray-500 mt-0">
                This action can be reversed.
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
          <p id="archive-account-message" className="text-base">
            Are you sure you want to archive <strong>{account.full_name}</strong>{" "}
            ({account.username})?
          </p>
          <p className="text-sm text-muted-foreground">
            Archived accounts cannot log in to the system. You can restore this account later.
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
            className="px-4 py-2 rounded-lg font-semibold transition-colors bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
          >
            {loading ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
