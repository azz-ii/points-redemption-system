import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { fetchWithCsrf } from "@/lib/csrf";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  Search,
  LogOut,
  X,
  Users,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Warehouse,
} from "lucide-react";
import {
  CreateTeamModal,
  ViewTeamModal,
  EditTeamModal,
  DeleteTeamModal,
  type NewTeamData,
  type EditTeamData,
  type ApproverOption,
  type MarketingAdminOption,
} from "./modals";
import { TeamsTable } from "./components";
import type { Team } from "./components/columns";

function Teams() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{ id: number } | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [editError, setEditError] = useState("");
  const [approvers, setApprovers] = useState<ApproverOption[]>([]);
  const [marketingAdmins, setMarketingAdmins] = useState<MarketingAdminOption[]>([]);
  const [newTeam, setNewTeam] = useState<NewTeamData>({
    name: "",
    approver: null,
  });
  const [editTeam, setEditTeam] = useState<EditTeamData>({
    name: "",
    approver: null,
  });
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  // Fetch teams on component mount
  const fetchTeams = async () => {
    try {
      setLoading(true);
      console.log("Fetching teams from API...");
      const response = await fetch("/api/teams/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      
      console.log("API Response:", response.status, response.ok);
      console.log("API Data:", data);

      if (response.ok) {
        setTeams(Array.isArray(data) ? data : []);
        console.log("Teams set:", Array.isArray(data) ? data : []);
      } else {
        console.error("API Error:", data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      console.error("Error fetching teams:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch approvers for dropdown
  const fetchApprovers = async () => {
    try {
      console.log("DEBUG Teams: Fetching approvers...");
      const response = await fetch("/api/users/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      
      console.log("DEBUG Teams: Users fetched", {
        status: response.status,
        totalUsers: data.accounts?.length || 0,
      });

      if (response.ok && data.accounts) {
        const approversList = data.accounts
          .filter((user: { position: string }) => user.position === "Approver")
          .map((user: { id: number; full_name: string; email: string }) => ({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
          }));
        
        console.log("DEBUG Teams: Approvers filtered", {
          count: approversList.length,
        });
        
        setApprovers(approversList);
      }
    } catch (err) {
      console.error("DEBUG Teams: Error fetching approvers", err);
    }
  };

  // Fetch marketing admins for dropdown
  const fetchMarketingAdmins = async () => {
    try {
      console.log("DEBUG Teams: Fetching marketing admins...");
      const response = await fetch("/api/users/", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      
      console.log("DEBUG Teams: Users fetched for marketing admins", {
        status: response.status,
        totalUsers: data.accounts?.length || 0,
      });

      if (response.ok && data.accounts) {
        const marketingAdminsList = data.accounts
          .filter((user: { position: string }) => user.position === "Marketing")
          .map((user: { id: number; full_name: string; email: string }) => ({
            id: user.id,
            full_name: user.full_name,
            email: user.email,
          }));
        
        console.log("DEBUG Teams: Marketing admins filtered", {
          count: marketingAdminsList.length,
        });
        
        setMarketingAdmins(marketingAdminsList);
      }
    } catch (err) {
      console.error("DEBUG Teams: Error fetching marketing admins", err);
    }
  };

  // Load teams on mount
  useEffect(() => {
    fetchTeams();
    fetchApprovers();
    fetchMarketingAdmins();
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filter teams based on search query
  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.id.toString().includes(searchQuery) ||
      team.approver_details?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.approver_details?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTeams.length / itemsPerPage)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeams = filteredTeams.slice(startIndex, endIndex);

  // Handle create team submission
  const handleCreateTeam = async (memberIds?: number[]) => {
    if (!newTeam.name.trim()) {
      setCreateError("Team name is required");
      console.warn("DEBUG Teams: Create team validation failed - name required");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError("");
      console.log("DEBUG Teams: Creating team", { newTeam, memberIds });

      const response = await fetchWithCsrf("/api/teams/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTeam),
      });

      const data = await response.json();
      console.log("DEBUG Teams: Create team response", {
        status: response.status,
        data,
      });

      if (response.ok) {
        console.log("DEBUG Teams: Team created successfully", data);
        const createdTeamId = data.id;

        // Assign members if any were selected
        if (memberIds && memberIds.length > 0) {
          console.log("DEBUG Teams: Assigning", memberIds.length, "members to team");
          for (const memberId of memberIds) {
            try {
              const assignResponse = await fetchWithCsrf(
                `/api/teams/${createdTeamId}/assign_member/`,
                {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ user_id: memberId }),
                }
              );
              
              if (!assignResponse.ok) {
                const errorData = await assignResponse.json();
                console.warn("DEBUG Teams: Failed to assign member", memberId, errorData);
              } else {
                console.log("DEBUG Teams: Successfully assigned member", memberId);
              }
            } catch (err) {
              console.error("DEBUG Teams: Error assigning member", memberId, err);
            }
          }
        }

        setToast({
          message: `Team "${newTeam.name}" created successfully!`,
          type: "success",
        });
        setIsCreateModalOpen(false);
        setNewTeam({ name: "", approver: null });
        fetchTeams(); // Refresh teams list
      } else {
        const errorMessage =
          data.name?.[0] ||
          data.approver?.[0] ||
          data.error ||
          "Failed to create team";
        setCreateError(errorMessage);
        console.error("DEBUG Teams: Failed to create team", data);
      }
    } catch (err) {
      console.error("DEBUG Teams: Error creating team", err);
      setCreateError("Error connecting to server");
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle view team
  const handleViewTeam = (teamId: number) => {
    console.log("DEBUG Teams: Opening view modal for team", teamId);
    setSelectedTeam({ id: teamId });
    setIsViewModalOpen(true);
  };

  // Handle edit team click
  const handleEditClick = (team: Team) => {
    console.log("DEBUG Teams: Opening edit modal for team", {
      id: team.id,
      name: team.name,
    });
    setTeamToEdit(team);
    setEditTeam({
      name: team.name,
      approver: team.approver_details?.id ?? null,
    });
    setEditError("");
    setIsEditModalOpen(true);
  };

  // Handle edit team submission
  const handleEditTeam = async () => {
    if (!teamToEdit) {
      console.error("DEBUG Teams: No team selected for editing");
      return;
    }

    if (!editTeam.name.trim()) {
      setEditError("Team name is required");
      console.warn("DEBUG Teams: Edit team validation failed - name required");
      return;
    }

    try {
      setEditLoading(true);
      setEditError("");
      console.log("DEBUG Teams: Updating team", {
        teamId: teamToEdit.id,
        editTeam,
      });

      const response = await fetchWithCsrf(
        `/api/teams/${teamToEdit.id}/`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editTeam),
        }
      );

      const data = await response.json();
      console.log("DEBUG Teams: Edit team response", {
        status: response.status,
        data,
      });

      if (response.ok) {
        setToast({
          message: `Team "${editTeam.name}" updated successfully!`,
          type: "success",
        });
        setIsEditModalOpen(false);
        setTeamToEdit(null);
        setEditTeam({ name: "", approver: null });
        fetchTeams(); // Refresh teams list
      } else {
        const errorMessage =
          data.name?.[0] ||
          data.approver?.[0] ||
          data.error ||
          "Failed to update team";
        setEditError(errorMessage);
        console.error("DEBUG Teams: Failed to update team", data);
      }
    } catch (err) {
      console.error("DEBUG Teams: Error updating team", err);
      setEditError("Error connecting to server");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete team click
  const handleDeleteClick = (team: Team) => {
    console.log("DEBUG Teams: Opening delete modal for team", {
      id: team.id,
      name: team.name,
      memberCount: team.member_count,
    });
    setTeamToDelete(team);
    setIsDeleteModalOpen(true);
  };

  // Handle delete team confirmation
  const handleDeleteTeam = async (teamId: number) => {
    try {
      setDeleteLoading(true);
      console.log("DEBUG Teams: Deleting team", teamId);

      const response = await fetchWithCsrf(
        `/api/teams/${teamId}/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("DEBUG Teams: Delete team response", {
        status: response.status,
        ok: response.ok,
      });

      if (response.ok) {
        setToast({
          message: `Team deleted successfully!`,
          type: "success",
        });
        setIsDeleteModalOpen(false);
        setTeamToDelete(null);
        fetchTeams(); // Refresh teams list
      } else {
        const data = await response.json();
        console.error("DEBUG Teams: Failed to delete team", {
          status: response.status,
          data,
        });

        // Handle constraint errors (400 status)
        if (response.status === 400) {
          const errorMessage = data.detail || data.error || "Failed to delete team";
          setToast({
            message: errorMessage,
            type: "error",
          });
        } else {
          setToast({
            message: "Failed to delete team",
            type: "error",
          });
        }
        setIsDeleteModalOpen(false);
        setTeamToDelete(null);
      }
    } catch (err) {
      console.error("DEBUG Teams: Error deleting team", err);
      setToast({
        message: "Error connecting to server",
        type: "error",
      });
      setIsDeleteModalOpen(false);
      setTeamToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div
          className={`md:hidden sticky top-0 z-40 p-4 border-b flex justify-between items-center ${
            resolvedTheme === "dark"
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full ${
                resolvedTheme === "dark" ? "bg-green-600" : "bg-green-500"
              } flex items-center justify-center`}
            >
              <span className="text-white font-semibold text-xs">I</span>
            </div>
            <span className="font-medium text-sm">Welcome, Izza!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTeams()}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
              title="Refresh Teams"
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/admin/inventory")}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
            >
              <Warehouse className="h-5 w-5" />
            </button>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Teams</h1>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View and manage sales teams.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNotificationOpen(true)}
                className={`p-2 rounded-lg ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 hover:bg-gray-800"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-colors`}
              >
                <Bell className="h-6 w-6" />
              </button>
              <ThemeToggle />
            </div>
          </div>



          {/* Teams Table */}
          <TeamsTable
            teams={teams}
            loading={loading}
            onView={(team) => handleViewTeam(team.id)}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onCreateNew={() => {
              console.log("DEBUG Teams: Opening create modal");
              setIsCreateModalOpen(true);
            }}
            onRefresh={fetchTeams}
            refreshing={loading}
          />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto pb-20">
          <div className="p-4 space-y-4">
            <h2 className="text-2xl font-semibold mb-2">Teams</h2>
            <p
              className={`text-xs mb-4 ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Manage sales teams
            </p>

            {/* Mobile Search */}
            <div className="mb-4">
              <div
                className={`relative flex items-center rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-300"
                }`}
              >
                <Search className="absolute left-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search....."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`pl-10 w-full text-sm ${
                    resolvedTheme === "dark"
                      ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                      : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Create Team Button */}
            <button
              onClick={() => {
                console.log("DEBUG Teams: Opening create modal (mobile)");
                setIsCreateModalOpen(true);
              }}
              className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 mb-6 ${
                resolvedTheme === "dark"
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              } transition-colors font-semibold text-sm`}
            >
              <Users className="h-5 w-5" />
              <span>Create Team</span>
            </button>

            {/* Mobile Cards */}
            <div className="space-y-3">
              {loading && teams.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Loading teams...
                </div>
              ) : filteredTeams.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No teams found
                </div>
              ) : (
                paginatedTeams.map((team) => (
                  <div
                    key={team.id}
                    className={`p-4 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-900 border-gray-700"
                        : "bg-white border-gray-200"
                    } transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p
                          className={`text-xs font-semibold mb-2 ${
                            resolvedTheme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          ID {team.id}
                        </p>
                        <p className="font-semibold text-sm mb-1">
                          {team.name}
                        </p>
                        <p className="text-xs mb-1">
                          <span className="font-medium">Approver:</span>{" "}
                          {team.approver_details?.full_name || "No Approver"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500 text-white text-center">
                          {team.member_count} {team.member_count === 1 ? "member" : "members"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        Created: {new Date(team.created_at).toLocaleDateString()}
                      </div>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === team.id ? null : team.id
                            )
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            resolvedTheme === "dark"
                              ? "bg-gray-800 hover:bg-gray-700 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                          } transition-colors`}
                          disabled={loading}
                        >
                          Actions
                        </button>

                        {openMenuId === team.id && (
                          <div
                            className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-10 ${
                              resolvedTheme === "dark"
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleViewTeam(team.id);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                  resolvedTheme === "dark"
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleEditClick(team);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                  resolvedTheme === "dark"
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit Team
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleDeleteClick(team);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-500 ${
                                  resolvedTheme === "dark"
                                    ? "hover:bg-gray-700"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Team
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-xs font-medium">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, safePage + 1))
                }
                disabled={safePage === totalPages}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animation-fade-in ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex-1">{toast.message}</div>
          <button
            onClick={() => setToast(null)}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          console.log("DEBUG Teams: Closing create modal");
          setIsCreateModalOpen(false);
          setNewTeam({ name: "", approver: null });
          setCreateError("");
        }}
        newTeam={newTeam}
        setNewTeam={setNewTeam}
        approvers={approvers}
        teams={teams}
        loading={createLoading}
        error={createError}
        setError={setCreateError}
        onSubmit={handleCreateTeam}
      />

      <ViewTeamModal
        isOpen={isViewModalOpen}
        onClose={() => {
          console.log("DEBUG Teams: Closing view modal");
          setIsViewModalOpen(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        onRefresh={fetchTeams}
      />

      <EditTeamModal
        isOpen={isEditModalOpen}
        onClose={() => {
          console.log("DEBUG Teams: Closing edit modal");
          setIsEditModalOpen(false);
          setTeamToEdit(null);
          setEditTeam({ name: "", approver: null });
          setEditError("");
        }}
        team={teamToEdit}
        editTeam={editTeam}
        setEditTeam={setEditTeam}
        approvers={approvers}
        teams={teams}
        loading={editLoading}
        error={editError}
        setError={setEditError}
        onSubmit={handleEditTeam}
        onRefresh={fetchTeams}
      />

      <DeleteTeamModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          console.log("DEBUG Teams: Closing delete modal");
          setIsDeleteModalOpen(false);
          setTeamToDelete(null);
        }}
        team={teamToDelete}
        loading={deleteLoading}
        onConfirm={handleDeleteTeam}
      />
    </div>
  );
}

export default Teams;
