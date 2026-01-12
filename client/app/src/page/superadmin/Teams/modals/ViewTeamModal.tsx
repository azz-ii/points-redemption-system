import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { X, UserPlus, Trash2, AlertCircle } from "lucide-react";
import type { ModalBaseProps, TeamDetail, SalesAgentOption } from "./types";

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
  const { resolvedTheme } = useTheme();
  const [teamDetails, setTeamDetails] = useState<TeamDetail | null>(null);
  const [availableSalesAgents, setAvailableSalesAgents] = useState<
    SalesAgentOption[]
  >([]);
  const [selectedSalesAgent, setSelectedSalesAgent] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      console.log("DEBUG ViewTeamModal: Fetching team details for ID", team.id);

      const response = await fetch(
        `http://127.0.0.1:8000/api/teams/${team.id}/`,
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
    } else if (!isOpen) {
      // Reset state when modal closes
      setTeamDetails(null);
      setShowAddMember(false);
      setSelectedSalesAgent(null);
      setErrorDialog({ show: false, title: "", message: "" });
    }
  }, [isOpen, team, fetchTeamDetails]);

  const fetchAvailableSalesAgents = async () => {
    try {
      console.log("DEBUG ViewTeamModal: Fetching available sales agents");

      const response = await fetch("http://127.0.0.1:8000/api/users/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("DEBUG ViewTeamModal: Users fetched", {
        status: response.status,
        totalUsers: data.accounts?.length || 0,
      });

      if (response.ok && data.accounts) {
        // Filter for Sales Agents only and exclude current team members
        const salesAgents = data.accounts.filter(
          (user: { position: string }) => user.position === "Sales Agent"
        );

        console.log("DEBUG ViewTeamModal: Sales agents filtered", {
          total: salesAgents.length,
        });

        setAvailableSalesAgents(salesAgents);
      }
    } catch (err) {
      console.error("DEBUG ViewTeamModal: Error fetching sales agents", err);
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

    try {
      setActionLoading(true);
      console.log("DEBUG ViewTeamModal: Adding member", {
        teamId: team.id,
        userId: selectedSalesAgent,
      });

      const response = await fetch(
        `http://127.0.0.1:8000/api/teams/${team.id}/assign_member/`,
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
      console.log("DEBUG ViewTeamModal: Add member response", {
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

      const response = await fetch(
        `http://127.0.0.1:8000/api/teams/${team.id}/remove_member/`,
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
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-3xl w-full border divide-y ${
          resolvedTheme === "dark" ? "border-gray-700 divide-gray-700" : "border-gray-200 divide-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-team-title" className="text-xl font-semibold">View Team</h2>
            <p className="text-sm text-gray-500 mt-1">
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
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              Loading team details...
            </div>
          ) : teamDetails ? (
            <>
              {/* Team Details Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500">
                  Team Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team Name</label>
                    <input
                      type="text"
                      value={teamDetails.name}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      } focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Approver</label>
                    <input
                      type="text"
                      value={teamDetails.approver_details ? teamDetails.approver_details.full_name : "No Approver"}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed ${
                        resolvedTheme === "dark"
                          ? "bg-gray-700 border-gray-600 text-gray-300"
                          : "bg-gray-100 border-gray-300 text-gray-600"
                      } focus:outline-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Members Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-500">
                    Team Members ({teamDetails.members?.length || 0})
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
                            "DEBUG ViewTeamModal: Sales agent selected",
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
                            {agent.full_name} ({agent.email}) - {agent.points}{" "}
                            pts
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
                <div
                  className={`border rounded-lg overflow-hidden ${
                    resolvedTheme === "dark"
                      ? "border-gray-700"
                      : "border-gray-200"
                  }`}
                >
                  {!teamDetails.members || teamDetails.members.length === 0 ? (
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
                          <th className="px-4 py-3 text-left text-xs font-semibold">
                            Joined
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
                                className="px-3 py-1 rounded text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove
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

            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => {
                  console.log("DEBUG ViewTeamModal: Closing error dialog");
                  setErrorDialog({ show: false, title: "", message: "" });
                }}
                className={`w-full px-4 py-2 rounded font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-white hover:bg-gray-100 text-gray-900"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
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
