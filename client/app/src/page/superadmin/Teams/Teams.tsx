import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  Search,
  Sliders,
  UserPlus,
  LogOut,
  Pencil,
  Warehouse,
  Trash2,
  X,
  Eye,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Users,
} from "lucide-react";

interface Team {
  id: number;
  name: string;
  approver_id: number | null;
  approver_details?: {
    id: number;
    username: string;
    full_name: string;
    email: string;
    position: string;
  };
  region: string;
  member_count?: number;
  distributor_count?: number;
  created_at: string;
  updated_at: string;
}

interface TeamsProps {
  onNavigate?: (
    page:
      | "dashboard"
      | "history"
      | "accounts"
      | "catalogue"
      | "redemption"
      | "inventory"
      | "distributors"
      | "teams"
  ) => void;
  onLogout?: () => void;
}

function Teams({ onNavigate, onLogout }: TeamsProps) {
  const { resolvedTheme } = useTheme();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch teams on component mount
  const fetchTeams = async () => {
    try {
      setLoading(true);
      console.log("Fetching teams from API...");
      const response = await fetch("http://127.0.0.1:8000/api/teams/", {
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
        setError("Failed to load teams");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Error connecting to server");
      console.error("Error fetching teams:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load teams on mount
  useEffect(() => {
    fetchTeams();
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
      team.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar
        currentPage="teams"
        onNavigate={onNavigate || (() => {})}
        onLogout={onLogout || (() => {})}
      />

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
              onClick={() => onNavigate?.("inventory")}
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
              onClick={onLogout}
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

          {/* Search and Actions */}
          <div className="flex justify-between items-center mb-6">
            <div
              className={`relative flex items-center ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <Search className="absolute left-3 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search by Team Name, Approver, Region......"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 w-80 ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchTeams()}
                title={loading ? "Refreshing..." : "Refresh"}
                disabled={loading}
                className={`p-2 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "border-gray-700 hover:bg-gray-900"
                    : "border-gray-300 hover:bg-gray-100"
                } transition-colors disabled:opacity-50`}
              >
                <RotateCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
              <button
                className={`p-2 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "border-gray-700 hover:bg-gray-900"
                    : "border-gray-300 hover:bg-gray-100"
                } transition-colors`}
              >
                <Sliders className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  // TODO: Open create team modal
                  setToast({
                    message: "Create Team functionality coming soon!",
                    type: "success",
                  });
                }}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  resolvedTheme === "dark"
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-gray-900 text-white hover:bg-gray-700"
                } transition-colors font-semibold`}
              >
                <Users className="h-5 w-5" />
                <span>Create Team</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div
            className={`border rounded-lg overflow-hidden ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            } transition-colors`}
          >
            <table className="w-full">
              <thead
                className={`${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Team Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Approver
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Region
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Members
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Distributors
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading && teams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading teams...
                    </td>
                  </tr>
                ) : filteredTeams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No teams found
                    </td>
                  </tr>
                ) : (
                  paginatedTeams.map((team) => (
                    <tr
                      key={team.id}
                      className={`hover:${
                        resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                      } transition-colors`}
                    >
                      <td className="px-6 py-4 text-sm">
                        {team.id ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {team.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {team.approver_details ? (
                          <div>
                            <div className="font-medium">
                              {team.approver_details.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {team.approver_details.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No Approver</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {team.region || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                          {team.member_count || 0} {team.member_count === 1 ? "member" : "members"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                          {team.distributor_count ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Date(team.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              // TODO: Open view modal
                              setToast({
                                message: `View Team: ${team.name}`,
                                type: "success",
                              });
                            }}
                            className="px-4 py-2 rounded flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                            title="View"
                            disabled={loading}
                          >
                            <Eye className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => {
                              // TODO: Open edit modal
                              setToast({
                                message: `Edit Team: ${team.name}`,
                                type: "success",
                              });
                            }}
                            className="px-4 py-2 rounded flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors"
                            title="Edit"
                            disabled={loading}
                          >
                            <Pencil className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => {
                              // TODO: Open delete modal
                              setToast({
                                message: `Delete Team: ${team.name}`,
                                type: "error",
                              });
                            }}
                            className="px-4 py-2 rounded flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                            title="Delete"
                            disabled={loading}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm font-medium">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, safePage + 1))
                }
                disabled={safePage === totalPages}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
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
                // TODO: Open create team modal
                setToast({
                  message: "Create Team functionality coming soon!",
                  type: "success",
                });
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
                        <p
                          className={`text-xs ${
                            resolvedTheme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          <span className="font-medium">Region:</span> {team.region}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500 text-white text-center">
                          {team.member_count} {team.member_count === 1 ? "member" : "members"}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white text-center">
                          {team.distributor_count ?? 0} dist.
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
                                  // TODO: Open view modal
                                  setToast({
                                    message: `View Team: ${team.name}`,
                                    type: "success",
                                  });
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
                                  // TODO: Open edit modal
                                  setToast({
                                    message: `Edit Team: ${team.name}`,
                                    type: "success",
                                  });
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
                                  // TODO: Open delete modal
                                  setToast({
                                    message: `Delete Team: ${team.name}`,
                                    type: "error",
                                  });
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
      <MobileBottomNav
        currentPage="teams"
        onNavigate={onNavigate || (() => {})}
      />

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
    </div>
  );
}

export default Teams;
