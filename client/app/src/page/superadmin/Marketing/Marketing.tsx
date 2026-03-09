import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { X, RotateCw, Download } from "lucide-react";
import { useMarketingUsersPage } from "@/hooks/queries/useMarketingUsers";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
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
} from "./components";
function Marketing() {
  const queryClient = useQueryClient();

  // Server-side pagination state
  const [tablePage, setTablePage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(15);

  const { data: marketingData, isLoading: loading, isFetching: refreshing, error: queryError, refetch } = useMarketingUsersPage(
    tablePage + 1, pageSize, searchQuery, 10000,
  );
  const marketingUsers = marketingData?.results ?? [];
  const totalCount = marketingData?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const error = queryError ? "Error connecting to server" : "";

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<Account | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.marketing.all });
  }, [queryClient]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setTablePage(0);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setTablePage(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setTablePage(0);
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
    queryClient.invalidateQueries({ queryKey: queryKeys.marketing.all });
  };

  return (
    <>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:h-full md:overflow-hidden md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Marketing Users</h1>
          </div>

          <div className="flex-1 min-h-0">
            <MarketingUsersTable
              users={marketingUsers}
            loading={loading}
            error={error}
            onRetry={() => refetch()}
            onViewAccount={handleViewClick}
            onEditAccount={handleEditClick}
            onRefresh={handleManualRefresh}
            refreshing={refreshing}
            onExport={() => setShowExportModal(true)}
            manualPagination
            pageCount={pageCount}
            totalResults={totalCount}
            currentPage={tablePage}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            pageSize={pageSize}
            pageSizeOptions={[15, 50, 100]}
            onPageSizeChange={handlePageSizeChange}
            fillHeight
          />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col flex-1 p-4 mb-16">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Marketing Users</h1>
            <button
              onClick={() => refetch()}
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
            onRetry={() => refetch()}
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
        searchQuery={searchQuery}
      />
    </>
  );
}

export default Marketing;
