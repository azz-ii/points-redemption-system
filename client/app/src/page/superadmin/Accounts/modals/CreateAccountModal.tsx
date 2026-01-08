import type { Dispatch, SetStateAction } from "react";
import type { ModalBaseProps } from "./types";
import { POSITION_OPTIONS } from "./types";
import { BaseModal } from "./BaseModal";
import { FormInput, FormSelect } from "./FormComponents";
import { useTheme } from "next-themes";

interface NewAccountData {
  username: string;
  password: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
  is_banned: boolean;
}

interface CreateAccountModalProps extends ModalBaseProps {
  newAccount: NewAccountData;
  setNewAccount: Dispatch<SetStateAction<NewAccountData>>;
  loading: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
}

export function CreateAccountModal({
  isOpen,
  onClose,
  newAccount,
  setNewAccount,
  loading,
  error,
  setError,
  onSubmit,
}: CreateAccountModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen) return null;

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
        {loading ? "Creating..." : "Create Account"}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Account"
      subtitle="Fill in the details to create a new user account"
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
          value={newAccount.username}
          onChange={(e) =>
            setNewAccount({ ...newAccount, username: e.target.value })
          }
          placeholder="Enter username"
        />

        <FormInput
          label="Password"
          required
          type="password"
          value={newAccount.password}
          onChange={(e) =>
            setNewAccount({ ...newAccount, password: e.target.value })
          }
          placeholder="Enter password"
        />

        <FormInput
          label="Full Name"
          required
          type="text"
          value={newAccount.full_name}
          onChange={(e) =>
            setNewAccount({ ...newAccount, full_name: e.target.value })
          }
          placeholder="Enter full name"
        />

        <FormInput
          label="Email Address"
          required
          type="email"
          value={newAccount.email}
          onChange={(e) =>
            setNewAccount({ ...newAccount, email: e.target.value })
          }
          placeholder="Enter email address"
        />

        <FormSelect
          label="Position"
          required
          value={newAccount.position}
          onChange={(e) =>
            setNewAccount({ ...newAccount, position: e.target.value })
          }
          options={POSITION_OPTIONS}
        />

        <FormInput
          label="Initial Points"
          type="number"
          min="0"
          value={newAccount.points}
          onChange={(e) =>
            setNewAccount({
              ...newAccount,
              points: parseInt(e.target.value) || 0,
            })
          }
          placeholder="0"
        />
      </div>
    </BaseModal>
  );
}
