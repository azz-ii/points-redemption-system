import { useTheme } from "next-themes";
import { Trash2, AlertTriangle } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";
import { BaseModal } from "./BaseModal";

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

  const footer = (
    <>
      <button
        onClick={onClose}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          resolvedTheme === "dark"
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-900"
        }`}
      >
        Keep Accounts
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
          resolvedTheme === "dark"
            ? "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        <Trash2 className="h-4 w-4" />
        {loading
          ? "Deleting..."
          : `Delete ${accounts.length} User${accounts.length > 1 ? "s" : ""}`}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Multiple Users"
      subtitle="This action cannot be undone"
      footer={footer}
      isDangerous
    >
      <div className="space-y-4">
        <div
          className={`p-3 rounded-lg border flex gap-2 ${
            resolvedTheme === "dark"
              ? "bg-red-500/5 border-red-500/30"
              : "bg-red-500/5 border-red-500/30"
          }`}
        >
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">
            Deleting these accounts will permanently remove all associated data.
          </p>
        </div>

        <div>
          <p
            className={`text-sm font-medium mb-2 ${
              resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            You are about to delete <strong>{accounts.length}</strong> user
            {accounts.length > 1 ? "s" : ""}:
          </p>

          <div
            className={`space-y-1.5 max-h-48 overflow-y-auto p-3 rounded-lg ${
              resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`text-sm px-2 py-1.5 rounded flex justify-between ${
                  resolvedTheme === "dark"
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <span className="font-medium">{account.full_name}</span>
                <span className="text-gray-500">@{account.username}</span>
              </div>
            ))}
          </div>
        </div>

        <p
          className={`text-sm ${
            resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Please verify the accounts above. This action is permanent and cannot
          be reversed.
        </p>
      </div>
    </BaseModal>
  );
}
