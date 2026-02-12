import { X, Archive } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";

interface BulkArchiveAccountModalProps extends ModalBaseProps {
  accounts: Account[];
  loading: boolean;
  onConfirm: () => void;
}

export function BulkArchiveAccountModal({
  isOpen,
  onClose,
  accounts,
  loading,
  onConfirm,
}: BulkArchiveAccountModalProps) {
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
        aria-labelledby="bulk-archive-account-title"
      >
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Archive className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2
                id="bulk-archive-account-title"
                className="text-base font-semibold"
              >
                Archive Multiple Users
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                This action can be reversed.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 space-y-3">
          <p>
            Are you sure you want to archive <strong>{accounts.length}</strong>{" "}
            user{accounts.length > 1 ? "s" : ""}? Archived accounts cannot log in to the system.
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
        <div className="p-3 flex justify-end gap-2">
          <button
            onClick={handleClose}
              className="px-4 py-2 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border"
            >
              Cancel
            </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-semibold transition-colors bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
          >
            {loading
              ? "Archiving..."
              : `Archive ${accounts.length} User${
                  accounts.length > 1 ? "s" : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}
