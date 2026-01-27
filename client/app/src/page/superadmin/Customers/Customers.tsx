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
  Users,
  LogOut,
} from "lucide-react";

import { customersApi, type Customer } from "@/lib/customers-api";
import {
  CreateCustomerModal,
  EditCustomerModal,
  ViewCustomerModal,
  DeleteCustomerModal,
  ExportModal,
  SetPointsModal,
} from "./modals";
import { CustomersTable, CustomersMobileCards } from "./components";

function Customers() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const currentPage = "customers";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state for mobile only
  const [page, setPage] = useState(1);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await customersApi.getCustomers(searchQuery);
      // Ensure data is always an array
      setCustomers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers. Please try again.");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filter and paginate for mobile view
  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.contact_email.toLowerCase().includes(query) ||
      customer.location.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / 15));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * 15;
  const endIndex = startIndex + 15;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
    fetchCustomers();
  }, [searchQuery, fetchCustomers]);

  // Modal and form state for creating new customer
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact_email: "",
    phone: "",
    location: "",
  });

  const [editCustomer, setEditCustomer] = useState({
    name: "",
    contact_email: "",
    phone: "",
    location: "",
  });

  // Modal state for edit/view/delete
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [viewTarget, setViewTarget] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSetPointsModal, setShowSetPointsModal] = useState(false);
  const [settingPoints, setSettingPoints] = useState(false);

  // Handle create customer submission
  const handleCreateCustomer = async () => {
    setCreateError(null);

    // Validation
    if (!newCustomer.name.trim()) {
      setCreateError("Name is required");
      return;
    }
    if (!newCustomer.contact_email.trim()) {
      setCreateError("Contact email is required");
      return;
    }
    if (!newCustomer.phone.trim()) {
      setCreateError("Phone is required");
      return;
    }
    if (!newCustomer.location.trim()) {
      setCreateError("Location is required");
      return;
    }

    try {
      setCreating(true);
      const createdCustomer = await customersApi.createCustomer(newCustomer);
      setCustomers(prev => [...prev, createdCustomer]);
      setNewCustomer({
        name: "",
        contact_email: "",
        phone: "",
        location: "",
      });
      setShowCreateModal(false);
      setCreateError(null);
    } catch (err) {
      console.error("Error creating customer:", err);
      setCreateError("Failed to create customer. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // Handle edit click
  const handleEditClick = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setEditCustomer({
      name: customer.name,
      contact_email: customer.contact_email,
      phone: customer.phone,
      location: customer.location,
    });
    setShowEditModal(true);
    setEditError(null);
  };

  // Handle update customer
  const handleUpdateCustomer = async () => {
    if (!editingCustomerId) return;

    setEditError(null);

    // Validation
    if (!editCustomer.name.trim()) {
      setEditError("Name is required");
      return;
    }
    if (!editCustomer.contact_email.trim()) {
      setEditError("Contact email is required");
      return;
    }
    if (!editCustomer.phone.trim()) {
      setEditError("Phone is required");
      return;
    }
    if (!editCustomer.location.trim()) {
      setEditError("Location is required");
      return;
    }

    try {
      setUpdating(true);
      const updatedCustomer = await customersApi.updateCustomer(editingCustomerId, editCustomer);
      setCustomers(prev => prev.map(c => 
        c.id === editingCustomerId ? updatedCustomer : c
      ));
      setShowEditModal(false);
      setEditingCustomerId(null);
      setEditError(null);
    } catch (err) {
      console.error("Error updating customer:", err);
      setEditError("Failed to update customer. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle view click
  const handleViewClick = (customer: Customer) => {
    setViewTarget(customer);
    setShowViewModal(true);
  };

  // Handle delete click
  const handleDeleteClick = (customer: Customer) => {
    setDeleteTarget(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await customersApi.deleteCustomer(deleteTarget.id);
      setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Failed to delete customer. Please try again.");
    }
  };

  // Handle set points submission
  const handleSetPoints = async (updates: { id: number; points: number }[]) => {
    try {
      setSettingPoints(true);
      
      // Update points for all customers
      const updateResults = await Promise.allSettled(
        updates.map(update =>
          customersApi.update(update.id, { points: update.points })
        )
      );

      const successCount = updateResults.filter(r => r.status === "fulfilled").length;
      const failCount = updateResults.filter(r => r.status === "rejected").length;
      
      setShowSetPointsModal(false);
      
      if (failCount === 0) {
        alert(`Successfully updated points for ${successCount} customer(s)`);
      } else {
        alert(`Updated ${successCount} of ${updates.length} customer(s). ${failCount} failed.`);
      }
      
      // Refresh customers list
      fetchCustomers();
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
              <Users className="h-5 w-5" />
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
              <h1 className="text-3xl font-semibold">Customers</h1>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View and manage customer information.
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
              <p className="text-gray-500">Loading customers...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchCustomers}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <CustomersTable
              customers={customers}
              loading={loading}
              onView={handleViewClick}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onCreateNew={() => setShowCreateModal(true)}
              onRefresh={fetchCustomers}
              refreshing={loading}
              onExport={() => setShowExportModal(true)}
              onSetPoints={() => setShowSetPointsModal(true)}
            />
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24">
          <h2 className="text-2xl font-semibold mb-2">Customers</h2>
          <p
            className={`text-xs mb-4 ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage customers
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
              Add Customer
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
                onClick={fetchCustomers}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && !error && (
            <CustomersMobileCards
              paginatedCustomers={paginatedCustomers}
              filteredCustomers={filteredCustomers}
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

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newCustomer={newCustomer}
        setNewCustomer={setNewCustomer}
        creating={creating}
        error={createError}
        onSubmit={handleCreateCustomer}
      />

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={showEditModal && editingCustomerId !== null}
        onClose={() => setShowEditModal(false)}
        editCustomer={editCustomer}
        setEditCustomer={setEditCustomer}
        updating={updating}
        error={editError}
        onSubmit={handleUpdateCustomer}
      />

      {/* View Customer Modal */}
      <ViewCustomerModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        customer={viewTarget}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCustomerModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        customer={deleteTarget}
        onConfirm={confirmDelete}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        customers={customers}
      />

      {/* Set Points Modal */}
      <SetPointsModal
        isOpen={showSetPointsModal}
        onClose={() => setShowSetPointsModal(false)}
        customers={customers}
        loading={settingPoints}
        onSubmit={handleSetPoints}
      />
    </div>
  );
}

export default Customers;
