import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { X, UserPlus, Trash2, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/config";
import type { ModalBaseProps, NewTeamData, Team, SalesAgentOption } from "./types";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface CreateTeamModalProps extends ModalBaseProps {
  newTeam: NewTeamData;
  setNewTeam: Dispatch<SetStateAction<NewTeamData>>;
  teams: Team[];
  loading: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  onSubmit: (memberIds?: number[]) => void;
}

export function CreateTeamModal({
  isOpen,
  onClose,
  newTeam,
  setNewTeam,
  teams,
  loading,
  error,
  setError,
  onSubmit,
}: CreateTeamModalProps) {
  const [availableSalesAgents, setAvailableSalesAgents] = useState<SalesAgentOption[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<SalesAgentOption[]>([]);
  const [selectedSalesAgent, setSelectedSalesAgent] = useState<number | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState<Array<{ id: number; team: number | null }>>([]);
  const [errorDialog, setErrorDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({
    show: false,
    title: "",
    message: "",
  });

  const fetchAvailableSalesAgents = async () => {
    try {
      console.log("DEBUG CreateTeamModal: Fetching available sales agents");
      
      const response = await fetch(`${API_URL}/users/sales-agents/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      console.log("DEBUG CreateTeamModal: Sales agents fetched", {
        status: response.status,
        totalAgents: data.length || 0,
      });

      if (response.ok && Array.isArray(data)) {
        // Store all users for team membership checking
        setAllUsers(data.map((u: { id: number; team_id: number | null }) => ({ id: u.id, team: u.team_id })));
        
        // Filter to exclude those already in teams
        const salesAgents = data.filter(
          (user: { team_id: number | null }) => !user.team_id
        );
        
        console.log("DEBUG CreateTeamModal: Sales agents filtered", {
          total: salesAgents.length,
          totalBeforeTeamFilter: data.length,
        });
        
        setAvailableSalesAgents(salesAgents);
      }
    } catch (err) {
      console.error("DEBUG CreateTeamModal: Error fetching sales agents", err);
    }
  };

  // Fetch available sales agents when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableSalesAgents();
    } else {
      // Reset state when modal closes
      setSelectedMembers([]);
      setShowAddMember(false);
      setSelectedSalesAgent(null);
      setErrorDialog({ show: false, title: "", message: "" });
    }
  }, [isOpen]);

  const handleAddMember = () => {
    if (!selectedSalesAgent) {
      console.warn("DEBUG CreateTeamModal: No sales agent selected");
      return;
    }

    const agent = availableSalesAgents.find(a => a.id === selectedSalesAgent);
    if (!agent) {
      console.warn("DEBUG CreateTeamModal: Agent not found", selectedSalesAgent);
      return;
    }

    // Check if this user is already in a team
    const userInTeam = allUsers.find(u => u.id === selectedSalesAgent && u.team !== null);
    if (userInTeam) {
      const teamName = teams.find(t => t.id === userInTeam.team)?.name || "another team";
      console.log("DEBUG CreateTeamModal: User already in team", {
        userId: selectedSalesAgent,
        userName: agent.full_name,
        teamId: userInTeam.team,
        teamName,
      });
      
      setErrorDialog({
        show: true,
        title: "Cannot Add Member",
        message: `${agent.full_name} is already a member of ${teamName}. A user can only belong to one team at a time.`,
      });
      return;
    }

    // Check if already selected
    if (selectedMembers.find(m => m.id === agent.id)) {
      console.warn("DEBUG CreateTeamModal: Agent already selected", agent.id);
      return;
    }

    console.log("DEBUG CreateTeamModal: Adding member to list", agent.full_name);
    setSelectedMembers([...selectedMembers, agent]);
    setSelectedSalesAgent(null);
    setShowAddMember(false);
  };

  const handleRemoveMember = (memberId: number) => {
    console.log("DEBUG CreateTeamModal: Removing member from list", memberId);
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
  };

  // Filter out already selected members
  const selectedMemberIds = selectedMembers.map(m => m.id);
  const filteredSalesAgents = availableSalesAgents.filter(
    agent => !selectedMemberIds.includes(agent.id)
  );

  if (!isOpen) return null;

  const handleClose = () => {
    console.log("DEBUG CreateTeamModal: Closing modal");
    onClose();
    setError("");
    setErrorDialog({ show: false, title: "", message: "" });
  };

  const handleSubmit = () => {
    console.log("DEBUG CreateTeamModal: Submit clicked", {
      newTeam,
      membersToAdd: selectedMembers.length,
    });
    // Pass selected member IDs to parent
    onSubmit(selectedMembers.map(m => m.id));
  };

  console.log("DEBUG CreateTeamModal: Rendering", {
    isOpen,
    newTeam,
    loading,
    error,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-team-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="create-team-title" className="text-xl font-semibold">Create Team</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add a new team to your organization
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
              value={newTeam.name}
              onChange={(e) => {
                console.log("DEBUG CreateTeamModal: Team name changed", e.target.value);
                setNewTeam({ ...newTeam, name: e.target.value });
              }}
              className="w-full px-3 py-2 rounded border bg-card border-gray-600 text-foreground focus:outline-none focus:border-blue-500"
              placeholder="Enter team name"
            />
          </div>

          {/* Members Section */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-500">
                Team Members ({selectedMembers.length})
              </h3>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 bg-card text-black hover:bg-accent transition-colors"
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
                  <SearchableSelect
                    options={filteredSalesAgents}
                    value={selectedSalesAgent}
                    onChange={(value) => {
                      const numValue = value ? Number(value) : null;
                      console.log("DEBUG CreateTeamModal: Sales agent selected", numValue);
                      setSelectedSalesAgent(numValue);
                    }}
                    placeholder="Search or select an agent..."
                    displayFormat={(agent) => `${agent.full_name} (${agent.email}) - ${agent.points} pts`}
                    searchKeys={['full_name', 'email', 'username']}
                    className="flex-1"
                  />
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedSalesAgent}
                    className="px-4 py-2 rounded text-sm font-semibold bg-card text-black hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div
              className="border rounded-lg overflow-hidden border-border"
            >
              {selectedMembers.length === 0 ? (
                <div className="text-center text-gray-500 py-8 text-sm">
                  No members added yet
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
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {selectedMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-card transition-colors"
                      >
                        <td className="px-4 py-3 text-sm">{member.full_name}</td>
                        <td className="px-4 py-3 text-sm">{member.email}</td>
                        <td className="px-4 py-3 text-sm">{member.points}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-500 hover:text-red-600"
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
            {loading ? "Creating..." : "Create Team"}
          </button>
        </div>
      </div>

      {/* Member Assignment Error Dialog */}
      {errorDialog.show && (
        <div className="fixed inset-0 flex items-center justify-center z-60 p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-card rounded-lg shadow-2xl max-w-md w-full border border-border"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-500 bg-opacity-20">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{errorDialog.title}</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Some members could not be added
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  console.log("DEBUG CreateTeamModal: Closing error dialog");
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
                  console.log("DEBUG CreateTeamModal: Closing error dialog");
                  setErrorDialog({ show: false, title: "", message: "" });
                }}
                className="px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground border border-gray-600"
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
