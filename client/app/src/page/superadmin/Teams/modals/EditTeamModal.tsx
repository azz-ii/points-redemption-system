import {
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { X, UserPlus, Trash2, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/config";
import type {
  Team,
  ModalBaseProps,
  EditTeamData,
  TeamDetail,
  SalesAgentOption,
  ApproverOption,
} from "./types";
import { fetchWithCsrf } from "@/lib/csrf";
import { TableSkeleton } from "@/components/shared/table-skeleton";

interface EditTeamModalProps extends ModalBaseProps {
  team: Team | null;
  editTeam: EditTeamData;
  setEditTeam: Dispatch<SetStateAction<EditTeamData>>;
  teams: Team[];
  loading: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
  onRefresh: () => void;
}

export function EditTeamModal({
  isOpen,
  onClose,
  team,
  editTeam,
  setEditTeam,
  teams,
  loading,
  error,
  setError,
  onSubmit,
  onRefresh,
}: EditTeamModalProps) {
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
  const [memberLoading, setMemberLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [confirmReassign, setConfirmReassign] = useState<{
    userId: number;
    userName: string;
    fromTeam: string;
  } | null>(null);
  const [availableApprovers, setAvailableApprovers] = useState<ApproverOption[]>([]);
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
      setMemberLoading(true);
      console.log("DEBUG EditTeamModal: Fetching team details for ID", team.id);

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
      console.log("DEBUG EditTeamModal: Team details fetched", {
        status: response.status,
        data,
      });

      if (response.ok) {
        setTeamDetails(data);
      } else {
        console.error(
          "DEBUG EditTeamModal: Failed to fetch team details",
          data
        );
      }
    } catch (err) {
      console.error("DEBUG EditTeamModal: Error fetching team details", err);
    } finally {
      setMemberLoading(false);
    }
  }, [team]);

  const fetchAvailableSalesAgents = useCallback(async () => {
    try {
      console.log("DEBUG EditTeamModal: Fetching available sales agents");

      const response = await fetch(`${API_URL}/users/sales-agents/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("DEBUG EditTeamModal: Sales agents fetched", {
        status: response.status,
        totalAgents: data.length || 0,
      });

      if (response.ok && Array.isArray(data)) {
        console.log("DEBUG EditTeamModal: Sales agents filtered", {
          total: data.length,
          currentTeamId: team?.id,
        });

        setAvailableSalesAgents(data);
      }
    } catch (err) {
      console.error("DEBUG EditTeamModal: Error fetching sales agents", err);
    }
  }, [team?.id]);

  const fetchAvailableApproverMembers = useCallback(async () => {
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
      console.error("DEBUG EditTeamModal: Error fetching approver members", err);
    }
  }, []);

  const fetchAvailableApprovers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users/?position=Approver,Admin`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok && data.results) {
        const approvers = data.results
          .filter((user: { is_archived: boolean }) => !user.is_archived)
          .map((user: { id: number; full_name: string; email: string }) => ({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
          }));
        setAvailableApprovers(approvers);
      }
    } catch (err) {
      console.error("DEBUG EditTeamModal: Error fetching approvers", err);
    }
  }, []);

  const handleAddMember = async () => {
    if (!team || !selectedSalesAgent) {
      console.warn("DEBUG EditTeamModal: Cannot add member - missing data", {
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
      console.log("DEBUG EditTeamModal: Adding member", {
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
      console.log("DEBUG EditTeamModal: Add member response", {
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
        console.error("DEBUG EditTeamModal: Failed to add member", data);
        const errorMessage =
          data.error || data.user_id?.[0] || "Failed to add member";
        setErrorDialog({
          show: true,
          title: "Cannot Add Member",
          message: errorMessage,
        });
      }
    } catch (err) {
      console.error("DEBUG EditTeamModal: Error adding member", err);
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
      console.log("DEBUG EditTeamModal: Removing member", {
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
      console.log("DEBUG EditTeamModal: Remove member response", {
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
        console.error("DEBUG EditTeamModal: Failed to remove member", data);
        setErrorDialog({
          show: true,
          title: "Cannot Remove Member",
          message: data.error || "Failed to remove member",
        });
      }
    } catch (err) {
      console.error("DEBUG EditTeamModal: Error removing member", err);
      setErrorDialog({
        show: true,
        title: "Connection Error",
        message: "Error connecting to server. Please try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && team) {
      console.log(
        "DEBUG EditTeamModal: Modal opened, fetching team details",
        team.id
      );
      fetchTeamDetails();
      fetchAvailableSalesAgents();
      fetchAvailableApprovers();
      fetchAvailableApproverMembers();
    } else if (!isOpen) {
      // Reset state when modal closes
      setTeamDetails(null);
      setShowAddMember(false);
      setSelectedSalesAgent(null);
      setConfirmReassign(null);
      setErrorDialog({ show: false, title: "", message: "" });
    }
  }, [isOpen, team, fetchTeamDetails, fetchAvailableSalesAgents, fetchAvailableApprovers, fetchAvailableApproverMembers]);

  if (!isOpen || !team) return null;

  // Filter out members who are already in the team
  const memberUserIds = teamDetails?.members?.map((m) => m.user) || [];
  const filteredSalesAgents = availableSalesAgents.filter(
    (agent) => !memberUserIds.includes(agent.id)
  );
  const filteredApproverMembers = availableApproverMembers.filter(
    (a) => !memberUserIds.includes(a.id)
  );

  const handleSubmit = () => {
    console.log("DEBUG EditTeamModal: Submit clicked", {
      teamId: team.id,
      editTeam,
    });
    onSubmit();
  };

  console.log("DEBUG EditTeamModal: Rendering", {
    isOpen,
    teamId: team?.id,
    teamName: team?.name,
    editTeam,
    loading,
    error,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-team-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="edit-team-title" className="text-xl font-semibold">Edit Team</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Update team information and members
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
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Team Name *
            </label>
            <input
              type="text"
              value={editTeam.name}
              onChange={(e) => {
                console.log(
                  "DEBUG EditTeamModal: Team name changed",
                  e.target.value
                );
                setEditTeam({ ...editTeam, name: e.target.value });
              }}
              className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
              placeholder="Enter team name"
            />
          </div>

          {/* Approver Selection */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Approver *
            </label>
            <select
              value={editTeam.approver ?? ""}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setEditTeam({ ...editTeam, approver: val });
              }}
              className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
            >
              <option value="">Select an approver...</option>
              {availableApprovers.map((approver) => (
                <option key={approver.id} value={approver.id}>
                  {approver.full_name} ({approver.email})
                </option>
              ))}
            </select>
          </div>

          {/* Members Section */}
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Team Members ({teamDetails?.members?.length || 0})
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
                    onChange={(e) => {
                      const numValue = e.target.value ? Number(e.target.value) : null;
                      console.log("DEBUG EditTeamModal: Member selected", numValue);
                      setSelectedSalesAgent(numValue);
                    }}
                    className="flex-1 min-w-0 truncate px-3 py-2 rounded border bg-background border-border text-foreground focus:outline-none focus:border-ring text-sm"
                  >
                    <option value="">Select a member...</option>
                    {filteredSalesAgents.length > 0 && (
                      <optgroup label="Sales Agents">
                        {filteredSalesAgents.map((agent) => {
                          const a = agent as SalesAgentOption & { team_name?: string | null };
                          return (
                            <option key={agent.id} value={agent.id}>
                              {agent.full_name}
                              {a.team_name ? ` — In Team: ${a.team_name}` : ""}
                            </option>
                          );
                        })}
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
            {memberLoading ? (
              <TableSkeleton
                rowCount={5}
                showCheckbox={false}
                showToolbar={false}
                columnConfig={[
                  { width: 150, type: "text" },     // Name
                  { width: 100, type: "text" },     // Position
                  { width: 80, type: "text" },      // Points
                  { width: 100, type: "text" },     // Joined
                  { width: 100, align: "right", type: "actions" }, // Actions
                ]}
              />
            ) : (
              <div
                className="border rounded-lg overflow-hidden border-border"
              >
                {!teamDetails?.members || teamDetails.members.length === 0 ? (
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
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                member.user_details.position === "Approver"
                                  ? "bg-blue-100 border border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800/50 dark:text-blue-300"
                                  : "bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300"
                              }`}
                            >
                              {member.user_details.position ?? "Sales Agent"}
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
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex justify-end">
          {error && (
            <div className="w-full mb-3 p-2 g-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Team"}
          </button>
        </div>
      </div>

      {/* Reassign Confirmation Dialog */}
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
                  <p className="text-xs text-muted-foreground mt-1">
                    This user is already in another team
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmReassign(null)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm">
                <span className="font-semibold">{confirmReassign.userName}</span> is currently
                a member of <span className="font-semibold">{confirmReassign.fromTeam}</span>.
                Moving them here will remove them from that team.
              </p>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => setConfirmReassign(null)}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-card hover:bg-accent text-foreground border border-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const userId = confirmReassign.userId;
                  setConfirmReassign(null);
                  doAddMember(userId);
                }}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-500 hover:bg-yellow-600 text-white transition-colors disabled:opacity-50"
              >
                Yes, Move
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
                  console.log("DEBUG EditTeamModal: Closing error dialog");
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
                  console.log("DEBUG EditTeamModal: Closing error dialog");
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
