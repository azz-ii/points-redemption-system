import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();

  if (!isOpen || accounts.length === 0) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-lg w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
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
            <p className="text-xs text-gray-500 mt-0.5">
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

        <div className="p-4 space-y-3">
          <p className="text-sm">
            Are you sure you want to delete <strong>{accounts.length}</strong>{" "}
            user{accounts.length > 1 ? "s" : ""}?
          </p>

          <div className="space-y-0.5 max-h-[70vh] overflow-y-auto">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`text-xs px-2 py-1 rounded ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <strong>{account.full_name}</strong> ({account.username})
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
              resolvedTheme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-2 rounded-lg font-semibold text-sm transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
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
