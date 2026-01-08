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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-account-title"
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-lg w-full border divide-y ${
          resolvedTheme === "dark" ? "border-gray-700 divide-gray-700" : "border-gray-200 divide-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="create-account-title" className="text-xl font-semibold">Create New Account</h2>
            <p className="text-sm text-gray-500 mt-1">
              Please fill in the details to create a new account
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Credentials Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Credentials</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="text-xs text-gray-500 mb-2 block">
                  Username *
                </label>
                <input
                  id="username"
                  type="text"
                  value={newAccount.username}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, username: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter username"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-xs text-gray-500 mb-2 block">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  value={newAccount.password}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, password: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter password"
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="text-xs text-gray-500 mb-2 block">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={newAccount.full_name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, full_name: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter full name"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-xs text-gray-500 mb-2 block">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={newAccount.email}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, email: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter email address"
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          {/* Role & Points Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Role & Points</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="position" className="text-xs text-gray-500 mb-2 block">
                  Position *
                </label>
                <select
                  id="position"
                  value={newAccount.position}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, position: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  aria-required="true"
                >
                  {POSITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="points" className="text-xs text-gray-500 mb-2 block">
                  Points *
                </label>
                <input
                  id="points"
                  type="number"
                  min="0"
                  value={newAccount.points}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, points: parseInt(e.target.value) || 0 })
                  }
                  className={`w-full px-4 py-3 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Enter points"
                  aria-required="true"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t">
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={onSubmit}
            disabled={loading}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
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
