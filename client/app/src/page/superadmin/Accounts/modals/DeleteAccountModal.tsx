import { X } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";

interface DeleteAccountModalProps extends ModalBaseProps {
  account: Account | null;
  loading: boolean;
  onConfirm: (id: number) => void;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  account,
  loading,
  onConfirm,
}: DeleteAccountModalProps) {
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
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-message"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 id="delete-account-title" className="text-lg font-semibold">
              Delete User
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <p id="delete-account-message" className="text-base">
            Are you sure you want to delete <strong>{account.full_name}</strong>{" "}
            ({account.username})?
          </p>
        </div>

        <div className="p-4 border-t flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-destructive hover:bg-destructive/90 text-white disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
