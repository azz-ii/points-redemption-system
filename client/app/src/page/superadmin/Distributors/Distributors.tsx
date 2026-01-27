import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  Search,
  Plus,
  Store,
  LogOut,
} from "lucide-react";

import { distributorsApi, type Distributor } from "@/lib/distributors-api";
import {
  CreateDistributorModal,
  EditDistributorModal,
  ViewDistributorModal,
  DeleteDistributorModal,
  ExportModal,
  SetPointsModal,
} from "./modals";
import { DistributorsTable, DistributorsMobileCards } from "./components";

function Distributors() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const currentPage = "distributors";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distributors, setDistributors] = useState<Distributor[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state for mobile only
  const [page, setPage] = useState(1);

  const fetchDistributors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await distributorsApi.getDistributors(searchQuery);
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
  }, [searchQuery]);

  // Fetch distributors on mount
  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  // Filter and paginate for mobile view
  const filteredDistributors = distributors.filter((distributor) => {
    const query = searchQuery.toLowerCase();
    return (
      distributor.name.toLowerCase().includes(query) ||
      distributor.contact_email.toLowerCase().includes(query) ||
      distributor.location.toLowerCase().includes(query) ||
      distributor.region.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredDistributors.length / 15));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * 15;
  const endIndex = startIndex + 15;
  const paginatedDistributors = filteredDistributors.slice(startIndex, endIndex);

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingDistributorId, setEditingDistributorId] = useState<number | null>(null);
  const [viewTarget, setViewTarget] = useState<Distributor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Distributor | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSetPointsModal, setShowSetPointsModal] = useState(false);
  const [settingPoints, setSettingPoints] = useState(false);

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
      const createdDistributor = await distributorsApi.createDistributor(newDistributor);
      setDistributors(prev => [...prev, createdDistributor]);
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
      contact_email: distributor.contact_email,
      phone: distributor.phone,
      location: distributor.location,
      region: distributor.region,
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
      const updatedDistributor = await distributorsApi.updateDistributor(editingDistributorId, editDistributor);
      setDistributors(prev => prev.map(d => 
        d.id === editingDistributorId ? updatedDistributor : d
      ));
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

  // Handle delete click
  const handleDeleteClick = (distributor: Distributor) => {
    setDeleteTarget(distributor);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await distributorsApi.deleteDistributor(deleteTarget.id);
      setDistributors(prev => prev.filter(d => d.id !== deleteTarget.id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting distributor:", err);
      alert("Failed to delete distributor. Please try again.");
    }
  };

  // Handle set points submission
  const handleSetPoints = async (updates: { id: number; points: number }[]) => {
    try {
      setSettingPoints(true);
      
      // Update points for all distributors
      const updateResults = await Promise.allSettled(
        updates.map(update =>
          distributorsApi.update(update.id, { points: update.points })
        )
      );

      const successCount = updateResults.filter(r => r.status === "fulfilled").length;
      const failCount = updateResults.filter(r => r.status === "rejected").length;
      
      setShowSetPointsModal(false);
      
      if (failCount === 0) {
        alert(`Successfully updated points for ${successCount} distributor(s)`);
      } else {
        alert(`Updated ${successCount} of ${updates.length} distributor(s). ${failCount} failed.`);
      }
      
      // Refresh distributors list
      fetchDistributors();
    } catch (err) {
      console.error("Error updating points:", err);
      alert("Error updating points");
    } finally {
      setSettingPoints(false);
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
          className={`md:hidden sticky top-0 z-40 p-4 flex justify-between items-center border-b ${
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
            <span className="text-sm font-medium">Izza</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationOpen(true)}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
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
              <Store className="h-5 w-5" />
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
              <h1 className="text-3xl font-semibold">Distributors</h1>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View and manage distributor information.
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
              onDelete={handleDeleteClick}
              onCreateNew={() => setShowCreateModal(true)}
              onRefresh={fetchDistributors}
              refreshing={loading}
              onExport={() => setShowExportModal(true)}
              onSetPoints={() => setShowSetPointsModal(true)}
            />
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24">
          <h2 className="text-2xl font-semibold mb-2">Distributors</h2>
          <p
            className={`text-xs mb-4 ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage distributors
          </p>

          {/* Mobile Search */}
          <div className="mb-4">
            <div
              className={`relative flex items-center rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <Search className="absolute left-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search....."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 w-full text-sm ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                    : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
          </div>

          <div className="mb-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 border text-sm font-semibold transition-colors ${
                resolvedTheme === "dark"
                  ? "bg-white text-gray-900 border-gray-200 hover:bg-gray-200"
                  : "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
              }`}
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
              onDelete={handleDeleteClick}
            />
          )}
        </div>
      </div>

      <MobileBottomNav />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

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

      {/* Delete Confirmation Modal */}
      <DeleteDistributorModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        distributor={deleteTarget}
        onConfirm={confirmDelete}
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
        distributors={distributors}
        loading={settingPoints}
        onSubmit={handleSetPoints}
      />
    </div>
  );
}

export default Distributors;
