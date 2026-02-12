import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/config";
import { Search, Plus } from "lucide-react";

import { distributorsApi, type Distributor, type ChunkedUpdateProgress } from "@/lib/distributors-api";
import {
  CreateDistributorModal,
  EditDistributorModal,
  ViewDistributorModal,
  ArchiveDistributorModal,
  UnarchiveDistributorModal,
  BulkArchiveDistributorModal,
  ExportModal,
  SetPointsModal,
} from "./modals";
import { DistributorsTable, DistributorsMobileCards } from "./components";
import { PointsHistoryModal } from "@/components/modals/PointsHistoryModal";

function Distributors() {
  const currentPage = "distributors";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distributors, setDistributors] = useState<Distributor[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Pagination state for mobile only
  const [page, setPage] = useState(1);

  const fetchDistributors = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_URL}/distributors/`, window.location.origin);
      if (showArchived) {
        url.searchParams.append('show_archived', 'true');
      }
      if (searchQuery) {
        url.searchParams.append('search', searchQuery);
      }
      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      const result = await response.json();
      const data = result.results || result;
      // Ensure data is always an array
      setDistributors(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching distributors:", err);
      setError("Failed to load distributors. Please try again.");
      setDistributors([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showArchived]);

  // Fetch distributors on mount
  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  // Filter and paginate for mobile view
  const filteredDistributors = distributors.filter((distributor) => {
    const query = searchQuery.toLowerCase();
    return (
      distributor.name.toLowerCase().includes(query) ||
      (distributor.contact_email?.toLowerCase().includes(query) ?? false) ||
      (distributor.location?.toLowerCase().includes(query) ?? false) ||
      (distributor.region?.toLowerCase().includes(query) ?? false)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredDistributors.length / 15));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * 15;
  const endIndex = startIndex + 15;
  const paginatedDistributors = filteredDistributors.slice(
    startIndex,
    endIndex,
  );

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
    fetchDistributors();
  }, [searchQuery, fetchDistributors]);

  // Modal and form state for creating new distributor
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newDistributor, setNewDistributor] = useState({
    name: "",
    contact_email: "",
    phone: "",
    location: "",
    region: "",
  });

  const [editDistributor, setEditDistributor] = useState({
    name: "",
    contact_email: "",
    phone: "",
    location: "",
    region: "",
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

  // Handle create distributor submission
  const handleCreateDistributor = async () => {
    setCreateError(null);

    // Validation
    if (!newDistributor.name.trim()) {
      setCreateError("Name is required");
      return;
    }
    if (!newDistributor.contact_email.trim()) {
      setCreateError("Contact email is required");
      return;
    }
    if (!newDistributor.phone.trim()) {
      setCreateError("Phone is required");
      return;
    }
    if (!newDistributor.location.trim()) {
      setCreateError("Location is required");
      return;
    }
    if (!newDistributor.region.trim()) {
      setCreateError("Region is required");
      return;
    }

    try {
      setCreating(true);
      const createdDistributor =
        await distributorsApi.createDistributor(newDistributor);
      setDistributors((prev) => [...prev, createdDistributor]);
      setNewDistributor({
        name: "",
        contact_email: "",
        phone: "",
        location: "",
        region: "",
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
      contact_email: distributor.contact_email ?? "",
      phone: distributor.phone ?? "",
      location: distributor.location ?? "",
      region: distributor.region ?? "",
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
    if (!editDistributor.contact_email.trim()) {
      setEditError("Contact email is required");
      return;
    }
    if (!editDistributor.phone.trim()) {
      setEditError("Phone is required");
      return;
    }
    if (!editDistributor.location.trim()) {
      setEditError("Location is required");
      return;
    }
    if (!editDistributor.region.trim()) {
      setEditError("Region is required");
      return;
    }

    try {
      setUpdating(true);
      const updatedDistributor = await distributorsApi.updateDistributor(
        editingDistributorId,
        editDistributor,
      );
      setDistributors((prev) =>
        prev.map((d) =>
          d.id === editingDistributorId ? updatedDistributor : d,
        ),
      );
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
      setLoading(true);
      await distributorsApi.deleteDistributor(id);
      setShowArchiveModal(false);
      setArchiveTarget(null);
      fetchDistributors();
    } catch (err) {
      console.error("Error archiving distributor:", err);
      alert("Failed to archive distributor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Confirm unarchive distributor
  const confirmUnarchive = async (id: number) => {
    try {
      setLoading(true);
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
      fetchDistributors();
    } catch (err) {
      console.error("Error unarchiving distributor:", err);
      alert(err instanceof Error ? err.message : "Failed to unarchive distributor. Please try again.");
    } finally {
      setLoading(false);
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
      setLoading(true);
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
        alert(`Successfully archived ${successCount} distributor(s)`);
      } else {
        alert(`Archived ${successCount} of ${bulkArchiveTargets.length} distributor(s). ${failCount} failed.`);
      }

      fetchDistributors();
    } catch (err) {
      console.error("Error archiving distributors:", err);
      alert("Error archiving some distributors");
    } finally {
      setLoading(false);
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
          alert(
            `Successfully updated points for ${result.totalUpdated} distributor(s)`,
          );
        } else if (result.partialSuccess) {
          alert(
            `Updated ${result.totalUpdated} of ${updates.length} distributor(s). ${result.totalFailed} failed.`,
          );
        } else {
          alert(
            `Failed to update points. ${result.totalFailed} distributor(s) failed.`,
          );
        }
      } else {
        // Use regular batch API for smaller updates
        const result = await distributorsApi.batchUpdatePoints(updates, reason);

        setShowSetPointsModal(false);

        if (result.failed_count === 0) {
          alert(
            `Successfully updated points for ${result.updated_count} distributor(s)`,
          );
        } else {
          alert(
            `Updated ${result.updated_count} of ${updates.length} distributor(s). ${result.failed_count} failed.`,
          );
        }
      }

      // Refresh distributors list
      fetchDistributors();
    } catch (err) {
      console.error("Error updating points:", err);
      alert("Error updating points");
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
        alert(data.error || "Failed to update points");
        return;
      }

      setShowSetPointsModal(false);
      alert(
        `Successfully updated points for ${data.updated_count} distributor(s)`,
      );
      fetchDistributors();
    } catch (err) {
      console.error("[DEBUG] Error bulk updating points:", err);
      alert("Error updating points. Please try again.");
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
        alert(data.error || "Failed to reset points");
        return;
      }

      setShowSetPointsModal(false);
      alert(
        `Successfully reset points for ${data.updated_count} distributor(s)`,
      );
      fetchDistributors();
    } catch (err) {
      console.error("[DEBUG] Error resetting points:", err);
      alert("Error resetting points. Please try again.");
    } finally {
      setSettingPoints(false);
    }
  };

  return (
    <>


        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Distributors</h1>
              <p className="text-sm text-muted-foreground">
                View and manage distributor information.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Show Archived
              </label>
            </div>
          </div>

          {/* Loading/Error States */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading distributors...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchDistributors}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <DistributorsTable
              distributors={distributors}
              loading={loading}
              onView={handleViewClick}
              onEdit={handleEditClick}
              onArchive={handleArchiveClick}
              onUnarchive={handleUnarchiveClick}
              onArchiveSelected={handleArchiveSelected}
              onCreateNew={() => setShowCreateModal(true)}
              onRefresh={fetchDistributors}
              refreshing={loading}
              onExport={() => setShowExportModal(true)}
              onSetPoints={() => setShowSetPointsModal(true)}
              onViewPointsHistory={(distributor) => {
                setPointsHistoryTarget(distributor);
                setShowPointsHistory(true);
              }}
            />
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24">
          <h2 className="text-2xl font-semibold mb-2">Distributors</h2>
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
              <Search className="absolute left-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search....."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Loading/Error States Mobile */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">Loading...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 text-sm">{error}</p>
              <button
                onClick={fetchDistributors}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && !error && (
            <DistributorsMobileCards
              paginatedDistributors={paginatedDistributors}
              filteredDistributors={filteredDistributors}
              loading={loading}
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              onView={handleViewClick}
              onEdit={handleEditClick}
              onArchive={handleArchiveClick}
              onUnarchive={handleUnarchiveClick}
            />
          )}
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
        distributors={distributors}
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
