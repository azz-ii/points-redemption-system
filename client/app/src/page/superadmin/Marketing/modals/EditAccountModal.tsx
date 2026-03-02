import { useState, useEffect } from "react";
import { X, Package, Loader2, Check } from "lucide-react";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import type { Account, ModalBaseProps, LegendAssignment } from "./types";
import { LEGEND_OPTIONS } from "./types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

interface PendingAction {
  legend: string;
  assign: boolean;
  confirmationType: "reassign" | "multi-assign" | "both" | "unassign";
  currentOwner: string | null;
  existingLegends: string[];
}

export function EditAccountModal({
  isOpen,
  onClose,
  account,
  onSuccess,
}: EditAccountModalProps) {
  const [legendStates, setLegendStates] = useState<LegendState[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    if (isOpen && account) {
      fetchAssignments();
    }
  }, [isOpen, account]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/catalogue/bulk-assign-marketing/`);
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
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const executeToggle = async (legend: string, assign: boolean) => {
    if (!account) return;

    try {
      setSaving(true);

      const response = await fetchWithCsrf(`${API_URL}/catalogue/bulk-assign-marketing/`, {
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
        toast.success(
          assign
            ? `${getLegendLabel(legend)} assigned to ${account.full_name}`
            : `${getLegendLabel(legend)} unassigned`
        );
        await fetchAssignments();
        onSuccess();
      } else {
        toast.error(data.error || "Failed to update assignment");
      }
    } catch (err) {
      console.error("Error updating assignment:", err);
      toast.error("Error connecting to server");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLegend = (legend: string, assign: boolean) => {
    if (!account) return;

    if (!assign) {
      setPendingAction({
        legend,
        assign,
        confirmationType: "unassign",
        currentOwner: null,
        existingLegends: [],
      });
      return;
    }

    const targetState = legendStates.find((s) => s.legend === legend);
    const isReassign =
      !!targetState?.currentOwnerId && targetState.currentOwnerId !== account.id;
    const existingLegends = legendStates
      .filter((s) => s.isAssigned && s.legend !== legend)
      .map((s) => getLegendLabel(s.legend));
    const isMultiAssign = existingLegends.length > 0;

    if (!isReassign && !isMultiAssign) {
      executeToggle(legend, assign);
      return;
    }

    const confirmationType =
      isReassign && isMultiAssign ? "both" : isReassign ? "reassign" : "multi-assign";

    setPendingAction({
      legend,
      assign,
      confirmationType,
      currentOwner: targetState?.currentOwner ?? null,
      existingLegends,
    });
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    executeToggle(pendingAction.legend, pendingAction.assign);
    setPendingAction(null);
  };

  const cancelAction = () => {
    setPendingAction(null);
  };

  if (!isOpen || !account) return null;

  const handleClose = () => {
    onClose();
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
    <>
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-account-title"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700"
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
            className="p-4 rounded-lg bg-card"
          >
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Username:</span>
                <span className="ml-2 font-medium">{account.username || "N/A"}</span>
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
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex-1 space-y-2">
                      <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
                      <div className="h-3 w-32 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {legendStates.map((state) => (
                  <div
                    key={state.legend}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
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
                          : "bg-muted hover:bg-gray-600 text-foreground"
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
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground border border-gray-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <AlertDialog open={pendingAction !== null} onOpenChange={(open) => !open && cancelAction()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {pendingAction?.confirmationType === "unassign"
              ? "Confirm Unassignment"
              : "Confirm Assignment"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              {pendingAction?.confirmationType === "unassign" && (
                <p>
                  Are you sure you want to unassign{" "}
                  <span className="font-medium text-foreground">
                    {getLegendLabel(pendingAction.legend)}
                  </span>{" "}
                  from{" "}
                  <span className="font-medium text-foreground">
                    {account.full_name}
                  </span>
                  ? This legend will become unassigned.
                </p>
              )}
              {(pendingAction?.confirmationType === "reassign" ||
                pendingAction?.confirmationType === "both") && (
                <p>
                  <span className="font-medium text-foreground">
                    {getLegendLabel(pendingAction.legend)}
                  </span>{" "}
                  is currently assigned to{" "}
                  <span className="font-medium text-foreground">
                    {pendingAction.currentOwner}
                  </span>
                  . Assigning it to{" "}
                  <span className="font-medium text-foreground">
                    {account.full_name}
                  </span>{" "}
                  will remove it from the current owner.
                </p>
              )}
              {(pendingAction?.confirmationType === "multi-assign" ||
                pendingAction?.confirmationType === "both") && (
                <p>
                  <span className="font-medium text-foreground">
                    {account.full_name}
                  </span>{" "}
                  is already assigned to{" "}
                  <span className="font-medium text-foreground">
                    {pendingAction?.existingLegends.join(", ")}
                  </span>
                  . Are you sure you want to also assign{" "}
                  <span className="font-medium text-foreground">
                    {pendingAction && getLegendLabel(pendingAction.legend)}
                  </span>
                  ?
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={cancelAction}
            className="border border-border bg-card hover:bg-accent text-foreground"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmAction}
            className={
              pendingAction?.confirmationType === "unassign"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
