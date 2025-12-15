import { useState, useEffect, useCallback } from "react";
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
  Trash2,
  Edit,
  Eye,
  Plus,
  Store,
  X,
  LogOut,
  RotateCw,
    ArchiveX,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft
} from "lucide-react";

import { distributorsApi, type Distributor } from "@/lib/distributors-api";

interface DistributorsProps {
  onNavigate?: (
    page:
      | "dashboard"
      | "history"
      | "accounts"
      | "catalogue"
      | "redemption"
      | "inventory"
      | "distributors"
  ) => void;
  onLogout?: () => void;
}

function Distributors({ onNavigate, onLogout }: DistributorsProps) {
  const { resolvedTheme } = useTheme();
  const currentPage = "distributors";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distributors, setDistributors] = useState<Distributor[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | "ALL">(15);

  const fetchDistributors = useCallback(async () => {
    try {
      setLoading(true);
      const data = await distributorsApi.getDistributors(searchQuery);
      setDistributors(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching distributors:", err);
      setError("Failed to load distributors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Fetch distributors on mount
  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  // Filter distributors based on search query
  const filteredDistributors = distributors.filter((distributor) => {
    const query = searchQuery.toLowerCase();
    return (
      distributor.name.toLowerCase().includes(query) ||
      distributor.contact_email.toLowerCase().includes(query) ||
      distributor.location.toLowerCase().includes(query) ||
      distributor.region.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = rowsPerPage === "ALL" ? 1 : Math.max(1, Math.ceil(filteredDistributors.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = rowsPerPage === "ALL" ? 0 : (safePage - 1) * rowsPerPage;
  const endIndex = rowsPerPage === "ALL" ? filteredDistributors.length : startIndex + rowsPerPage;
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

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate || (() => {})}
        onLogout={onLogout || (() => {})}
      />

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
              onClick={() => onNavigate?.("inventory")}
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
                placeholder="Search by name, email, location......"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 w-80 ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchDistributors()}
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
                className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                  resolvedTheme === "dark"
                    ? "border-gray-700 hover:bg-gray-900"
                    : "border-gray-300 hover:bg-gray-100"
                } transition-colors`}
              >
                <Sliders className="h-5 w-5" />
                <span>Filter</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border ${
                  resolvedTheme === "dark"
                    ? "bg-white text-gray-900 border-gray-200 hover:bg-gray-200"
                    : "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
                }`}
              >
                <Plus className="h-5 w-5" />
                <span>Add Distributor</span>
              </button>
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
            <div
              className={`border rounded-lg flex flex-col ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
              <div className="overflow-auto max-h-[calc(100vh-295px)]">
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
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Contact Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Phone
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Region
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Date Added
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      resolvedTheme === "dark"
                        ? "divide-gray-700"
                        : "divide-gray-200"
                    }`}
                  >
                    {paginatedDistributors.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <p className="text-gray-500">
                            {searchQuery
                              ? "No distributors match your search"
                              : "No distributors found"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedDistributors.map((distributor) => (
                        <tr
                          key={distributor.id}
                          className={`hover:${
                            resolvedTheme === "dark"
                              ? "bg-gray-800"
                              : "bg-gray-50"
                          } transition-colors`}
                        >
                          <td className="px-6 py-4 text-sm font-medium">
                            {distributor.name}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {distributor.contact_email}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {distributor.phone}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {distributor.location}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {distributor.region}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(distributor.date_added).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleViewClick(distributor)}
                                className="px-4 py-2 rounded flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditClick(distributor)}
                                className="px-4 py-2 rounded flex items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(distributor)}
                                className="px-4 py-2 rounded flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className={`flex items-center justify-between p-4 border-t ${
                resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}>
                {/* Left: Rows per page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      const value = e.target.value === "ALL" ? "ALL" : parseInt(e.target.value);
                      setRowsPerPage(value);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded border text-sm ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                  >
                    <option value="15">15</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="ALL">ALL</option>
                  </select>
                </div>

                {/* Right: Page navigation */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage(1)}
                    disabled={safePage === 1 || rowsPerPage === "ALL"}
                    className={`p-1.5 rounded transition-colors ${
                      resolvedTheme === "dark"
                        ? "hover:bg-gray-800 disabled:opacity-30"
                        : "hover:bg-gray-100 disabled:opacity-30"
                    } disabled:cursor-not-allowed`}
                    title="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.max(1, safePage - 1))}
                    disabled={safePage === 1 || rowsPerPage === "ALL"}
                    className={`p-1.5 rounded transition-colors ${
                      resolvedTheme === "dark"
                        ? "hover:bg-gray-800 disabled:opacity-30"
                        : "hover:bg-gray-100 disabled:opacity-30"
                    } disabled:cursor-not-allowed`}
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium px-2">
                    Page {safePage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                    disabled={safePage === totalPages || rowsPerPage === "ALL"}
                    className={`p-1.5 rounded transition-colors ${
                      resolvedTheme === "dark"
                        ? "hover:bg-gray-800 disabled:opacity-30"
                        : "hover:bg-gray-100 disabled:opacity-30"
                    } disabled:cursor-not-allowed`}
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={safePage === totalPages || rowsPerPage === "ALL"}
                    className={`p-1.5 rounded transition-colors ${
                      resolvedTheme === "dark"
                        ? "hover:bg-gray-800 disabled:opacity-30"
                        : "hover:bg-gray-100 disabled:opacity-30"
                    } disabled:cursor-not-allowed`}
                    title="Last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
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
            <div className="space-y-3">
              {paginatedDistributors.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">
                    {searchQuery
                      ? "No distributors match your search"
                      : "No distributors found"}
                  </p>
                </div>
              ) : (
                paginatedDistributors.map((distributor) => (
                  <div
                    key={distributor.id}
                    className={`p-4 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } transition-colors`}
                  >
                    {/* Main Info */}
                    <div className="mb-3">
                      <p className="font-semibold text-sm">
                        {distributor.name}
                      </p>
                      <p
                        className={`text-xs ${
                          resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        {distributor.contact_email}
                      </p>
                    </div>
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium">{distributor.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <p className="font-medium">{distributor.location}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Region:</span>
                        <p className="font-medium">{distributor.region}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date Added:</span>
                        <p className="font-medium">{new Date(distributor.date_added).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewClick(distributor)}
                        className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors font-semibold text-sm"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(distributor)}
                        className={`flex-1 px-3 py-2 rounded flex items-center justify-center ${
                          resolvedTheme === "dark"
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        } transition-colors font-semibold text-sm`}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(distributor)}
                        className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Mobile Pagination */}
          {paginatedDistributors.length > 0 && (
            <div className={`mt-4 space-y-3 pb-2`}>
              {/* Rows per page */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-medium">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    const value = e.target.value === "ALL" ? "ALL" : parseInt(e.target.value);
                    setRowsPerPage(value);
                    setPage(1);
                  }}
                  className={`px-2 py-1 rounded border text-xs ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                >
                  <option value="15">15</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="ALL">ALL</option>
                </select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={safePage === 1 || rowsPerPage === "ALL"}
                  className={`p-1.5 rounded transition-colors ${
                    resolvedTheme === "dark"
                      ? "hover:bg-gray-700 disabled:opacity-30"
                      : "hover:bg-gray-200 disabled:opacity-30"
                  } disabled:cursor-not-allowed`}
                >
                  <ArchiveX className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1 || rowsPerPage === "ALL"}
                  className={`p-1.5 rounded transition-colors ${
                    resolvedTheme === "dark"
                      ? "hover:bg-gray-700 disabled:opacity-30"
                      : "hover:bg-gray-200 disabled:opacity-30"
                  } disabled:cursor-not-allowed`}
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium px-2">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages || rowsPerPage === "ALL"}
                  className={`p-1.5 rounded transition-colors ${
                    resolvedTheme === "dark"
                      ? "hover:bg-gray-700 disabled:opacity-30"
                      : "hover:bg-gray-200 disabled:opacity-30"
                  } disabled:cursor-not-allowed`}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={safePage === totalPages || rowsPerPage === "ALL"}
                  className={`p-1.5 rounded transition-colors ${
                    resolvedTheme === "dark"
                      ? "hover:bg-gray-700 disabled:opacity-30"
                      : "hover:bg-gray-200 disabled:opacity-30"
                  } disabled:cursor-not-allowed`}
                >
                  <ArchiveX className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav
        currentPage={currentPage}
        onNavigate={onNavigate || (() => {})}
      />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Create Distributor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-2xl w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">Add Distributor</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Create a new distributor
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Error Message */}
              {createError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newDistributor.name}
                    onChange={(e) =>
                      setNewDistributor({ ...newDistributor, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., ABC Distributors"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={newDistributor.contact_email}
                    onChange={(e) =>
                      setNewDistributor({ ...newDistributor, contact_email: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., contact@abc.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={newDistributor.phone}
                    onChange={(e) =>
                      setNewDistributor({ ...newDistributor, phone: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., +1234567890"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={newDistributor.location}
                    onChange={(e) =>
                      setNewDistributor({ ...newDistributor, location: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., Metro Manila"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Region *
                  </label>
                  <select
                    value={newDistributor.region}
                    onChange={(e) =>
                      setNewDistributor({ ...newDistributor, region: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                  >
                    <option value="">Select Region</option>
                    <option value="NCR">NCR</option>
                    <option value="Luzon">Luzon</option>
                    <option value="Visayas">Visayas</option>
                    <option value="Mindanao">Mindanao</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  resolvedTheme === "dark"
                    ? "border-gray-600 hover:bg-gray-800 disabled:opacity-50"
                    : "border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDistributor}
                disabled={creating}
                className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Distributor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Distributor Modal */}
      {showEditModal && editingDistributorId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-2xl w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">Edit Distributor</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Update distributor details
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Error Message */}
              {editError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editDistributor.name}
                    onChange={(e) =>
                      setEditDistributor({ ...editDistributor, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., ABC Distributors"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={editDistributor.contact_email}
                    onChange={(e) =>
                      setEditDistributor({ ...editDistributor, contact_email: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., contact@abc.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={editDistributor.phone}
                    onChange={(e) =>
                      setEditDistributor({ ...editDistributor, phone: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., +1234567890"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={editDistributor.location}
                    onChange={(e) =>
                      setEditDistributor({ ...editDistributor, location: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., Metro Manila"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Region *
                  </label>
                  <select
                    value={editDistributor.region}
                    onChange={(e) =>
                      setEditDistributor({ ...editDistributor, region: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                  >
                    <option value="">Select Region</option>
                    <option value="NCR">NCR</option>
                    <option value="Luzon">Luzon</option>
                    <option value="Visayas">Visayas</option>
                    <option value="Mindanao">Mindanao</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-2 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={updating}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  resolvedTheme === "dark"
                    ? "border-gray-600 hover:bg-gray-800 disabled:opacity-50"
                    : "border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDistributor}
                disabled={updating}
                className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Update Distributor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Distributor Modal */}
      {showViewModal && viewTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-2xl w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">View Distributor</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Distributor details
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ID */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Distributor ID</p>
                  <p className="font-semibold">{viewTarget.id}</p>
                </div>

                {/* Name */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-semibold">{viewTarget.name}</p>
                </div>

                {/* Contact Email */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact Email</p>
                  <p className="font-semibold">{viewTarget.contact_email}</p>
                </div>

                {/* Phone */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <p className="font-semibold">{viewTarget.phone}</p>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="font-semibold">{viewTarget.location}</p>
                </div>

                {/* Region */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Region</p>
                  <p className="font-semibold">{viewTarget.region}</p>
                </div>

                {/* Date Added */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date Added</p>
                  <p className="font-semibold">{new Date(viewTarget.date_added).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-2 justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  resolvedTheme === "dark"
                    ? "border-gray-600 hover:bg-gray-800"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-md w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">Delete Distributor</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Confirm deletion
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.name}</strong>? This action cannot be
                undone.
              </p>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 px-6 py-2 rounded-lg border transition-colors ${
                  resolvedTheme === "dark"
                    ? "border-gray-600 hover:bg-gray-800"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Distributors;
