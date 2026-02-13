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
  const [error, setError] = useState("");

  // Server-side pagination state
  const [tablePage, setTablePage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const PAGE_SIZE = 15;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<Account | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch accounts and assignments
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch one page of Marketing/Admin users using server-side position filter
      const url = new URL(`${API_URL}/users/`, window.location.origin);
      url.searchParams.append('page', String(tablePage + 1));
      url.searchParams.append('page_size', String(PAGE_SIZE));
      url.searchParams.append('position', 'Marketing,Admin');
      if (searchQuery) {
        url.searchParams.append('search', searchQuery);
      }

      const [usersResponse, assignmentsResponse] = await Promise.all([
        fetch(url.toString(), { credentials: 'include' }),
        fetch(`${API_URL}/catalogue/bulk-assign-marketing/`, { credentials: 'include' }),
      ]);

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }

      const usersData = await usersResponse.json();
      const accounts: Account[] = usersData.results || [];
      setTotalCount(usersData.count || 0);

      const assignmentsData = await assignmentsResponse.json();

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
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching marketing users:", err);
    } finally {
      setLoading(false);
    }
  }, [tablePage, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setTablePage(0);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setTablePage(page);
  }, []);

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

  return (
    <>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Marketing Users</h1>
          </div>

          <MarketingUsersTable
            users={marketingUsers}
            loading={loading}
            error={error}
            onRetry={fetchData}
            onViewAccount={handleViewClick}
            onEditAccount={handleEditClick}
            onRefresh={fetchData}
            refreshing={loading}
            onExport={() => setShowExportModal(true)}
            manualPagination
            pageCount={pageCount}
            totalResults={totalCount}
            currentPage={tablePage}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
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

          <Input
            type="text"
            placeholder="Search marketing users..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setTablePage(0);
            }}
            className="mb-4"
          />

          <MarketingUsersMobileCards
            paginatedUsers={marketingUsers}
            loading={loading}
            error={error}
            onRetry={fetchData}
            currentPage={tablePage + 1}
            totalPages={pageCount}
            onPageChange={(p) => setTablePage(p - 1)}
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
