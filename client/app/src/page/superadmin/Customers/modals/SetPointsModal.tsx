import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { X, Save, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { Customer } from "./types";
import { SetPointsConfirmationModal } from "./SetPointsConfirmationModal";

interface SetPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  loading: boolean;
  onSubmit: (updates: { id: number; points: number }[]) => void;
  onBulkSubmit?: (pointsDelta: number, password: string) => void;
  onResetAll?: (password: string) => void;
}

export function SetPointsModal({
  isOpen,
  onClose,
  customers,
  loading,
  onSubmit,
  onBulkSubmit,
  onResetAll,
}: SetPointsModalProps) {
  const { resolvedTheme } = useTheme();
  const [pointsToAdd, setPointsToAdd] = useState<Record<number, number>>({});

  // Advanced section state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bulkPointsDelta, setBulkPointsDelta] = useState<number>(0);
  const [confirmBulkUpdate, setConfirmBulkUpdate] = useState(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState<"bulk" | "reset">("bulk");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Initialize points to add (delta) when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialDelta: Record<number, number> = {};
      customers.forEach((customer) => {
        initialDelta[customer.id] = 0; // Start with 0 (no change)
      });
      setPointsToAdd(initialDelta);
      // Reset confirmation modal
      setShowConfirmModal(false);
      setConfirmPassword("");
      // Reset advanced section
      setShowAdvanced(false);
      setBulkPointsDelta(0);
      setConfirmBulkUpdate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only reset when modal opens

  const handlePointsChange = (customerId: number, value: string) => {
    // Allow empty string, minus sign, or valid numbers
    if (value === "" || value === "-") {
      setPointsToAdd((prev) => ({ ...prev, [customerId]: 0 }));
    } else {
      const delta = parseInt(value, 10);
      if (!isNaN(delta)) {
        setPointsToAdd((prev) => ({ ...prev, [customerId]: delta }));
      }
    }
  };

  const handleSubmit = () => {
    const updates = customers.map((customer) => {
      const delta = pointsToAdd[customer.id] || 0;
      const newPoints = (customer.points || 0) + delta; // Allow negative values
      return {
        id: customer.id,
        points: newPoints,
      };
    });
    onSubmit(updates);
  };

  const handleBulkSubmit = () => {
    if (!onBulkSubmit) return;
    if (!confirmBulkUpdate) {
      alert("Please confirm that you understand this will affect all customers.");
      return;
    }
    if (bulkPointsDelta === 0) {
      alert("Points delta cannot be 0.");
      return;
    }
    // Open confirmation modal
    setConfirmationType("bulk");
    setShowConfirmModal(true);
  };

  const handleResetAll = () => {
    if (!onResetAll) return;
    // Open confirmation modal
    setConfirmationType("reset");
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (confirmationType === "bulk") {
      onBulkSubmit?.(bulkPointsDelta, confirmPassword);
    } else {
      onResetAll?.(confirmPassword);
    }
    setShowConfirmModal(false);
    setConfirmPassword("");
  };

  if (!isOpen) return null;

  return (
    <>
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
                {customers.length} customer{customers.length !== 1 ? "s" : ""}
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
              Add or subtract points for customers. Enter positive numbers to add points, negative numbers to deduct. Changes will be applied when you click Save.
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
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Location</div>
                <div className="col-span-2">Current</div>
                <div className="col-span-2">Add/Subtract</div>
                <div className="col-span-1">New Total</div>
              </div>

              {/* Customer Rows */}
              {customers.map((customer) => {
                const delta = pointsToAdd[customer.id] || 0;
                const currentPoints = customer.points || 0;
                const newTotal = currentPoints + delta; // Allow negative values
                
                return (
                  <div
                    key={customer.id}
                    className={`grid grid-cols-12 gap-4 items-center py-3 border-b ${
                      resolvedTheme === "dark"
                        ? "border-gray-700 hover:bg-gray-700/50"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`col-span-4 text-sm font-medium ${
                        resolvedTheme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {customer.name}
                    </div>
                    <div
                      className={`col-span-3 text-sm ${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {customer.location}
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
                          handlePointsChange(customer.id, e.target.value)
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

            {customers.length === 0 && (
              <div
                className={`text-center py-8 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No customers found
              </div>
            )}
          </div>

          {/* Advanced Section */}
          {onBulkSubmit && (
            <div
              className={`mt-6 border rounded-lg ${
                resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              {/* Advanced Section Header */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`w-full flex items-center justify-between p-4 transition-colors ${
                  resolvedTheme === "dark"
                    ? "hover:bg-gray-700/50"
                    : "hover:bg-gray-50"
                }`}
                disabled={loading}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      resolvedTheme === "dark"
                        ? "text-orange-400"
                        : "text-orange-500"
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      resolvedTheme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Advanced Options
                  </span>
                </div>
                {showAdvanced ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {/* Advanced Section Content */}
              {showAdvanced && (
                <div
                  className={`p-4 border-t ${
                    resolvedTheme === "dark"
                      ? "border-gray-700 bg-gray-700/30"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {/* Warning Alert */}
                  <div
                    className={`mb-4 p-3 rounded-lg border-l-4 ${
                      resolvedTheme === "dark"
                        ? "bg-orange-900/20 border-orange-500"
                        : "bg-orange-50 border-orange-500"
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        resolvedTheme === "dark"
                          ? "text-orange-300"
                          : "text-orange-800"
                      }`}
                    >
                      ⚠️ Warning: Bulk Update
                    </p>
                    <p
                      className={`text-sm mt-1 ${
                        resolvedTheme === "dark"
                          ? "text-orange-200"
                          : "text-orange-700"
                      }`}
                    >
                      This will apply the same points adjustment to all{" "}
                      {customers.length} customer(s). This action cannot
                      be undone.
                    </p>
                  </div>

                  {/* Bulk Points Delta Input */}
                  <div className="mb-4">
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        resolvedTheme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      Points to Add/Subtract
                    </label>
                    <input
                      type="number"
                      value={bulkPointsDelta === 0 ? "" : bulkPointsDelta}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || value === "-") {
                          setBulkPointsDelta(0);
                        } else {
                          const num = parseInt(value, 10);
                          if (!isNaN(num)) {
                            setBulkPointsDelta(num);
                          }
                        }
                      }}
                      placeholder="Enter positive or negative number"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      }`}
                      disabled={loading}
                    />
                    <p
                      className={`text-xs mt-1 ${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-500"
                      }`}
                    >
                      Positive numbers add points, negative numbers subtract
                    </p>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="mb-4">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmBulkUpdate}
                        onChange={(e) => setConfirmBulkUpdate(e.target.checked)}
                        className="mt-1"
                        disabled={loading}
                      />
                      <span
                        className={`text-sm ${
                          resolvedTheme === "dark"
                            ? "text-gray-300"
                            : "text-gray-700"
                        }`}
                      >
                        I understand this will affect all {customers.length}{" "}
                        customer(s) and cannot be undone
                      </span>
                    </label>
                  </div>

                  {/* Bulk Submit Button */}
                  <button
                    onClick={handleBulkSubmit}
                    disabled={
                      loading ||
                      !confirmBulkUpdate ||
                      bulkPointsDelta === 0
                    }
                    className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      resolvedTheme === "dark"
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {loading ? "Applying..." : `Apply ${bulkPointsDelta > 0 ? "+" : ""}${bulkPointsDelta} Points to All Customers`}
                  </button>

                  {/* Reset All Button */}
                  {onResetAll && (
                    <>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className={`w-full border-t ${
                            resolvedTheme === "dark" ? "border-gray-600" : "border-gray-300"
                          }`}></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className={`px-2 ${
                            resolvedTheme === "dark" ? "bg-gray-700/30 text-gray-400" : "bg-gray-50 text-gray-500"
                          }`}>
                            Or
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleResetAll}
                        disabled={loading}
                        className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          resolvedTheme === "dark"
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {loading ? "Resetting..." : `Reset All ${customers.length} Customers to 0 Points`}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

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

      {/* Confirmation Modal */}
      <SetPointsConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmPassword("");
        }}
        onConfirm={handleConfirmAction}
        confirmationType={confirmationType}
        bulkPointsDelta={bulkPointsDelta}
        customersCount={customers.length}
        loading={loading}
        password={confirmPassword}
        onPasswordChange={setConfirmPassword}
      />
    </>
  );
}
