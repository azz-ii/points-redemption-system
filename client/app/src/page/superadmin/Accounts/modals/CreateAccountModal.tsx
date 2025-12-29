import type { Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { ModalBaseProps } from "./types";
import { POSITION_OPTIONS } from "./types";

interface NewAccountData {
  username: string;
  password: string;
  full_name: string;
  email: string;
  position: string;
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-md w-full border ${
          resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold">Create New Account</h2>
            <p className="text-xs text-gray-500 mt-1">
              Please fill in the details to create a new account
            </p>
          </div>
          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              Username *
            </label>
            <input
              type="text"
              value={newAccount.username}
              onChange={(e) =>
                setNewAccount({ ...newAccount, username: e.target.value })
              }
              className={`w-full px-3 py-2 rounded border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:border-blue-500`}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              Password *
            </label>
            <input
              type="password"
              value={newAccount.password}
              onChange={(e) =>
                setNewAccount({ ...newAccount, password: e.target.value })
              }
              className={`w-full px-3 py-2 rounded border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:border-blue-500`}
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              Full Name *
            </label>
            <input
              type="text"
              value={newAccount.full_name}
              onChange={(e) =>
                setNewAccount({ ...newAccount, full_name: e.target.value })
              }
              className={`w-full px-3 py-2 rounded border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:border-blue-500`}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              Email Address *
            </label>
            <input
              type="email"
              value={newAccount.email}
              onChange={(e) =>
                setNewAccount({ ...newAccount, email: e.target.value })
              }
              className={`w-full px-3 py-2 rounded border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:border-blue-500`}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              Position *
            </label>
            <select
              value={newAccount.position}
              onChange={(e) =>
                setNewAccount({ ...newAccount, position: e.target.value })
              }
              className={`w-full px-3 py-2 rounded border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:border-blue-500`}
            >
              {POSITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            {/* `is_activated` and `is_banned` default to false; inputs removed */}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          {error && (
            <div className="w-full mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={onSubmit}
            disabled={loading}
            className={`w-full px-4 py-2 rounded font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-white hover:bg-gray-100 text-gray-900 disabled:opacity-50"
                : "bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
            }`}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
