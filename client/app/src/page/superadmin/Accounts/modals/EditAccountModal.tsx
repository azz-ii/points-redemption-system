import type { Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { Plus } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";
import { POSITION_OPTIONS } from "./types";
import { BaseModal } from "./BaseModal";
import { FormInput, FormSelect } from "./FormComponents";

interface EditAccountData {
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  is_banned: boolean;
}

interface EditAccountModalProps extends ModalBaseProps {
  account: Account | null;
  editAccount: EditAccountData;
  setEditAccount: Dispatch<SetStateAction<EditAccountData>>;
  loading: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
}

export function EditAccountModal({
  isOpen,
  onClose,
  account,
  editAccount,
  setEditAccount,
  loading,
  error,
  setError,
  onSubmit,
}: EditAccountModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !account) return null;

  const handleClose = () => {
    onClose();
    setError("");
  };

  const footer = (
    <>
      <button
        onClick={handleClose}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          resolvedTheme === "dark"
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-900"
        }`}
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          resolvedTheme === "dark"
            ? "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        {loading ? "Updating..." : "Update Account"}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Account"
      subtitle={`Update account details for ${account.full_name}`}
      footer={footer}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <FormInput
          label="Username"
          required
          type="text"
          value={editAccount.username}
          onChange={(e) =>
            setEditAccount({ ...editAccount, username: e.target.value })
          }
          placeholder="Enter username"
        />

        <FormInput
          label="Full Name"
          required
          type="text"
          value={editAccount.full_name}
          onChange={(e) =>
            setEditAccount({
              ...editAccount,
              full_name: e.target.value,
            })
          }
          placeholder="Enter full name"
        />

        <FormInput
          label="Email Address"
          required
          type="email"
          value={editAccount.email}
          onChange={(e) =>
            setEditAccount({ ...editAccount, email: e.target.value })
          }
          placeholder="Enter email address"
        />

        <FormSelect
          label="Position"
          required
          value={editAccount.position}
          onChange={(e) =>
            setEditAccount({ ...editAccount, position: e.target.value })
          }
          options={POSITION_OPTIONS}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            Points <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={editAccount.points}
              onChange={(e) =>
                setEditAccount({
                  ...editAccount,
                  points: parseInt(e.target.value) || 0,
                })
              }
              className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="0"
            />
            <button
              type="button"
              onClick={() =>
                setEditAccount({
                  ...editAccount,
                  points: editAccount.points + 10,
                })
              }
              className={`px-3 py-2 rounded-lg border font-medium text-sm transition-colors flex items-center gap-1 ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-900"
              }`}
              title="Add 10 points"
            >
              <Plus className="h-4 w-4" />
              10
            </button>
            <button
              type="button"
              onClick={() =>
                setEditAccount({
                  ...editAccount,
                  points: editAccount.points + 100,
                })
              }
              className={`px-3 py-2 rounded-lg border font-medium text-sm transition-colors flex items-center gap-1 ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-900"
              }`}
              title="Add 100 points"
            >
              <Plus className="h-4 w-4" />
              100
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
