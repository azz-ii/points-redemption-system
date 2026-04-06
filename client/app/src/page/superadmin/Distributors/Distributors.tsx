import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";
import { useDistributorsPage } from "@/hooks/queries/useDistributors";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

import { distributorsApi, type Distributor, type ChunkedUpdateProgress } from "@/lib/distributors-api";
import { API_URL } from "@/lib/config";
import {
  CreateDistributorModal,
  EditDistributorModal,
  ViewDistributorModal,
  ArchiveDistributorModal,
  UnarchiveDistributorModal,
  BulkArchiveDistributorModal,
  ExportModal,
  SetPointsModal,
  SalesVolumeAllocationModal,
} from "./modals";
import { DistributorsTable, DistributorsMobileCards } from "./components";
import { PointsHistoryModal } from "@/components/modals/PointsHistoryModal";

function Distributors() {
  const currentPage = "distributors";
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Server-side pagination state
  const [tablePage, setTablePage] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  const { data: distributorsData, isLoading: loading, isFetching: refreshing, error: queryError, refetch } = useDistributorsPage(
    tablePage + 1, pageSize, searchQuery, showArchived, 10000,
  );
  const distributors = distributorsData?.results ?? [];
  const totalCount = distributorsData?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const error = queryError ? "Failed to load distributors. Please try again." : null;

  const [mutationLoading, setMutationLoading] = useState(false);

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.distributors.all });
  }, [queryClient]);

  // Reset to first page when showArchived changes
  useEffect(() => {
    setTablePage(0);
  }, [showArchived]);

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

  const handleToggleArchived = useCallback((checked: boolean) => {
    setShowArchived(checked);
    setTablePage(0);
  }, []);

  // Modal and form state for creating new distributor
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newDistributor, setNewDistributor] = useState({
    name: "",
    brand: "",
    sales_channel: "",
  });

  const [editDistributor, setEditDistributor] = useState({
    name: "",
    brand: "",
    sales_channel: "",
  });

  // Modal state for edit/view/delete
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showBulkArchiveModal, setShowBulkArchiveModal] = useState(false);
  const [editingDistributorId, setEditingDistributorId] = useState<
    number | null
  >(null);
  const [viewTarget, setViewTarget] = useState<Distributor | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Distributor | null>(null);
  const [unarchiveTarget, setUnarchiveTarget] = useState<Distributor | null>(null);
  const [bulkArchiveTargets, setBulkArchiveTargets] = useState<Distributor[]>([]);
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSetPointsModal, setShowSetPointsModal] = useState(false);
  const [showPointsHistory, setShowPointsHistory] = useState(false);
  const [pointsHistoryTarget, setPointsHistoryTarget] = useState<Distributor | null>(null);
  const [settingPoints, setSettingPoints] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<ChunkedUpdateProgress | null>(null);
  const [showSalesVolumeModal, setShowSalesVolumeModal] = useState(false);
  const [allocatingVolume, setAllocatingVolume] = useState(false);

  // Handle create distributor submission
  const handleCreateDistributor = async () => {
    setCreateError(null);

    // Validation
    if (!newDistributor.name.trim()) {
      setCreateError("Name is required");
      return;
    }
    if (!newDistributor.brand.trim()) {
      setCreateError("Brand is required");
      return;
    }
    if (!newDistributor.sales_channel.trim()) {
      setCreateError("Sales Channel is required");
      return;
    }

    try {
      setCreating(true);
      const createdDistributor =
        await distributorsApi.createDistributor(newDistributor);
      queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all });
      setNewDistributor({
        name: "",
        brand: "",
        sales_channel: "",
      });
      setShowCreateModal(false);
      setCreateError(null);
    } catch (err) {
      console.error("Error creating distributor:", err);
      setCreateError("Failed to create distributor. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // Handle edit click
  const handleEditClick = (distributor: Distributor) => {
    setEditingDistributorId(distributor.id);
    setEditDistributor({
      name: distributor.name,
      brand: distributor.brand ?? "",
      sales_channel: distributor.sales_channel ?? "",
    });
    setShowEditModal(true);
    setEditError(null);
  };

  // Handle update distributor
  const handleUpdateDistributor = async () => {
    if (!editingDistributorId) return;

    setEditError(null);

    // Validation
    if (!editDistributor.name.trim()) {
      setEditError("Name is required");
      return;
    }
    if (!editDistributor.brand.trim()) {
      setEditError("Brand is required");
      return;
    }
    if (!editDistributor.sales_channel.trim()) {
      setEditError("Sales Channel is required");
      return;
    }

    try {
      setUpdating(true);
      const updatedDistributor = await distributorsApi.updateDistributor(
        editingDistributorId,
        editDistributor,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all });
      setShowEditModal(false);
      setEditingDistributorId(null);
      setEditError(null);
    } catch (err) {
      console.error("Error updating distributor:", err);
      setEditError("Failed to update distributor. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle view click
  const handleViewClick = (distributor: Distributor) => {
    setViewTarget(distributor);
    setShowViewModal(true);
  };

  // Handle archive click
  const handleArchiveClick = (distributor: Distributor) => {
    setArchiveTarget(distributor);
    setShowArchiveModal(true);
  };

  // Handle unarchive click
  const handleUnarchiveClick = (distributor: Distributor) => {
    setUnarchiveTarget(distributor);
    setShowUnarchiveModal(true);
  };

  // Confirm archive distributor
  const confirmArchive = async (id: number) => {
    try {
      setMutationLoading(true);
      await distributorsApi.deleteDistributor(id);
      setShowArchiveModal(false);
      setArchiveTarget(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all });
    } catch (err) {
      console.error("Error archiving distributor:", err);
      toast.error("Failed to archive distributor. Please try again.");
    } finally {
      setMutationLoading(false);
    }
  };

  // Confirm unarchive distributor
  const confirmUnarchive = async (id: number) => {
    try {
      setMutationLoading(true);
      const response = await fetch(`${API_URL}/distributors/${id}/unarchive/`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unarchive distributor');
      }
      
      setShowUnarchiveModal(false);
      setUnarchiveTarget(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all });
    } catch (err) {
      console.error("Error unarchiving distributor:", err);
      toast.error(err instanceof Error ? err.message : "Failed to unarchive distributor. Please try again.");
    } finally {
      setMutationLoading(false);
    }
  };

  // Handle bulk archive
  const handleArchiveSelected = async (selectedDistributors: Distributor[]) => {
    setBulkArchiveTargets(selectedDistributors);
    setShowBulkArchiveModal(true);
  };

  // Confirm bulk archive
  const confirmBulkArchive = async () => {
    try {
      setMutationLoading(true);
      const archiveResults = await Promise.allSettled(
        bulkArchiveTargets.map((distributor) =>
          distributorsApi.deleteDistributor(distributor.id)
        )
      );

      const successCount = archiveResults.filter((r) => r.status === "fulfilled").length;
      const failCount = archiveResults.filter((r) => r.status === "rejected").length;

      setShowBulkArchiveModal(false);
      setBulkArchiveTargets([]);

      if (failCount === 0) {
        toast.success(`Successfully archived ${successCount} distributor(s)`);
      } else {
        toast.warning(`Archived ${successCount} of ${bulkArchiveTargets.length} distributor(s). ${failCount} failed.`);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all });
    } catch (err) {
      console.error("Error archiving distributors:", err);
      toast.error("Error archiving some distributors");
    } finally {
      setMutationLoading(false);
    }
  };

  // Handle set points submission - batch updates with chunking for large datasets
  const handleSetPoints = async (updates: { id: number; points: number }[], reason: string = '') => {
    try {
      setSettingPoints(true);
      setUpdateProgress(null);

      // Use chunked API for large batches (>100 records), regular API for small batches
      if (updates.length > 100) {
        const result = await distributorsApi.batchUpdatePointsChunked(
          updates,
          (progress) => {
            setUpdateProgress(progress);
          },
          150, // Chunk size
          reason
        );

        setShowSetPointsModal(false);
        setUpdateProgress(null);

        if (result.success) {
          toast.success(
            `Successfully updated points for ${result.totalUpdated} distributor(s)`,
          );
        } else if (result.partialSuccess) {
          toast.warning(
            `Updated ${result.totalUpdated} of ${updates.length} distributor(s). ${result.totalFailed} failed.`,
          );
        } else {
          toast.error(
            `Failed to update points. ${result.totalFailed} distributor(s) failed.`,
          );
        }
      } else {
        // Use regular batch API for smaller updates
        const result = await distributorsApi.batchUpdatePoints(updates, reason);

        setShowSetPointsModal(false);

        if (result.failed_count === 0) {
          toast.success(
            `Successfully updated points for ${result.updated_count} distributor(s)`,
          );
        } else {
          toast.warning(
            `Updated ${result.updated_count} of ${updates.length} distributor(s). ${result.failed_count} failed.`,
          );
        }
      }

      // Refresh distributors list
      queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all });
    } catch (err) {
      console.error("Error updating points:", err);
      toast.error("Error updating points");
    } finally {
      setSettingPoints(false);
      setUpdateProgress(null);
    }
  };

  // Handle bulk set points (add/subtract to all distributors)
  const handleBulkSetPoints = async (pointsDelta: number, password: string) => {
    console.log("[DEBUG] handleBulkSetPoints called with delta:", pointsDelta);
    try {
      setSettingPoints(true);

      console.log(
        "[DEBUG] Sending POST to /api/distributors/bulk_update_points/",
      );
      const response = await fetch(
        `${API_URL}/distributors/bulk_update_points/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            points_delta: pointsDelta,
            password: password,
          }),
        },
      );

      console.log("[DEBUG] Response received:", response.status);
      const data = await response.json();
      console.log("[DEBUG] Response data:", data);

      if (!response.ok) {
        toast.error(data.error || "Failed to update points");
        return;
      }

      setShowSetPointsModal(false);
      toast.success(
        `Successfully updated points for ${data.updated_count} distributor(s)`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all });
    } catch (err) {
      console.error("[DEBUG] Error bulk updating points:", err);
      toast.error("Error updating points. Please try again.");
    } finally {
      setSettingPoints(false);
    }
  };

  // Handle reset all points to zero
  const handleResetAllPoints = async (password: string) => {
    console.log("[DEBUG] handleResetAllPoints called");
    try {
      setSettingPoints(true);

      console.log(
        "[DEBUG] Sending POST for reset to /api/distributors/bulk_update_points/",
      );
      const response = await fetch(
        `${API_URL}/distributors/bulk_update_points/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            reset_to_zero: true,
            password: password,
          }),
        },
      );

      console.log("[DEBUG] Reset response received:", response.status);
      const data = await response.json();
      console.log("[DEBUG] Reset response data:", data);

      if (!response.ok) {
        toast.error(data.error || "Failed to reset points");
        return;
      }

      setShowSetPointsModal(false);
      toast.success(
        `Successfully reset points for ${data.updated_count} distributor(s)`,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all });
    } catch (err) {
      console.error("[DEBUG] Error resetting points:", err);
      toast.error("Error resetting points. Please try again.");
    } finally {
      setSettingPoints(false);
    }
  };

  // Handle sales volume allocation
  const handleSalesVolumeAllocate = async (
    allocations: { id: number; sales_volume: number }[],
    reason: string = ''
  ) => {
    try {
      setAllocatingVolume(true);
      const result = await distributorsApi.allocateSalesVolume(allocations, reason);

      setShowSalesVolumeModal(false);

      if (result.failed_count === 0) {
        toast.success(`Successfully allocated points for ${result.updated_count} distributor(s)`);
      } else {
        toast.warning(
          `Allocated points for ${result.updated_count} distributor(s). ${result.failed_count} failed.`
        );
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.distributors.all });
    } catch (err) {
      console.error("Error allocating sales volume points:", err);
      toast.error(err instanceof Error ? err.message : "Error allocating points. Please try again.");
    } finally {
      setAllocatingVolume(false);
    }
  };

  return (
    <>


        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:h-full md:overflow-hidden md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold">Distributors</h1>
              <p className="text-sm text-muted-foreground">
                View and manage distributor information.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => handleToggleArchived(e.target.checked)}
                  className="rounded border-border"
                />
                Show Archived
              </label>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <DistributorsTable
              distributors={distributors}
            loading={loading}
            error={error}
            onRetry={() => refetch()}
            onView={handleViewClick}
            onEdit={handleEditClick}
            onArchive={handleArchiveClick}
            onUnarchive={handleUnarchiveClick}
            onArchiveSelected={handleArchiveSelected}
            onCreateNew={() => setShowCreateModal(true)}
            onRefresh={handleManualRefresh}
            refreshing={refreshing}
            onExport={() => setShowExportModal(true)}
            onAllocateSalesVolume={() => setShowSalesVolumeModal(true)}
            onViewPointsHistory={(distributor) => {
              setPointsHistoryTarget(distributor);
              setShowPointsHistory(true);
            }}
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
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24">
          <h2 className="text-xl font-semibold mb-2">Distributors</h2>
          <p
            className="text-xs mb-4 text-muted-foreground"
          >
            Manage distributors
          </p>

          {/* Mobile Search */}
          <div className="mb-4">
            <div
              className="relative flex items-center rounded-lg border bg-card border-border"
            >
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search....."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setTablePage(0);
                }}
                className="pl-10 w-full text-sm bg-transparent border-0 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 border text-sm font-semibold transition-colors bg-card text-foreground border-border hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              Add Distributor
            </button>
          </div>

          {/* Mobile Cards */}
          <DistributorsMobileCards
            distributors={distributors}
            paginatedDistributors={distributors}
            filteredDistributors={distributors}
            loading={loading}
            error={error}
            onRetry={() => refetch()}
            page={tablePage + 1}
            totalPages={pageCount}
            onPageChange={(p) => setTablePage(p - 1)}
            onView={handleViewClick}
            onEdit={handleEditClick}
            onArchive={handleArchiveClick}
            onUnarchive={handleUnarchiveClick}
          />
        </div>
      {/* Create Distributor Modal */}
      <CreateDistributorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newDistributor={newDistributor}
        setNewDistributor={setNewDistributor}
        creating={creating}
        error={createError}
        onSubmit={handleCreateDistributor}
      />

      {/* Edit Distributor Modal */}
      <EditDistributorModal
        isOpen={showEditModal && editingDistributorId !== null}
        onClose={() => setShowEditModal(false)}
        editDistributor={editDistributor}
        setEditDistributor={setEditDistributor}
        updating={updating}
        error={editError}
        onSubmit={handleUpdateDistributor}
      />

      {/* View Distributor Modal */}
      <ViewDistributorModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        distributor={viewTarget}
      />

      {/* Archive Confirmation Modal */}
      <ArchiveDistributorModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        distributor={archiveTarget}
        loading={loading}
        onConfirm={confirmArchive}
      />

      {/* Unarchive Confirmation Modal */}
      <UnarchiveDistributorModal
        isOpen={showUnarchiveModal}
        onClose={() => setShowUnarchiveModal(false)}
        distributor={unarchiveTarget}
        loading={loading}
        onConfirm={confirmUnarchive}
      />

      {/* Bulk Archive Confirmation Modal */}
      <BulkArchiveDistributorModal
        isOpen={showBulkArchiveModal}
        onClose={() => setShowBulkArchiveModal(false)}
        distributors={bulkArchiveTargets}
        loading={loading}
        onConfirm={confirmBulkArchive}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        searchQuery={searchQuery}
        showArchived={showArchived}
      />

      {/* Set Points Modal */}
      <SetPointsModal
        isOpen={showSetPointsModal}
        onClose={() => setShowSetPointsModal(false)}
        onFetchPage={distributorsApi.getDistributorsPage}
        loading={settingPoints}
        onSubmit={handleSetPoints}
        onBulkSubmit={handleBulkSetPoints}
        onResetAll={handleResetAllPoints}
        progress={updateProgress}
      />

      {/* Sales Volume Allocation Modal */}
      <SalesVolumeAllocationModal
        isOpen={showSalesVolumeModal}
        onClose={() => setShowSalesVolumeModal(false)}
        onFetchPage={distributorsApi.getDistributorsPage}
        loading={allocatingVolume}
        onSubmit={handleSalesVolumeAllocate}
      />

      {pointsHistoryTarget && (
        <PointsHistoryModal
          isOpen={showPointsHistory}
          onClose={() => {
            setShowPointsHistory(false);
            setPointsHistoryTarget(null);
          }}
          entityType="DISTRIBUTOR"
          entityId={pointsHistoryTarget.id}
          entityName={pointsHistoryTarget.name}
        />
      )}
    </>
  );
}

export default Distributors;
