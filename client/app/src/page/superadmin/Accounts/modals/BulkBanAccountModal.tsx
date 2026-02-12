import type { Dispatch, SetStateAction } from "react";
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
  if (!isOpen || accounts.length === 0) return null;

  const handleClose = () => {
    onClose();
    setError("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bulk-ban-account-title"
      >
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="bulk-ban-account-title" className="text-xl font-semibold">
              Ban Multiple Users
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Ban {accounts.length} selected user
              {accounts.length > 1 ? "s" : ""}
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

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Users to ban:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="text-xs px-2 py-1 rounded bg-muted text-foreground"
                >
                  {account.full_name} ({account.username})
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="bulk-ban-reason"
              className="text-xs text-gray-500 mb-2 block"
            >
              Ban Reason *
            </label>
            <textarea
              id="bulk-ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
              placeholder="Reason for ban (applies to all)"
            />
          </div>

          <div>
            <label
              htmlFor="bulk-ban-message"
              className="text-xs text-gray-500 mb-2 block"
            >
              Ban Message
            </label>
            <textarea
              id="bulk-ban-message"
              value={banMessage}
              onChange={(e) => setBanMessage(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
              placeholder="Optional message shown to users"
            />
          </div>

          <div>
            <label
              htmlFor="bulk-ban-duration"
              className="text-xs text-gray-500 mb-2 block"
            >
              Ban Duration *
            </label>
            <select
              id="bulk-ban-duration"
              value={banDuration}
              onChange={(e) =>
                setBanDuration(e.target.value as "1" | "7" | "30" | "permanent")
              }
              className="w-full px-3 py-2 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8">
          {error && (
            <div className="w-full mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-semibold transition-colors bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
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
