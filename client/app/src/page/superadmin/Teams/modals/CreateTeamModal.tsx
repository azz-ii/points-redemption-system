import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { X, UserPlus, Trash2, AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/config";
import type { ModalBaseProps, NewTeamData, Team, SalesAgentOption, ApproverOption } from "./types";


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
  const [availableApprovers, setAvailableApprovers] = useState<ApproverOption[]>([]);
  const [availableApproverMembers, setAvailableApproverMembers] = useState<
    Array<{ id: number; full_name: string; email: string; points: number; team_id: number | null; team_name: string | null }>
  >([]);
  const [confirmReassign, setConfirmReassign] = useState<{
    userId: number;
    userName: string;
    fromTeam: string;
  } | null>(null);

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
        console.log("DEBUG CreateTeamModal: Sales agents fetched", { total: data.length });
        setAvailableSalesAgents(data);
      }
    } catch (err) {
      console.error("DEBUG CreateTeamModal: Error fetching sales agents", err);
    }
  };

  const fetchAvailableApprovers = async () => {
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
      console.error("DEBUG CreateTeamModal: Error fetching approvers", err);
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
        setAvailableApproverMembers(
          data.results
            .filter(
              (u: { can_self_request: boolean; is_archived: boolean }) =>
                u.can_self_request && !u.is_archived
            )
            .map((u: { id: number; full_name: string; email: string; points: number; team_id: number | null; team_name: string | null }) => ({
              id: u.id,
              full_name: u.full_name,
              email: u.email,
              points: u.points,
              team_id: u.team_id,
              team_name: u.team_name,
            }))
        );
      }
    } catch (err) {
      console.error("DEBUG CreateTeamModal: Error fetching approver members", err);
    }
  };

  // Fetch available sales agents when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableSalesAgents();
      fetchAvailableApprovers();
      fetchAvailableApproverMembers();
    } else {
      // Reset state when modal closes
      setSelectedMembers([]);
      setShowAddMember(false);
      setSelectedSalesAgent(null);
      setConfirmReassign(null);
    }
  }, [isOpen]);

  const handleAddMember = () => {
    if (!selectedSalesAgent) {
      console.warn("DEBUG CreateTeamModal: No sales agent selected");
      return;
    }

    const agentEntry = availableSalesAgents.find((a) => a.id === selectedSalesAgent);
    const approverEntry = availableApproverMembers.find((a) => a.id === selectedSalesAgent);
    const entry = agentEntry || approverEntry;

    if (!entry) {
      console.warn("DEBUG CreateTeamModal: User not found", selectedSalesAgent);
      return;
    }

    // Check if already staged
    if (selectedMembers.find((m) => m.id === entry.id)) {
      console.warn("DEBUG CreateTeamModal: User already staged", entry.id);
      return;
    }

    // Check if already in a team
    const teamName = agentEntry
      ? (agentEntry as SalesAgentOption & { team_name?: string | null }).team_name
      : approverEntry!.team_name;

    if (teamName) {
      console.log("DEBUG CreateTeamModal: User in team, requesting confirmation", {
        userId: selectedSalesAgent,
        userName: entry.full_name,
        fromTeam: teamName,
      });
      setConfirmReassign({ userId: selectedSalesAgent, userName: entry.full_name, fromTeam: teamName });
      return;
    }

    doStageMember(selectedSalesAgent);
  };

  const doStageMember = (userId: number) => {
    const agentEntry = availableSalesAgents.find((a) => a.id === userId);
    const approverEntry = availableApproverMembers.find((a) => a.id === userId);
    const entry = agentEntry || approverEntry;
    if (!entry) return;

    const memberToAdd: SalesAgentOption = {
      id: entry.id,
      username: (entry as SalesAgentOption & { username?: string }).username ?? "",
      full_name: entry.full_name,
      email: entry.email,
      points: entry.points,
      position: agentEntry ? "Sales Agent" : "Approver",
    };

    console.log("DEBUG CreateTeamModal: Staging member", memberToAdd.full_name);
    setSelectedMembers((prev) => [...prev, memberToAdd]);
    setSelectedSalesAgent(null);
    setShowAddMember(false);
  };

  const handleRemoveMember = (memberId: number) => {
    console.log("DEBUG CreateTeamModal: Removing member from list", memberId);
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
  };

  // Filter out already staged members
  const selectedMemberIds = selectedMembers.map((m) => m.id);
  const filteredSalesAgents = availableSalesAgents.filter(
    (agent) => !selectedMemberIds.includes(agent.id)
  );
  const filteredApproverMembers = availableApproverMembers.filter(
    (approver) => !selectedMemberIds.includes(approver.id)
  );

  if (!isOpen) return null;

  const handleClose = () => {
    console.log("DEBUG CreateTeamModal: Closing modal");
    onClose();
    setError("");
    setConfirmReassign(null);
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
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="create-team-title" className="text-xl font-semibold">Create Team</h2>
            <p className="text-sm text-muted-foreground mt-1">
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
        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Team Name *
            </label>
            <input
              type="text"
              value={newTeam.name}
              onChange={(e) => {
                console.log("DEBUG CreateTeamModal: Team name changed", e.target.value);
                setNewTeam({ ...newTeam, name: e.target.value });
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
              value={newTeam.approver ?? ""}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setNewTeam({ ...newTeam, approver: val });
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
                Team Members ({selectedMembers.length})
              </h3>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
                      console.log("DEBUG CreateTeamModal: Member selected", numValue);
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
                    disabled={!selectedSalesAgent}
                    className="px-4 py-2 rounded text-sm font-semibold bg-card text-foreground hover:bg-accent transition-colors disabled:opacity-50"
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
                <div className="text-center text-muted-foreground py-8 text-sm">
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
                        Position
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
                    {selectedMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-card transition-colors"
                      >
                        <td className="px-4 py-3 text-sm">{member.full_name}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              (member as SalesAgentOption & { position?: string }).position === "Approver"
                                ? "bg-blue-100 border border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800/50 dark:text-blue-300"
                                : "bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300"
                            }`}
                          >
                            {(member as SalesAgentOption & { position?: string }).position ?? "Sales Agent"}
                          </span>
                        </td>
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
            <div className="w-full mb-3 p-2 g-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Team"}
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
                Adding them here will remove them from that team when this team is created.
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
                  doStageMember(userId);
                }}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
              >
                Yes, Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
