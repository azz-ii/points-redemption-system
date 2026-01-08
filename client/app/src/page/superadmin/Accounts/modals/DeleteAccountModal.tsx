import { useTheme } from "next-themes";
import { Trash2, AlertTriangle } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";
import { BaseModal } from "./BaseModal";

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

  const handleConfirm = () => {
    onConfirm(account.id);
  };

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
        Keep Account
      </button>
      <button
        onClick={handleConfirm}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
          resolvedTheme === "dark"
            ? "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        <Trash2 className="h-4 w-4" />
        {loading ? "Deleting..." : "Delete Account"}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account"
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
            Deleting this account will permanently remove all associated data.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 space-y-3">
          <p
            className={`text-sm font-medium ${
              resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Account to be deleted:
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span
                className={
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }
              >
                Name
              </span>
              <span className="font-semibold">{account.full_name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className={
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }
              >
                Username
              </span>
              <span className="font-semibold">{account.username}</span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className={
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }
              >
                Email
              </span>
              <span className="font-semibold text-sm">{account.email}</span>
            </div>
          </div>
        </div>

        <p
          className={`text-sm ${
            resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Are you absolutely sure you want to delete this account? Please verify
          the details above.
        </p>
      </div>
    </BaseModal>
  );
}
