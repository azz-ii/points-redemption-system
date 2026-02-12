import { useState, useEffect, useCallback } from "react";
import { X, Package, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";
import type { Account, ModalBaseProps, LegendAssignment } from "./types";
import { LEGEND_OPTIONS } from "./types";

interface ViewAccountModalProps extends ModalBaseProps {
  account: Account | null;
}

export function ViewAccountModal({
  isOpen,
  onClose,
  account,
}: ViewAccountModalProps) {
  const [assignments, setAssignments] = useState<LegendAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!account) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/catalogue/bulk-assign-marketing/`);
      const data = await response.json();

      if (response.ok) {
        // Filter assignments for this user
        const userAssignments = (data.assignments || []).filter(
          (a: LegendAssignment) => a.mktg_admin_id === account.id
        );
        setAssignments(userAssignments);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (isOpen && account) {
      fetchAssignments();
    }
  }, [isOpen, account, fetchAssignments]);

  if (!isOpen || !account) return null;

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
        aria-labelledby="view-account-title"
        className="bg-card rounded-lg shadow-2xl max-w-2xl w-full border divide-y border-border divide-gray-700"
      >
        <div className="flex justify-between items-center p-3">
          <div>
            <h2 id="view-account-title" className="text-lg font-semibold">
              Marketing User Details
            </h2>
            <p className="text-xs text-gray-500 mt-0">{account.full_name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* User Info Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              User Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Username
                </label>
                <p className="font-medium">{account.username}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Email
                </label>
                <p className="font-medium">{account.email}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Position
                </label>
                <p className="font-medium">{account.position}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Status
                </label>
                <p className="font-medium">
                  {account.is_activated ? "Active" : "Inactive"}
                  {account.is_banned && " • Banned"}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Legends Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
              <Package className="h-4 w-4" />
              Assigned Item Legends
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.legend}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getLegendColor(
                          assignment.legend
                        )}`}
                      >
                        {getLegendLabel(assignment.legend)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {assignment.item_count} item
                      {assignment.item_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-8 rounded-lg border-2 border-dashed border-border text-muted-foreground"
              >
                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No item legends assigned</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground border border-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
