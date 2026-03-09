import { useState } from "react";
import { LockOpen, Eye, EyeOff } from "lucide-react";
import type { ModalBaseProps } from "@/components/modals";
import type { Account } from "./types";

interface UnlockAccountModalProps extends ModalBaseProps {
  account: Account | null;
  onConfirm: (id: number, password: string) => void;
  loading: boolean;
}

export function UnlockAccountModal({
  isOpen,
  onClose,
  account,
  onConfirm,
  loading,
}: UnlockAccountModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen || !account) return null;

  const handleConfirm = () => {
    if (password.trim() && !loading) {
      console.debug(`[UnlockAccountModal] Confirming unlock for user id=${account.id} (${account.username})`);
      onConfirm(account.id, password);
    }
  };

  const handleClose = () => {
    setPassword("");
    setShowPassword(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="rounded-lg shadow-2xl w-full max-w-md mx-4 bg-card max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-border">
          <div className="p-2 rounded-full bg-red-500/10">
            <LockOpen className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Unlock Account</h3>
            <p className="text-sm text-muted-foreground">This action requires your password</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
            <p className="text-sm font-medium">{account.full_name || "N/A"}</p>
            <p className="text-xs text-muted-foreground">@{account.username}</p>
          </div>

          <p className="text-sm text-foreground">
            This account has been temporarily locked due to too many failed login attempts.
            Unlocking it will allow the user to log in immediately.
          </p>

          {/* Admin password */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Enter Your Password to Confirm
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoFocus
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirm();
                }}
                className="w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-background border-border text-foreground placeholder-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Click "Unlock" to proceed or "Cancel" to go back.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg transition-colors bg-muted text-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !password.trim()}
            className="flex-1 px-4 py-2 rounded-lg transition-colors text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Unlocking..." : "Unlock"}
          </button>
        </div>
      </div>
    </div>
  );
}
