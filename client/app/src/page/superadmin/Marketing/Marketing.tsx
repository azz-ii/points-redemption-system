import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/config";
import { X, RotateCw, Download } from "lucide-react";
import {
  ViewAccountModal,
  EditAccountModal,
  ExportModal,
  type Account,
} from "./modals";
import {
  MarketingUsersTable,
  MarketingUsersMobileCards,
  type MarketingUser,
  type LegendAssignment,
} from "./components";
function Marketing() {
  const [marketingUsers, setMarketingUsers] = useState<MarketingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<Account | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch accounts and assignments
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch users and assignments in parallel
      const [usersResponse, assignmentsResponse] = await Promise.all([
        fetch(`${API_URL}/users/`, {
          credentials: 'include',
        }),
        fetch(`${API_URL}/catalogue/bulk-assign-marketing/`, {
          credentials: 'include',
        }),
      ]);

      const usersData = await usersResponse.json();
      const assignmentsData = await assignmentsResponse.json();

      if (usersResponse.ok) {
        const accounts = (usersData.results || []).filter(
          (account: Account) =>
            account.position === "Marketing" || account.position === "Admin",
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
        const usersWithAssignments: MarketingUser[] = accounts.map(
          (account: Account) => ({
            ...account,
            assigned_legends: assignmentsByUser[account.id] || [],
          }),
        );

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
    toast.success("Item legend assignment updated successfully!");
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
      user.id.toString().includes(searchQuery),
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage),
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Marketing Users</h1>
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
              className="p-2 rounded-lg bg-card text-foreground hover:bg-accent disabled:opacity-50"
            >
              <RotateCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
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
        }}
        account={editingAccount}
        onSuccess={handleEditSuccess}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        users={marketingUsers}
      />
    </>
  );
}

export default Marketing;
