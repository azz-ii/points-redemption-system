import { X } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";

interface BulkDeleteAccountModalProps extends ModalBaseProps {
  accounts: Account[];
  loading: boolean;
  onConfirm: () => void;
}

export function BulkDeleteAccountModal({
  isOpen,
  onClose,
  accounts,
  loading,
  onConfirm,
}: BulkDeleteAccountModalProps) {
  if (!isOpen || accounts.length === 0) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bulk-delete-account-title"
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h2
              id="bulk-delete-account-title"
              className="text-lg font-semibold"
            >
              Delete Multiple Users
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p>
            Are you sure you want to delete <strong>{accounts.length}</strong>{" "}
            user{accounts.length > 1 ? "s" : ""}?
          </p>

          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="text-sm px-3 py-2 rounded bg-muted text-foreground"
              >
                <strong>{account.full_name}</strong> ({account.username})
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {loading
              ? "Deleting..."
              : `Delete ${accounts.length} User${
                  accounts.length > 1 ? "s" : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}
