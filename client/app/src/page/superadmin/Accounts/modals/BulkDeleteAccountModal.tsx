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
        <div className="flex justify-between items-center p-8">
          <div>
            <h2
              id="bulk-delete-account-title"
              className="text-xl font-semibold"
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

        <div className="p-8 space-y-6">
          <p>
            Are you sure you want to delete <strong>{accounts.length}</strong>{" "}
            user{accounts.length > 1 ? "s" : ""}?
          </p>

          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`text-sm px-3 py-2 rounded ${
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

        <div className="p-8 border-t flex gap-3">
          <button
            onClick={handleClose}
            className={`px-6 py-3 rounded font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-white hover:bg-gray-100 text-gray-900"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-3 rounded font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                : "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            }`}
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
