import type { Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";
import { POSITION_OPTIONS } from "./types";

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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-account-title"
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-lg w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="edit-account-title" className="text-xl font-semibold">
              Edit Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Update account details for {account.full_name}
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
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Credentials
            </h3>
            <div>
              <label
                htmlFor="edit-username"
                className="text-xs text-gray-500 mb-2 block"
              >
                Username *
              </label>
              <input
                id="edit-username"
                type="text"
                value={editAccount.username}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, username: e.target.value })
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
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-fullName"
                  className="text-xs text-gray-500 mb-2 block"
                >
                  Full Name *
                </label>
                <input
                  id="edit-fullName"
                  type="text"
                  value={editAccount.full_name}
                  onChange={(e) =>
                    setEditAccount({
                      ...editAccount,
                      full_name: e.target.value,
                    })
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
                <label
                  htmlFor="edit-email"
                  className="text-xs text-gray-500 mb-2 block"
                >
                  Email Address *
                </label>
                <input
                  id="edit-email"
                  type="email"
                  value={editAccount.email}
                  onChange={(e) =>
                    setEditAccount({ ...editAccount, email: e.target.value })
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
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Role & Points
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="edit-position"
                  className="text-xs text-gray-500 mb-2 block"
                >
                  Position *
                </label>
                <select
                  id="edit-position"
                  value={editAccount.position}
                  onChange={(e) =>
                    setEditAccount({ ...editAccount, position: e.target.value })
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
                <label
                  htmlFor="edit-points"
                  className="text-xs text-gray-500 mb-2 block"
                >
                  Points *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    id="edit-points"
                    type="number"
                    min="0"
                    value={editAccount.points}
                    onChange={(e) =>
                      setEditAccount({
                        ...editAccount,
                        points: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`flex-1 px-4 py-3 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="Enter points"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditAccount({
                        ...editAccount,
                        points: editAccount.points + 10,
                      })
                    }
                    aria-label="Add 10 points"
                    className={`px-4 py-3 rounded border font-semibold text-sm transition-colors ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
                        : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditAccount({
                        ...editAccount,
                        points: editAccount.points + 100,
                      })
                    }
                    aria-label="Add 100 points"
                    className={`px-4 py-3 rounded border font-semibold text-sm transition-colors ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
                        : "bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-900"
                    }`}
                  >
                    +100
                  </button>
                </div>
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
            {loading ? "Updating..." : "Update Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
