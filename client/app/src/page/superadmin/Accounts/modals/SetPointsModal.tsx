import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { X, Save } from "lucide-react";
import type { Account } from "./types";

interface SetPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  loading: boolean;
  onSubmit: (updates: { id: number; points: number }[]) => void;
}

export function SetPointsModal({
  isOpen,
  onClose,
  accounts,
  loading,
  onSubmit,
}: SetPointsModalProps) {
  const { resolvedTheme } = useTheme();
  const [pointsToAdd, setPointsToAdd] = useState<Record<number, number>>({});

  // Filter to only show active and not banned users
  const activeAccounts = accounts.filter(
    (account) => account.is_activated && !account.is_banned
  );

  // Initialize points to add (delta) when modal opens
  useEffect(() => {
    if (isOpen && activeAccounts.length > 0) {
      const initialDelta: Record<number, number> = {};
      activeAccounts.forEach((account) => {
        initialDelta[account.id] = 0; // Start with 0 (no change)
      });
      setPointsToAdd(initialDelta);
    }
  }, [isOpen, activeAccounts.length]);

  const handlePointsChange = (accountId: number, value: string) => {
    // Allow empty string, minus sign, or valid numbers
    if (value === "" || value === "-") {
      setPointsToAdd((prev) => ({ ...prev, [accountId]: 0 }));
    } else {
      const delta = parseInt(value, 10);
      if (!isNaN(delta)) {
        setPointsToAdd((prev) => ({ ...prev, [accountId]: delta }));
      }
    }
  };

  const handleSubmit = () => {
    const updates = activeAccounts.map((account) => {
      const delta = pointsToAdd[account.id] || 0;
      const newPoints = (account.points || 0) + delta; // Allow negative values
      return {
        id: account.id,
        points: newPoints,
      };
    });
    onSubmit(updates);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col ${
          resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-6 border-b ${
            resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div>
            <h2
              className={`text-2xl font-semibold ${
                resolvedTheme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Set Points
            </h2>
            <p
              className={`text-sm mt-1 ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {activeAccounts.length} active account{activeAccounts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${
              resolvedTheme === "dark"
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-400 hover:text-gray-600"
            }`}
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p
            className={`text-sm mb-4 ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Add or subtract points for active users. Enter positive numbers to add points, negative numbers to deduct. Changes will be applied when you click Save.
          </p>

          <div className="space-y-2">
            {/* Header Row */}
            <div
              className={`grid grid-cols-12 gap-4 font-semibold text-sm pb-2 border-b ${
                resolvedTheme === "dark"
                  ? "text-gray-300 border-gray-700"
                  : "text-gray-700 border-gray-200"
              }`}
            >
              <div className="col-span-3">Username</div>
              <div className="col-span-4">Full Name</div>
              <div className="col-span-2">Current</div>
              <div className="col-span-2">Add/Subtract</div>
              <div className="col-span-1">New Total</div>
            </div>

            {/* Account Rows */}
            {activeAccounts.map((account) => {
              const delta = pointsToAdd[account.id] || 0;
              const currentPoints = account.points || 0;
              const newTotal = currentPoints + delta; // Allow negative values
              
              return (
                <div
                  key={account.id}
                  className={`grid grid-cols-12 gap-4 items-center py-3 border-b ${
                    resolvedTheme === "dark"
                      ? "border-gray-700 hover:bg-gray-700/50"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`col-span-3 text-sm font-medium ${
                      resolvedTheme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {account.username}
                  </div>
                  <div
                    className={`col-span-4 text-sm ${
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {account.full_name}
                  </div>
                  <div
                    className={`col-span-2 text-sm ${
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {currentPoints.toLocaleString()}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={delta === 0 ? "" : delta}
                      onChange={(e) =>
                        handlePointsChange(account.id, e.target.value)
                      }
                      placeholder="0"
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      }`}
                      disabled={loading}
                    />
                  </div>
                  <div
                    className={`col-span-1 text-sm font-semibold ${
                      delta > 0
                        ? "text-green-500"
                        : delta < 0
                        ? "text-red-500"
                        : resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {newTotal.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {activeAccounts.length === 0 && (
            <div
              className={`text-center py-8 ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No active accounts found
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex justify-end gap-3 p-6 border-t ${
            resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors ${
              resolvedTheme === "dark"
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              resolvedTheme === "dark"
                ? "bg-white text-gray-900 hover:bg-gray-200"
                : "bg-gray-900 text-white hover:bg-gray-700"
            }`}
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
