import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/config";
import { Search, Plus } from "lucide-react";

import { customersApi, type Customer, type ChunkedUpdateProgress } from "@/lib/customers-api";
import {
  CreateCustomerModal,
  EditCustomerModal,
  ViewCustomerModal,
  ArchiveCustomerModal,
  UnarchiveCustomerModal,
  BulkArchiveCustomerModal,
  ExportModal,
  SetPointsModal,
} from "./modals";
import { CustomersTable, CustomersMobileCards } from "./components";
import { PointsHistoryModal } from "@/components/modals/PointsHistoryModal";

function Customers() {
  const currentPage = "customers";  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Pagination state for mobile only
  const [page, setPage] = useState(1);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_URL}/customers/`, window.location.origin);
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
      setCustomers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers. Please try again.");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showArchived]);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filter and paginate for mobile view
  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.name.toLowerCase().includes(query) ||
      (customer.contact_email?.toLowerCase().includes(query) ?? false) ||
      (customer.location?.toLowerCase().includes(query) ?? false)
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

  // Modal state for edit/view/archive
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showBulkArchiveModal, setShowBulkArchiveModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(
    null,
  );
  const [viewTarget, setViewTarget] = useState<Customer | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Customer | null>(null);
  const [unarchiveTarget, setUnarchiveTarget] = useState<Customer | null>(null);
  const [bulkArchiveTargets, setBulkArchiveTargets] = useState<Customer[]>([]);
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSetPointsModal, setShowSetPointsModal] = useState(false);
  const [showPointsHistory, setShowPointsHistory] = useState(false);
  const [pointsHistoryTarget, setPointsHistoryTarget] = useState<Customer | null>(null);
  const [settingPoints, setSettingPoints] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<ChunkedUpdateProgress | null>(null);

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
      setCustomers((prev) => [...prev, createdCustomer]);
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
      contact_email: customer.contact_email ?? "",
      phone: customer.phone ?? "",
      location: customer.location ?? "",
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
      const updatedCustomer = await customersApi.updateCustomer(
        editingCustomerId,
        editCustomer,
      );
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomerId ? updatedCustomer : c)),
      );
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

  // Handle archive click
  const handleArchiveClick = (customer: Customer) => {
    setArchiveTarget(customer);
    setShowArchiveModal(true);
  };

  // Handle unarchive click
  const handleUnarchiveClick = (customer: Customer) => {
    setUnarchiveTarget(customer);
    setShowUnarchiveModal(true);
  };

  // Confirm archive customer
  const confirmArchive = async (id: number) => {
    try {
      setLoading(true);
      await customersApi.deleteCustomer(id);
      setShowArchiveModal(false);
      setArchiveTarget(null);
      fetchCustomers();
    } catch (err) {
      console.error("Error archiving customer:", err);
      alert("Failed to archive customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Confirm unarchive customer
  const confirmUnarchive = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/customers/${id}/unarchive/`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to unarchive customer');
      }
      
      setShowUnarchiveModal(false);
      setUnarchiveTarget(null);
      fetchCustomers();
    } catch (err) {
      console.error("Error unarchiving customer:", err);
      alert(err instanceof Error ? err.message : "Failed to unarchive customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk archive
  const handleArchiveSelected = async (selectedCustomers: Customer[]) => {
    setBulkArchiveTargets(selectedCustomers);
    setShowBulkArchiveModal(true);
  };

  // Confirm bulk archive
  const confirmBulkArchive = async () => {
    try {
      setLoading(true);
      const archiveResults = await Promise.allSettled(
        bulkArchiveTargets.map((customer) =>
          customersApi.deleteCustomer(customer.id)
        )
      );

      const successCount = archiveResults.filter((r) => r.status === "fulfilled").length;
      const failCount = archiveResults.filter((r) => r.status === "rejected").length;

      setShowBulkArchiveModal(false);
      setBulkArchiveTargets([]);

      if (failCount === 0) {
        alert(`Successfully archived ${successCount} customer(s)`);
      } else {
        alert(`Archived ${successCount} of ${bulkArchiveTargets.length} customer(s). ${failCount} failed.`);
      }

      fetchCustomers();
    } catch (err) {
      console.error("Error archiving customers:", err);
      alert("Error archiving some customers");
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
        const result = await customersApi.batchUpdatePointsChunked(
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
            `Successfully updated points for ${result.totalUpdated} customer(s)`,
          );
        } else if (result.partialSuccess) {
          alert(
            `Updated ${result.totalUpdated} of ${updates.length} customer(s). ${result.totalFailed} failed.`,
          );
        } else {
          alert(
            `Failed to update points. ${result.totalFailed} customer(s) failed.`,
          );
        }
      } else {
        // Use regular batch API for smaller updates
        const result = await customersApi.batchUpdatePoints(updates, reason);

        setShowSetPointsModal(false);

        if (result.failed_count === 0) {
          alert(
            `Successfully updated points for ${result.updated_count} customer(s)`,
          );
        } else {
          alert(
            `Updated ${result.updated_count} of ${updates.length} customer(s). ${result.failed_count} failed.`,
          );
        }
      }

      // Refresh customers list
      fetchCustomers();
    } catch (err) {
      console.error("Error updating points:", err);
      alert("Error updating points");
    } finally {
      setSettingPoints(false);
      setUpdateProgress(null);
    }
  };

  // Handle bulk set points (add/subtract to all customers)
  const handleBulkSetPoints = async (pointsDelta: number, password: string) => {
    console.log("[DEBUG] handleBulkSetPoints called with delta:", pointsDelta);
    try {
      setSettingPoints(true);

      console.log("[DEBUG] Sending POST to /api/customers/bulk_update_points/");
      const response = await fetch(`${API_URL}/customers/bulk_update_points/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          points_delta: pointsDelta,
          password: password,
        }),
      });

      console.log("[DEBUG] Response received:", response.status);
      const data = await response.json();
      console.log("[DEBUG] Response data:", data);

      if (!response.ok) {
        alert(data.error || "Failed to update points");
        return;
      }

      setShowSetPointsModal(false);
      alert(
        `Successfully updated points for ${data.updated_count} customer(s)`,
      );
      fetchCustomers();
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
        "[DEBUG] Sending POST for reset to /api/customers/bulk_update_points/",
      );
      const response = await fetch(`${API_URL}/customers/bulk_update_points/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reset_to_zero: true,
          password: password,
        }),
      });

      console.log("[DEBUG] Reset response received:", response.status);
      const data = await response.json();
      console.log("[DEBUG] Reset response data:", data);

      if (!response.ok) {
        alert(data.error || "Failed to reset points");
        return;
      }

      setShowSetPointsModal(false);
      alert(`Successfully reset points for ${data.updated_count} customer(s)`);
      fetchCustomers();
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
              <h1 className="text-3xl font-semibold">Customers</h1>
              <p
                className="text-sm text-muted-foreground"
              >
                View and manage customer information.
              </p>
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
            <>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-archived"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="show-archived" className="text-sm text-muted-foreground">
                  Show Archived Customers
                </label>
              </div>
              <CustomersTable
                customers={customers}
                loading={loading}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onArchive={handleArchiveClick}
                onUnarchive={handleUnarchiveClick}
                onArchiveSelected={handleArchiveSelected}
                onCreateNew={() => setShowCreateModal(true)}
                onRefresh={fetchCustomers}
                refreshing={loading}
                onExport={() => setShowExportModal(true)}
                onSetPoints={() => setShowSetPointsModal(true)}
                onViewPointsHistory={(customer) => {
                  setPointsHistoryTarget(customer);
                  setShowPointsHistory(true);
                }}
              />
            </>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24">
          <h2 className="text-2xl font-semibold mb-2">Customers</h2>
          <p
            className="text-xs mb-4 text-muted-foreground"
          >
            Manage customers
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
              onArchive={handleArchiveClick}
              onUnarchive={handleUnarchiveClick}
            />
          )}
        </div>
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

      {/* Archive Confirmation Modal */}
      <ArchiveCustomerModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        customer={archiveTarget}
        loading={loading}
        onConfirm={confirmArchive}
      />

      {/* Unarchive Confirmation Modal */}
      <UnarchiveCustomerModal
        isOpen={showUnarchiveModal}
        onClose={() => setShowUnarchiveModal(false)}
        customer={unarchiveTarget}
        loading={loading}
        onConfirm={confirmUnarchive}
      />

      {/* Bulk Archive Confirmation Modal */}
      <BulkArchiveCustomerModal
        isOpen={showBulkArchiveModal}
        onClose={() => setShowBulkArchiveModal(false)}
        customers={bulkArchiveTargets}
        loading={loading}
        onConfirm={confirmBulkArchive}
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
        onFetchPage={customersApi.getCustomersPage}
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
          entityType="CUSTOMER"
          entityId={pointsHistoryTarget.id}
          entityName={pointsHistoryTarget.name}
        />
      )}
    </>
  );
}

export default Customers;
