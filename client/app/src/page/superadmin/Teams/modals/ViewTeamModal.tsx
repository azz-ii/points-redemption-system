import { useState, useEffect, useCallback } from "react";
import { X, UserPlus, Trash2, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/config";
import type { ModalBaseProps, TeamDetail, SalesAgentOption } from "./types";
import { fetchWithCsrf } from "@/lib/csrf";
import { ModalSkeleton } from "@/components/shared/modal-skeleton";

interface ViewTeamModalProps extends ModalBaseProps {
  team: { id: number } | null;
  onRefresh: () => void;
}

export function ViewTeamModal({
  isOpen,
  onClose,
  team,
  onRefresh,
}: ViewTeamModalProps) {
  const [teamDetails, setTeamDetails] = useState<TeamDetail | null>(null);
  const [availableSalesAgents, setAvailableSalesAgents] = useState<
    SalesAgentOption[]
  >([]);
  const [availableApproverMembers, setAvailableApproverMembers] = useState<
    Array<{ id: number; full_name: string; email: string; points: number; team_id: number | null; team_name: string | null }>
  >([]);
  const [selectedSalesAgent, setSelectedSalesAgent] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [confirmReassign, setConfirmReassign] = useState<{
    userId: number;
    userName: string;
    fromTeam: string;
  } | null>(null);
  const [errorDialog, setErrorDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({
    show: false,
    title: "",
    message: "",
  });

  // Fetch team details when modal opens
  const fetchTeamDetails = useCallback(async () => {
    if (!team) return;

    try {
      setLoading(true);
      console.log("DEBUG ViewTeamModal: Fetching team details for ID", team.id);

      const response = await fetch(
        `/api/teams/${team.id}/`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("DEBUG ViewTeamModal: Team details fetched", {
        status: response.status,
        data,
      });

      if (response.ok) {
        setTeamDetails(data);
      } else {
        console.error(
          "DEBUG ViewTeamModal: Failed to fetch team details",
          data
        );
      }
    } catch (err) {
      console.error("DEBUG ViewTeamModal: Error fetching team details", err);
    } finally {
      setLoading(false);
    }
  }, [team]);

  useEffect(() => {
    if (isOpen && team) {
      console.log(
        "DEBUG ViewTeamModal: Modal opened, fetching team details",
        team.id
      );
      fetchTeamDetails();
      fetchAvailableSalesAgents();
      fetchAvailableApproverMembers();
    } else if (!isOpen) {
      // Reset state when modal closes
      setTeamDetails(null);
      setShowAddMember(false);
      setSelectedSalesAgent(null);
      setConfirmReassign(null);
      setErrorDialog({ show: false, title: "", message: "" });
    }
  }, [isOpen, team, fetchTeamDetails]);

  const fetchAvailableSalesAgents = async () => {
    try {
      console.log("DEBUG ViewTeamModal: Fetching available sales agents");

      const response = await fetch(`${API_URL}/users/sales-agents/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("DEBUG ViewTeamModal: Sales agents fetched", {
        status: response.status,
        totalAgents: data.length || 0,
      });

      if (response.ok && Array.isArray(data)) {
        console.log("DEBUG ViewTeamModal: Sales agents loaded", {
          total: data.length,
        });

        setAvailableSalesAgents(data);
      }
    } catch (err) {
      console.error("DEBUG ViewTeamModal: Error fetching sales agents", err);
    }
  };

  const fetchAvailableApproverMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/users/?position=Approver`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (response.ok && data.results) {
        const approvers = data.results.filter(
          (u: { is_archived: boolean; can_self_request: boolean }) =>
            !u.is_archived && u.can_self_request,
        );
        setAvailableApproverMembers(
          approvers.map((u: { id: number; full_name: string; email: string; points: number; team_id: number | null; team_name: string | null }) => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            points: u.points,
            team_id: u.team_id,
            team_name: u.team_name,
          })),
        );
      }
    } catch (err) {
      console.error("DEBUG ViewTeamModal: Error fetching approver members", err);
    }
  };

  const handleAddMember = async () => {
    if (!team || !selectedSalesAgent) {
      console.warn("DEBUG ViewTeamModal: Cannot add member - missing data", {
        team,
        selectedSalesAgent,
      });
      return;
    }

    // Find the selected user across both lists
    const agentEntry = availableSalesAgents.find((a) => a.id === selectedSalesAgent);
    const approverEntry = availableApproverMembers.find((a) => a.id === selectedSalesAgent);
    const selectedEntry = agentEntry ?? approverEntry;
    const selectedTeamId = agentEntry
      ? (agentEntry as SalesAgentOption & { team_id?: number | null }).team_id ?? null
      : approverEntry?.team_id ?? null;
    const selectedTeamName = agentEntry
      ? (agentEntry as SalesAgentOption & { team_name?: string | null }).team_name ?? null
      : approverEntry?.team_name ?? null;

    // If user belongs to another team, ask for confirmation first
    if (selectedTeamId !== null && selectedTeamId !== team.id) {
      setConfirmReassign({
        userId: selectedSalesAgent,
        userName: selectedEntry?.full_name ?? String(selectedSalesAgent),
        fromTeam: selectedTeamName ?? "another team",
      });
      return;
    }

    await doAddMember(selectedSalesAgent);
  };

  const doAddMember = async (userId: number) => {
    if (!team) return;
    try {
      setActionLoading(true);
      console.log("DEBUG ViewTeamModal: Adding member", {
        teamId: team.id,
        userId,
      });

      const response = await fetchWithCsrf(
        `/api/teams/${team.id}/assign_member/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const data = await response.json();
      console.log("DEBUG ViewTeamModal: Add member response", {
        status: response.status,
        data,
      });

      if (response.ok) {
        // Refresh team details and available agents
        await fetchTeamDetails();
        await fetchAvailableSalesAgents();
        await fetchAvailableApproverMembers();
        setShowAddMember(false);
        setSelectedSalesAgent(null);
        setConfirmReassign(null);
        onRefresh(); // Refresh parent teams list
      } else {
        console.error("DEBUG ViewTeamModal: Failed to add member", data);
        const errorMessage =
          data.error || data.user_id?.[0] || "Failed to add member";
        setErrorDialog({
          show: true,
          title: "Cannot Add Member",
          message: errorMessage,
        });
      }
    } catch (err) {
      console.error("DEBUG ViewTeamModal: Error adding member", err);
      setErrorDialog({
        show: true,
        title: "Connection Error",
        message: "Error connecting to server. Please try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number, userName: string) => {
    if (!team) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove ${userName} from this team?`
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      console.log("DEBUG ViewTeamModal: Removing member", {
        teamId: team.id,
        memberId,
        userName,
      });

      const response = await fetchWithCsrf(
        `/api/teams/${team.id}/remove_member/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: memberId }),
        }
      );

      const data = await response.json();
      console.log("DEBUG ViewTeamModal: Remove member response", {
        status: response.status,
        data,
      });

      if (response.ok) {
        // Refresh team details and available agents
        await fetchTeamDetails();
        await fetchAvailableSalesAgents();
        await fetchAvailableApproverMembers();
        onRefresh(); // Refresh parent teams list
      } else {
        console.error("DEBUG ViewTeamModal: Failed to remove member", data);
        setErrorDialog({
          show: true,
          title: "Cannot Remove Member",
          message: data.error || "Failed to remove member",
        });
      }
    } catch (err) {
      console.error("DEBUG ViewTeamModal: Error removing member", err);
      setErrorDialog({
        show: true,
        title: "Connection Error",
        message: "Error connecting to server. Please try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen || !team) return null;

  // Filter out members who are already in the team
  const memberUserIds = teamDetails?.members?.map((m) => m.user) || [];
  const filteredSalesAgents = availableSalesAgents.filter(
    (agent) => !memberUserIds.includes(agent.id)
  );
  const filteredApproverMembers = availableApproverMembers.filter(
    (a) => !memberUserIds.includes(a.id)
  );

  console.log("DEBUG ViewTeamModal: Rendering", {
    isOpen,
    teamId: team?.id,
    teamDetails,
    loading,
    membersCount: teamDetails?.members?.length || 0,
    availableAgentsCount: filteredSalesAgents.length,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-team-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-team-title" className="text-xl font-semibold">View Team</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {teamDetails?.name || "Loading..."}
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

        {/* Content */}
        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <ModalSkeleton
              showFormSection={true}
              formFieldCount={2}
              formColumns={2}
              showMembersSection={true}
              memberRowCount={5}
            />
          ) : teamDetails ? (
            <>
              {/* Team Details Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Team Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team Name</label>
                    <input
                      type="text"
                      value={teamDetails.name}
                      disabled
                      className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Approver</label>
                    <input
                      type="text"
                      value={
                        teamDetails.approver_details
                          ? `${teamDetails.approver_details.full_name} (${teamDetails.approver_details.email})`
                          : "No approver assigned"
                      }
                      disabled
                      className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Members Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Team Members ({teamDetails.members?.length || 0})
                  </h3>
                  <button
                    onClick={() => setShowAddMember(!showAddMember)}
                    disabled={actionLoading}
                    className="px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="h-3 w-3" />
                    {showAddMember ? "Cancel" : "Add Member"}
                  </button>
                </div>

                {/* Add Member Form */}
                {showAddMember && (
                  <div className="mb-4 p-4 rounded border border-border bg-muted">
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Select Member
                    </label>
                    <div className="flex gap-2 min-w-0">
                      <select
                        value={selectedSalesAgent ?? ""}
                        onChange={(e) => setSelectedSalesAgent(e.target.value ? Number(e.target.value) : null)}
                        className="flex-1 min-w-0 truncate px-3 py-2 rounded border bg-background border-border text-foreground focus:outline-none focus:border-ring text-sm"
                      >
                        <option value="">Select a member...</option>
                        {filteredSalesAgents.length > 0 && (
                          <optgroup label="Sales Agents">
                            {filteredSalesAgents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.full_name} ({agent.email}) - {agent.points} pts
                                {(agent as SalesAgentOption & { team_id?: number | null; team_name?: string | null }).team_name
                                  ? ` — In Team: ${(agent as SalesAgentOption & { team_name?: string | null }).team_name}`
                                  : ""}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {filteredApproverMembers.length > 0 && (
                          <optgroup label="Approvers (Self-Request)">
                            {filteredApproverMembers.map((approver) => (
                              <option key={approver.id} value={approver.id}>
                                {approver.full_name}
                                {approver.team_name ? ` — In Team: ${approver.team_name}` : ""}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <button
                        onClick={handleAddMember}
                        disabled={!selectedSalesAgent || actionLoading}
                        className="px-4 py-2 rounded text-sm font-semibold bg-card text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Members Table */}
                <div
                  className="border rounded-lg overflow-hidden border-border"
                >
                  {!teamDetails.members || teamDetails.members.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 text-sm">
                      No members in this team
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead
                        className="bg-card text-foreground"
                      >
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold">
                            Full Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">
                            Position
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">
                            Points
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold">
                            Joined
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {teamDetails.members.map((member) => (
                          <tr
                            key={member.id}
                            className="hover:bg-card transition-colors"
                          >
                            <td className="px-4 py-3 text-sm">
                              {member.user_details.full_name}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                member.user_details.position === "Approver"
                                  ? "bg-blue-100 border border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800/50 dark:text-blue-300"
                                  : "bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300"
                              }`}>
                                {member.user_details.position}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {member.user_details.points}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(member.joined_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() =>
                                  handleRemoveMember(
                                    member.user,
                                    member.user_details.full_name
                                  )
                                }
                                disabled={actionLoading}
                                className="text-red-500 hover:text-red-600 disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-red-500 py-8">
              Failed to load team details
            </div>
          )}
        </div>
      </div>

      {/* Reassignment Confirmation Dialog */}
      {confirmReassign && (
        <div className="fixed inset-0 flex items-center justify-center z-60 p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-lg shadow-2xl max-w-md w-full border border-border">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-500 bg-opacity-20">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Reassign Member?</h2>
                  <p className="text-xs text-muted-foreground mt-1">This user is already in another team</p>
                </div>
              </div>
              <button onClick={() => setConfirmReassign(null)} className="hover:opacity-70 transition-opacity">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm">
                <span className="font-semibold">{confirmReassign.userName}</span> is currently a member of{" "}
                <span className="font-semibold">{confirmReassign.fromTeam}</span>. Move them to this team instead?
              </p>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setConfirmReassign(null)}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors bg-card hover:bg-accent text-foreground border border-border"
              >
                Cancel
              </button>
              <button
                onClick={() => doAddMember(confirmReassign.userId)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              >
                {actionLoading ? "Moving..." : "Yes, Move"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog Overlay */}
      {errorDialog.show && (
        <div className="fixed inset-0 flex items-center justify-center z-60 p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-card rounded-lg shadow-2xl max-w-md w-full border border-border"
          >
            <div className="flex justify-between items-center p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500 bg-opacity-20">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{errorDialog.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please review the issue below
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log("DEBUG ViewTeamModal: Closing error dialog");
                  setErrorDialog({ show: false, title: "", message: "" });
                }}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm">{errorDialog.message}</p>
            </div>

            <div className="p-6 border-t border-border flex justify-end">
              <button
                onClick={() => {
                  console.log("DEBUG ViewTeamModal: Closing error dialog");
                  setErrorDialog({ show: false, title: "", message: "" });
                }}
                className="px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground border border-border"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
