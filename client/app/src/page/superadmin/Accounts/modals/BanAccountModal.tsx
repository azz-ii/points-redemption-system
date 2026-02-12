import type { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";

interface BanAccountModalProps extends ModalBaseProps {
  account: Account | null;
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

export function BanAccountModal({
  isOpen,
  onClose,
  account,
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
}: BanAccountModalProps) {
  if (!isOpen || !account) return null;

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
        aria-labelledby="ban-account-title"
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 id="ban-account-title" className="text-lg font-semibold">
              Ban User
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Ban user {account.full_name}{" "}
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

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label
              htmlFor="ban-reason"
              className="text-xs text-gray-500 mb-2 block"
            >
              Ban Reason *
            </label>
            <textarea
              id="ban-reason"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
              placeholder="Reason for ban"
            />
          </div>

          <div>
            <label
              htmlFor="ban-message"
              className="text-xs text-gray-500 mb-2 block"
            >
              Ban Message
            </label>
            <textarea
              id="ban-message"
              value={banMessage}
              onChange={(e) => setBanMessage(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
              placeholder="Optional message shown to user"
            />
          </div>

          <div>
            <label
              htmlFor="ban-duration"
              className="text-xs text-gray-500 mb-2 block"
            >
              Ban Duration *
            </label>
            <select
              id="ban-duration"
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
        <div className="p-4">
          {error && (
            <div className="w-full mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-semibold transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {loading ? "Banning..." : "Ban User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
