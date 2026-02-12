import { AlertTriangle } from "lucide-react";

interface SetPointsConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmationType: "bulk" | "reset";
  bulkPointsDelta: number;
  activeAccountsCount: number;
  loading: boolean;
  password: string;
  onPasswordChange: (password: string) => void;
}

export function SetPointsConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  confirmationType,
  bulkPointsDelta,
  activeAccountsCount,
  loading,
  password,
  onPasswordChange,
}: SetPointsConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (password.trim() && !loading) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="rounded-lg shadow-2xl w-full max-w-md mx-4 bg-card"
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 p-3 border-b border-border"
        >
          <div
            className={`p-1.5 rounded-full ${
              confirmationType === "reset"
                ? "bg-red-500/10"
                : "bg-orange-500/10"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${
                confirmationType === "reset"
                  ? "text-red-500"
                  : "text-orange-500"
              }`}
            />
          </div>
          <h3
            className="text-base font-semibold text-foreground"
          >
            {confirmationType === "reset"
              ? "Confirm Reset All Points"
              : "Confirm Bulk Points Update"}
          </h3>
        </div>

        {/* Content */}
        <div className="p-3">
          <div
            className="mb-4 text-foreground"
          >
            {confirmationType === "reset" ? (
              <>
                <p className="font-medium mb-2">
                  You are about to reset ALL points to 0 for{" "}
                  <span className="font-bold text-red-500">
                    {activeAccountsCount}
                  </span>{" "}
                  account(s).
                </p>
                <p className="text-sm">
                  This action is <strong>permanent</strong> and cannot be undone.
                  All affected accounts will have their points balance set to
                  zero.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium mb-2">
                  You are about to apply{" "}
                  <span
                    className={`font-bold ${
                      bulkPointsDelta > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {bulkPointsDelta > 0 ? "+" : ""}
                    {bulkPointsDelta}
                  </span>{" "}
                  points to{" "}
                  <span className="font-bold text-orange-500">
                    {activeAccountsCount}
                  </span>{" "}
                  account(s).
                </p>
                <p className="text-sm">
                  This action is <strong>permanent</strong> and cannot be undone.
                </p>
              </>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2 text-foreground"
            >
              Enter Your Password to Confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter your password"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                }
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background border-border text-foreground placeholder-muted-foreground"
              disabled={loading}
            />
          </div>

          <p
            className="text-xs mt-3 text-muted-foreground"
          >
            Click "Confirm" to proceed or "Cancel" to go back.
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex gap-2 p-3 border-t border-border"
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg transition-colors bg-muted text-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !password.trim()}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors text-white ${
              confirmationType === "reset"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-orange-600 hover:bg-orange-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

