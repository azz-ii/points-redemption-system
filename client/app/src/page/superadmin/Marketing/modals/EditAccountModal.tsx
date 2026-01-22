import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { X, Package, Loader2, Check, AlertCircle } from "lucide-react";
import { fetchWithCsrf } from "@/lib/csrf";
import type { Account, ModalBaseProps, LegendAssignment } from "./types";
import { LEGEND_OPTIONS } from "./types";

interface EditAccountModalProps extends ModalBaseProps {
  account: Account | null;
  onSuccess: () => void;
}

interface LegendState {
  legend: string;
  isAssigned: boolean;
  currentOwner: string | null;
  currentOwnerId: number | null;
  itemCount: number;
}

export function EditAccountModal({
  isOpen,
  onClose,
  account,
  onSuccess,
}: EditAccountModalProps) {
  const { resolvedTheme } = useTheme();
  const [legendStates, setLegendStates] = useState<LegendState[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (isOpen && account) {
      fetchAssignments();
      setError("");
      setSuccessMessage("");
    }
  }, [isOpen, account]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/catalogue/bulk-assign-marketing/");
      const data = await response.json();

      if (response.ok) {
        const assignments: LegendAssignment[] = data.assignments || [];
        
        // Build legend states from all legends
        const states: LegendState[] = LEGEND_OPTIONS.map((legend) => {
          const assignment = assignments.find((a) => a.legend === legend.value);
          return {
            legend: legend.value,
            isAssigned: assignment?.mktg_admin_id === account?.id,
            currentOwner: assignment?.mktg_admin_id ? assignment.mktg_admin_username : null,
            currentOwnerId: assignment?.mktg_admin_id || null,
            itemCount: assignment?.item_count || 0,
          };
        });
        setLegendStates(states);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLegend = async (legend: string, assign: boolean) => {
    if (!account) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await fetchWithCsrf("/api/catalogue/bulk-assign-marketing/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          legend,
          mktg_admin_id: assign ? account.id : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          assign
            ? `${getLegendLabel(legend)} assigned to ${account.full_name}`
            : `${getLegendLabel(legend)} unassigned`
        );
        await fetchAssignments();
        onSuccess();
      } else {
        setError(data.error || "Failed to update assignment");
      }
    } catch (err) {
      console.error("Error updating assignment:", err);
      setError("Error connecting to server");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !account) return null;

  const handleClose = () => {
    onClose();
    setError("");
    setSuccessMessage("");
  };

  const getLegendLabel = (legend: string) => {
    return LEGEND_OPTIONS.find((l) => l.value === legend)?.label || legend;
  };

  const getLegendColor = (legend: string) => {
    switch (legend) {
      case "COLLATERAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "GIVEAWAY":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "ASSET":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "BENEFIT":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
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
              Assign Item Legends
            </h2>
            <p className="text-sm text-gray-500 mt-1">{account.full_name}</p>
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
          {/* User Info */}
          <div
            className={`p-4 rounded-lg ${
              resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
            }`}
          >
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Username:</span>
                <span className="ml-2 font-medium">{account.username}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{account.email}</span>
              </div>
            </div>
          </div>

          {/* Legend Assignment Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
              <Package className="h-4 w-4" />
              Item Legend Assignments
            </h3>
            <p className="text-xs text-gray-500">
              Toggle to assign or unassign item legends to this marketing user.
              Each legend can only be assigned to one user at a time.
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {legendStates.map((state) => (
                  <div
                    key={state.legend}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "border-gray-700 bg-gray-800"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getLegendColor(
                            state.legend
                          )}`}
                        >
                          {getLegendLabel(state.legend)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {state.itemCount} item{state.itemCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {state.currentOwner && !state.isAssigned && (
                        <p className="text-xs text-amber-500 mt-2">
                          Currently assigned to: {state.currentOwner}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        handleToggleLegend(state.legend, !state.isAssigned)
                      }
                      disabled={saving}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        state.isAssigned
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : resolvedTheme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      } disabled:opacity-50`}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : state.isAssigned ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-4 w-4" /> Assigned
                        </span>
                      ) : (
                        "Assign"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8">
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {successMessage && (
            <div className="w-full mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded text-green-500 text-sm flex items-center gap-2">
              <Check className="h-4 w-4" />
              {successMessage}
            </div>
          )}
          <button
            onClick={handleClose}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
