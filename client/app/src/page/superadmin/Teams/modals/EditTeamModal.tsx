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
import { SearchableSelect } from "@/components/ui/searchable-select";
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
  const [selectedSalesAgent, setSelectedSalesAgent] = useState<number | null>(
    null
  );
  const [memberLoading, setMemberLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
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
        // Filter to exclude those already in other teams
        const salesAgents = data.filter(
          (user: { team_id: number | null }) => !user.team_id || user.team_id === team?.id
        );

        console.log("DEBUG EditTeamModal: Sales agents filtered", {
          total: salesAgents.length,
          currentTeamId: team?.id,
        });

        setAvailableSalesAgents(salesAgents);
      }
    } catch (err) {
      console.error("DEBUG EditTeamModal: Error fetching sales agents", err);
    }
  }, [team?.id]);

  const fetchAvailableApprovers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users/?position=Approver`, {
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

    try {
      setActionLoading(true);
      console.log("DEBUG EditTeamModal: Adding member", {
        teamId: team.id,
        userId: selectedSalesAgent,
      });

      const response = await fetchWithCsrf(
        `/api/teams/${team.id}/assign_member/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: selectedSalesAgent }),
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
        setShowAddMember(false);
        setSelectedSalesAgent(null);
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
    } else if (!isOpen) {
      // Reset state when modal closes
      setTeamDetails(null);
      setShowAddMember(false);
      setSelectedSalesAgent(null);
      setErrorDialog({ show: false, title: "", message: "" });
    }
  }, [isOpen, team, fetchTeamDetails, fetchAvailableSalesAgents, fetchAvailableApprovers]);

  if (!isOpen || !team) return null;

  // Filter out members who are already in the team
  const memberUserIds = teamDetails?.members?.map((m) => m.user) || [];
  const filteredSalesAgents = availableSalesAgents.filter(
    (agent) => !memberUserIds.includes(agent.id)
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
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-border"
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
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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
                className="px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 bg-card text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                <UserPlus className="h-3 w-3" />
                {showAddMember ? "Cancel" : "Add Member"}
              </button>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div className="mb-4 p-4 rounded border border-border bg-muted">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Select Sales Agent
                </label>
                <div className="flex gap-2">
                  <SearchableSelect
                    options={filteredSalesAgents}
                    value={selectedSalesAgent}
                    onChange={(value) => {
                      const numValue = value ? Number(value) : null;
                      console.log(
                        "DEBUG EditTeamModal: Sales agent selected",
                        numValue
                      );
                      setSelectedSalesAgent(numValue);
                    }}
                    placeholder="Search or select an agent..."
                    displayFormat={(agent) => `${agent.full_name} (${agent.email}) - ${agent.points} pts`}
                    searchKeys={['full_name', 'email', 'username']}
                    className="flex-1"
                  />
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
                  { width: 180, type: "text" },     // Email
                  { width: 80, type: "text" },      // Points
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
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold">
                          Points
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
                            {member.user_details.email}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {member.user_details.points}
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
            <div className="w-full mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
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
