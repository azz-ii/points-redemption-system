import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();

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
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-md w-full border ${
          resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold">Delete User</h2>
            <p className="text-xs text-gray-500 mt-1">
              This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p>
            Are you sure you want to delete{" "}
            <strong>{account.full_name}</strong> ({account.username})?
          </p>
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-2">
          <button
            onClick={handleClose}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-white hover:bg-gray-100 text-gray-900"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                : "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            }`}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
