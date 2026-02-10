import type { Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";

interface BulkBanAccountModalProps extends ModalBaseProps {
  accounts: Account[];
  banReason: string;
  setBanReason: Dispatch<SetStateAction<string>>;
  banMessage: string;
  setBanMessage: Dispatch<SetStateAction<string>>;
  banDuration: "1" | "7" | "30" | "permanent";
  setBanDuration: Dispatch<SetStateAction<"1" | "7" | "30" | "permanent">>;
  loading: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
}

export function BulkBanAccountModal({
  isOpen,
  onClose,
  accounts,
  banReason,
  setBanReason,
  banMessage,
  setBanMessage,
  banDuration,
  setBanDuration,
  loading,
  error,
  setError,
  onSubmit,
}: BulkBanAccountModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || accounts.length === 0) return null;

  const handleClose = () => {
    onClose();
    setError("");
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
        aria-labelledby="bulk-ban-account-title"
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 id="bulk-ban-account-title" className="text-lg font-semibold">
              Ban Multiple Users
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Ban {accounts.length} user{accounts.length > 1 ? "s" : ""}
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

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Users to ban:</p>
            <div className="space-y-0.5 max-h-20 overflow-y-auto">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`text-xs px-2 py-0.5 rounded ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {account.full_name} ({account.username})
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="bulk-ban-reason"
              className="text-xs text-gray-500 mb-1 block"
            >
              Ban Reason *
            </label>
            <textarea
              id="bulk-ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className={`w-full px-2 py-1 rounded border text-sm resize-none ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:border-blue-500`}
              placeholder="Reason for ban (applies to all)"
            />
          </div>

          <div>
            <label
              htmlFor="bulk-ban-message"
              className="text-xs text-gray-500 mb-1 block"
            >
              Ban Message
            </label>
            <textarea
              id="bulk-ban-message"
              value={banMessage}
              onChange={(e) => setBanMessage(e.target.value)}
              className={`w-full px-2 py-1 rounded border text-sm resize-none ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:border-blue-500`}
              placeholder="Optional message shown to users"
            />
          </div>

          <div>
            <label
              htmlFor="bulk-ban-duration"
              className="text-xs text-gray-500 mb-1 block"
            >
              Ban Duration *
            </label>
            <select
              id="bulk-ban-duration"
              value={banDuration}
              onChange={(e) =>
                setBanDuration(e.target.value as "1" | "7" | "30" | "permanent")
              }
              className={`w-full px-2 py-1 rounded border text-sm ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:border-blue-500`}
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4">
          {error && (
            <div className="w-full mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-xs">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
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
              onClick={onSubmit}
              disabled={loading}
              className="px-3 py-2 rounded-lg font-semibold text-sm transition-colors bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
              {loading
                ? "Banning..."
                : `Ban ${accounts.length} User${
                    accounts.length > 1 ? "s" : ""
                  }`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
