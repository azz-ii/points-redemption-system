import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { API_URL } from "@/lib/config";
import {
  Bell,
  LogOut,
  X,
  RotateCw,
  Download,
} from "lucide-react";
import {
  ViewAccountModal,
  EditAccountModal,
  ExportModal,
  type Account,
} from "./modals";
import { MarketingUsersTable, MarketingUsersMobileCards, type MarketingUser, type LegendAssignment } from "./components";

function Marketing() {
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const [marketingUsers, setMarketingUsers] = useState<MarketingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<Account | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch accounts and assignments
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch users and assignments in parallel
      const [usersResponse, assignmentsResponse] = await Promise.all([
        fetch(`${API_URL}/users/`),
        fetch(`${API_URL}/catalogue/bulk-assign-marketing/`)
      ]);
      
      const usersData = await usersResponse.json();
      const assignmentsData = await assignmentsResponse.json();

      if (usersResponse.ok) {
        const accounts = (usersData.accounts || []).filter(
          (account: Account) => account.position === "Marketing" || account.position === "Admin"
        );
        
        // Build assignments map by user ID
        const assignmentsByUser: Record<number, LegendAssignment[]> = {};
        if (assignmentsResponse.ok && assignmentsData.assignments) {
          for (const assignment of assignmentsData.assignments) {
            if (assignment.mktg_admin_id) {
              if (!assignmentsByUser[assignment.mktg_admin_id]) {
                assignmentsByUser[assignment.mktg_admin_id] = [];
              }
              assignmentsByUser[assignment.mktg_admin_id].push({
                legend: assignment.legend,
                item_count: assignment.item_count,
              });
            }
          }
        }
        
        // Merge users with their assignments
        const usersWithAssignments: MarketingUser[] = accounts.map((account: Account) => ({
          ...account,
          assigned_legends: assignmentsByUser[account.id] || [],
        }));
        
        setMarketingUsers(usersWithAssignments);
      } else {
        setError("Failed to load marketing users");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching marketing users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleEditClick = (user: MarketingUser) => {
    // Convert MarketingUser to Account for the modal
    setEditingAccount({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      position: user.position,
      points: user.points,
      is_activated: user.is_activated,
      is_banned: user.is_banned,
    });
    setShowEditModal(true);
  };

  const handleViewClick = (user: MarketingUser) => {
    setViewTarget({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      position: user.position,
      points: user.points,
      is_activated: user.is_activated,
      is_banned: user.is_banned,
    });
    setShowViewModal(true);
  };

  const handleEditSuccess = () => {
    setToast({
      message: "Item legend assignment updated successfully!",
      type: "success",
    });
    fetchData();
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  const filteredUsers = marketingUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toString().includes(searchQuery)
  );
  
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div
      className={`flex flex-col h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Header */}
        <div
          className={`md:hidden sticky top-0 z-40 p-4 ${
            resolvedTheme === "dark"
              ? "bg-gray-900 border-b border-gray-700"
              : "bg-white border-b border-gray-100"
          } flex items-center justify-between`}
        >
          <img
            src="/src/assets/oracle-logo-mb.png"
            alt="Oracle Petroleum"
            className="w-8 h-auto object-contain"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="currentColor" font-size="10" font-family="sans-serif">ORACLE</text></svg>';
            }}
          />
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsNotificationOpen(true)}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-100"
              }`}
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "hover:bg-gray-800"
                  : "hover:bg-gray-100"
              }`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Marketing Users</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setIsNotificationOpen(true)}
                className={`p-2 rounded-lg ${
                  resolvedTheme === "dark"
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-100"
                }`}
              >
                <Bell className="h-5 w-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center justify-between">
              <p className="text-red-500">{error}</p>
              <button onClick={() => setError("")}>
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          )}

          <MarketingUsersTable
            users={marketingUsers}
            loading={loading}
            onViewAccount={handleViewClick}
            onEditAccount={handleEditClick}
            onRefresh={fetchData}
            refreshing={loading}
            onExport={() => setShowExportModal(true)}
          />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col flex-1 p-4 mb-16">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Marketing Users</h1>
            <button
              onClick={fetchData}
              disabled={loading}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              } disabled:opacity-50`}
            >
              <RotateCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center justify-between">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={() => setError("")}>
                <X className="h-4 w-4 text-red-500" />
              </button>
            </div>
          )}

          <Input
            type="text"
            placeholder="Search marketing users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="mb-4"
          />

          <MarketingUsersMobileCards
            paginatedUsers={paginatedUsers}
            loading={loading}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onViewAccount={handleViewClick}
            onEditAccount={handleEditClick}
          />
        </div>
      </div>

      <MobileBottomNav />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Modals */}
      <ViewAccountModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewTarget(null);
        }}
        account={viewTarget}
      />

      <EditAccountModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAccount(null);
        }}        account={editingAccount}
        onSuccess={handleEditSuccess}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        users={marketingUsers}
      />
    </div>
  );
}

export default Marketing;
