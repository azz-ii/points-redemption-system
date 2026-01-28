import {
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useTheme } from "next-themes";
import { X, AlertTriangle, UserPlus, Trash2, AlertCircle } from "lucide-react";
import type {
  Team,
  ModalBaseProps,
  EditTeamData,
  ApproverOption,
  TeamDetail,
  SalesAgentOption,
} from "./types";
import { fetchWithCsrf } from "@/lib/csrf";

interface EditTeamModalProps extends ModalBaseProps {
  team: Team | null;
  editTeam: EditTeamData;
  setEditTeam: Dispatch<SetStateAction<EditTeamData>>;
  approvers: ApproverOption[];
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
  approvers,
  teams,
  loading,
  error,
  setError,
  onSubmit,
  onRefresh,
}: EditTeamModalProps) {
  const { resolvedTheme } = useTheme();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingApproverId, setPendingApproverId] = useState<number | null>(
    null
  );
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

  const fetchAvailableSalesAgents = async () => {
    try {
      console.log("DEBUG EditTeamModal: Fetching available sales agents");

      const response = await fetch("/api/users/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("DEBUG EditTeamModal: Users fetched", {
        status: response.status,
        totalUsers: data.accounts?.length || 0,
      });

      if (response.ok && data.accounts) {
        // Filter for Sales Agents only
        const salesAgents = data.accounts.filter(
          (user: { position: string }) => user.position === "Sales Agent"
        );

        console.log("DEBUG EditTeamModal: Sales agents filtered", {
          total: salesAgents.length,
        });

        setAvailableSalesAgents(salesAgents);
      }
    } catch (err) {
      console.error("DEBUG EditTeamModal: Error fetching sales agents", err);
    }
  };

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
    } else if (!isOpen) {
      // Reset state when modal closes
      setTeamDetails(null);
      setShowAddMember(false);
      setSelectedSalesAgent(null);
      setErrorDialog({ show: false, title: "", message: "" });
    }
  }, [isOpen, team, fetchTeamDetails]);

  if (!isOpen || !team) return null;

  // Filter out members who are already in the team
  const memberUserIds = teamDetails?.members?.map((m) => m.user) || [];
  const filteredSalesAgents = availableSalesAgents.filter(
    (agent) => !memberUserIds.includes(agent.id)
  );

  const handleClose = () => {
    console.log("DEBUG EditTeamModal: Closing modal");
    onClose();
    setError("");
  };

  const handleSubmit = () => {
    console.log("DEBUG EditTeamModal: Submit clicked", {
      teamId: team.id,
      editTeam,
      approversAvailable: approvers.length,
    });
    onSubmit();
  };

  console.log("DEBUG EditTeamModal: Rendering", {
    isOpen,
    teamId: team?.id,
    teamName: team?.name,
    editTeam,
    approversCount: approvers.length,
    loading,
    error,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-team-title"
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-3xl w-full border divide-y ${
          resolvedTheme === "dark" ? "border-gray-700 divide-gray-700" : "border-gray-200 divide-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="edit-team-title" className="text-xl font-semibold">Edit Team</h2>
            <p className="text-sm text-gray-500 mt-1">
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
            <label className="text-xs text-gray-500 mb-2 block">
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
              className={`w-full px-3 py-2 rounded border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:border-blue-500`}
              placeholder="Enter team name"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              Approver (Optional)
            </label>
            <select
              value={editTeam.approver ?? ""}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : null;
                console.log("DEBUG EditTeamModal: Approver changed", {
                  rawValue: e.target.value,
                  parsedValue: value,
                });

                // Check if this approver is already assigned to other teams (excluding current team)
                if (value) {
                  const existingTeams = teams.filter(
                    (t) => t.approver === value && t.id !== team.id
                  );
                  if (existingTeams.length > 0) {
                    console.log(
                      "DEBUG EditTeamModal: Approver already assigned to",
                      existingTeams.length,
                      "other team(s)"
                    );
                    setPendingApproverId(value);
                    setShowConfirmation(true);
                    return;
                  }
                }

                setEditTeam({ ...editTeam, approver: value });
              }}
              className={`w-full px-3 py-2 rounded border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:border-blue-500`}
            >
              <option value="">No Approver</option>
              {approvers.map((approver) => (
                <option key={approver.id} value={approver.id}>
                  {approver.full_name} ({approver.email})
                </option>
              ))}
            </select>
          </div>

          {/* Members Section */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-500">
                Team Members ({teamDetails?.members?.length || 0})
              </h3>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                disabled={actionLoading}
                className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                  resolvedTheme === "dark"
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                } transition-colors disabled:opacity-50`}
              >
                <UserPlus className="h-3 w-3" />
                {showAddMember ? "Cancel" : "Add Member"}
              </button>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div className="mb-4 p-4 rounded border border-gray-700 bg-gray-800 bg-opacity-50">
                <label className="text-xs text-gray-500 mb-2 block">
                  Select Sales Agent
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedSalesAgent ?? ""}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : null;
                      console.log(
                        "DEBUG EditTeamModal: Sales agent selected",
                        value
                      );
                      setSelectedSalesAgent(value);
                    }}
                    className={`flex-1 px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500 text-sm`}
                  >
                    <option value="">Select an agent...</option>
                    {filteredSalesAgents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.full_name} ({agent.email}) - {agent.points} pts
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedSalesAgent || actionLoading}
                    className={`px-4 py-2 rounded text-sm font-semibold ${
                      resolvedTheme === "dark"
                        ? "bg-white text-black hover:bg-gray-100"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    } transition-colors disabled:opacity-50`}
                  >
                    {actionLoading ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            )}

            {/* Members Table */}
            {memberLoading ? (
              <div className="text-center text-gray-500 py-4 text-sm">
                Loading members...
              </div>
            ) : (
              <div
                className={`border rounded-lg overflow-hidden ${
                  resolvedTheme === "dark"
                    ? "border-gray-700"
                    : "border-gray-200"
                }`}
              >
                {!teamDetails?.members || teamDetails.members.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 text-sm">
                    No members in this team
                  </div>
                ) : (
                  <table className="w-full">
                    <thead
                      className={`${
                        resolvedTheme === "dark"
                          ? "bg-gray-800 text-gray-300"
                          : "bg-gray-50 text-gray-700"
                      }`}
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
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {teamDetails.members.map((member) => (
                        <tr
                          key={member.id}
                          className={`hover:${
                            resolvedTheme === "dark"
                              ? "bg-gray-800"
                              : "bg-gray-50"
                          } transition-colors`}
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
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Team"}
          </button>
        </div>
      </div>

      {/* Approver Reassignment Confirmation Dialog */}
      {showConfirmation && pendingApproverId && (
        <div className="fixed inset-0 flex items-center justify-center z-60 p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-md w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="flex items-start gap-3 p-6 border-b border-gray-700">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  Approver Already Assigned
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  This approver is already managing{" "}
                  {
                    teams.filter(
                      (t) =>
                        t.approver === pendingApproverId && t.id !== team.id
                    ).length
                  }{" "}
                  other team(s)
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p
                className={
                  resolvedTheme === "dark" ? "text-gray-300" : "text-gray-600"
                }
              >
                {(() => {
                  const approver = approvers.find(
                    (a) => a.id === pendingApproverId
                  );
                  const assignedTeams = teams.filter(
                    (t) => t.approver === pendingApproverId && t.id !== team.id
                  );
                  return (
                    <>
                      <span className="font-semibold">
                        {approver?.full_name}
                      </span>{" "}
                      is currently the approver for:
                      <ul className="mt-2 ml-4 space-y-1">
                        {assignedTeams.map((t) => (
                          <li key={t.id} className="text-sm">
                            • {t.name}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3">
                        Do you still want to assign them as the approver for{" "}
                        <span className="font-semibold">{team.name}</span>?
                      </p>
                    </>
                  );
                })()}
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  console.log(
                    "DEBUG EditTeamModal: Confirmation cancelled, clearing approver selection"
                  );
                  setShowConfirmation(false);
                  setPendingApproverId(null);
                  // Clear the approver selection (revert to previous value)
                  setEditTeam({ ...editTeam, approver: team.approver });
                }}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log(
                    "DEBUG EditTeamModal: Confirmation accepted, assigning approver",
                    pendingApproverId
                  );
                  setEditTeam({ ...editTeam, approver: pendingApproverId });
                  setShowConfirmation(false);
                  setPendingApproverId(null);
                }}
                className="px-6 py-3 rounded-lg font-semibold transition-colors bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Yes, Assign Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog Overlay */}
      {errorDialog.show && (
        <div className="fixed inset-0 flex items-center justify-center z-60 p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-md w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500 bg-opacity-20">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{errorDialog.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">
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

            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  console.log("DEBUG EditTeamModal: Closing error dialog");
                  setErrorDialog({ show: false, title: "", message: "" });
                }}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                }`}
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
