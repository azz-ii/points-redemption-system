import { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import type { Account, ModalBaseProps, TeamOption } from "./types";
import { AccountAnalytics } from "@/components/shared/account-analytics";

interface ViewAccountModalProps extends ModalBaseProps {
  account: Account | null;
  onAccountUpdate?: (updatedAccount: Account) => void;
}

export function ViewAccountModal({
  isOpen,
  onClose,
  account,
  onAccountUpdate,
}: ViewAccountModalProps) {
  const [availableTeams, setAvailableTeams] = useState<TeamOption[]>([]);
  const [teamActionLoading, setTeamActionLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [localAccount, setLocalAccount] = useState<Account | null>(null);
  const [selectedAssignTeamId, setSelectedAssignTeamId] = useState<number | "">("");

  // Sync localAccount when account prop changes or modal opens
  useEffect(() => {
    if (isOpen && account) {
      setLocalAccount(account);
      setTeamError("");
      setSelectedAssignTeamId("");
    }
  }, [isOpen, account]);

  // Fetch teams when modal opens
  useEffect(() => {
    if (!isOpen) return;
    fetch(`${API_URL}/teams/`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { id: number; name: string }[]) =>
        setAvailableTeams(data.map((t) => ({ id: t.id, name: t.name }))),
      )
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen || !localAccount) return null;

  const handleAssignTeam = async () => {
    if (!selectedAssignTeamId) return;
    setTeamActionLoading(true);
    setTeamError("");
    try {
      const res = await fetchWithCsrf(
        `${API_URL}/teams/${selectedAssignTeamId}/assign_member/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: localAccount.id }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const teamName =
          availableTeams.find((t) => t.id === Number(selectedAssignTeamId))?.name ?? "";
        const updated = { ...localAccount, team_id: Number(selectedAssignTeamId), team_name: teamName };
        setLocalAccount(updated);
        setSelectedAssignTeamId("");
        onAccountUpdate?.(updated);
        toast.success(`Assigned to ${teamName}`);
      } else {
        setTeamError(data?.user?.[0] ?? data?.detail ?? data?.error ?? "Team assignment failed");
      }
    } catch {
      setTeamError("Error connecting to server");
    } finally {
      setTeamActionLoading(false);
    }
  };

  const handleRemoveFromTeam = async () => {
    if (!localAccount.team_id) return;
    setTeamActionLoading(true);
    setTeamError("");
    try {
      const res = await fetchWithCsrf(
        `${API_URL}/teams/${localAccount.team_id}/remove_member/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: localAccount.id }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        const updated = { ...localAccount, team_id: null, team_name: null };
        setLocalAccount(updated);
        onAccountUpdate?.(updated);
        toast.success("Removed from team");
      } else {
        setTeamError(data?.detail ?? data?.error ?? "Failed to remove from team");
      }
    } catch {
      setTeamError("Error connecting to server");
    } finally {
      setTeamActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-account-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-border"
      >
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-account-title" className="text-xl font-semibold">View Account</h2>
            <p className="text-sm text-gray-500 mt-1">
              Details for {localAccount.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Avatar Section */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-muted">
              <User className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>

          {/* Credentials Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={localAccount.username || ""}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={localAccount.email || ""}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={localAccount.full_name || ""}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <input
                  type="text"
                  value={localAccount.position || ""}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Account Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localAccount.uses_points && (
                <div>
                  <label className="block text-sm font-medium mb-2">Points</label>
                  <input
                    type="text"
                    value={localAccount.points?.toLocaleString() ?? "0"}
                    disabled
                    className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <input
                  type="text"
                  value={localAccount.is_activated ? "Active" : "Inactive"}
                  disabled
                  className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Team Section — Sales Agents only */}
          {localAccount.position === "Sales Agent" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Team</h3>
              {localAccount.team_id ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={localAccount.team_name ?? ""}
                    disabled
                    className="flex-1 px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none"
                  />
                  <button
                    onClick={handleRemoveFromTeam}
                    disabled={teamActionLoading}
                    className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    {teamActionLoading ? "Removing..." : "Remove from Team"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <select
                    value={selectedAssignTeamId}
                    onChange={(e) =>
                      setSelectedAssignTeamId(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    className="flex-1 px-3 py-2 rounded border bg-background border-border text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">No team assigned</option>
                    {availableTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignTeam}
                    disabled={!selectedAssignTeamId || teamActionLoading}
                    className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    {teamActionLoading ? "Assigning..." : "Assign to Team"}
                  </button>
                </div>
              )}
              {teamError && (
                <p className="text-sm text-red-500">{teamError}</p>
              )}
            </div>
          )}

          {/* Performance Analytics Section */}
          <AccountAnalytics accountId={localAccount.id} position={localAccount.position} />
        </div>
        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}