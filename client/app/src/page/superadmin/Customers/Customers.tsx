import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/config";
import { Search, Plus } from "lucide-react";

import { customersApi, type Customer } from "@/lib/customers-api";
import {
  CreateCustomerModal,
  EditCustomerModal,
  ViewCustomerModal,
  ArchiveCustomerModal,
  UnarchiveCustomerModal,
  BulkArchiveCustomerModal,
  ExportModal,
  PromoteCustomerModal,
  MergeCustomerModal,
} from "./modals";
import { CustomersTable, CustomersMobileCards } from "./components";

function Customers() {
  const currentPage = "customers";  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Server-side pagination state
  const [tablePage, setTablePage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_URL}/customers/`, window.location.origin);
      url.searchParams.append('page', String(tablePage + 1));
      url.searchParams.append('page_size', String(pageSize));
      if (showArchived) {
        url.searchParams.append('show_archived', 'true');
      }
      if (searchQuery) {
        url.searchParams.append('search', searchQuery);
      }
      const response = await fetch(url.toString(), {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data.results || []);
      setTotalCount(data.count || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Failed to load customers. Please try again.");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [tablePage, pageSize, searchQuery, showArchived]);

  // Fetch customers on mount and when dependencies change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
    setLoading(true);
    setCustomers([]); // Clear customers to show full loading UI
    setShowArchived(checked);
    setTablePage(0);
  }, []);

  // Modal and form state for creating new customer
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    brand: "",
    sales_channel: "",
  });

  const [editCustomer, setEditCustomer] = useState({
    name: "",
    brand: "",
    sales_channel: "",
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
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState<Customer | null>(null);
  const [mergeTarget, setMergeTarget] = useState<Customer | null>(null);

  // Handle create customer submission
  const handleCreateCustomer = async () => {
    setCreateError(null);

    // Validation
    if (!newCustomer.name.trim()) {
      setCreateError("Name is required");
      return;
    }
    if (!newCustomer.brand.trim()) {
      setCreateError("Brand is required");
      return;
    }
    if (!newCustomer.sales_channel.trim()) {
      setCreateError("Sales channel is required");
      return;
    }

    try {
      setCreating(true);
      const createdCustomer = await customersApi.createCustomer(newCustomer);
      setCustomers((prev) => [...prev, createdCustomer]);
      setNewCustomer({
        name: "",
        brand: "",
        sales_channel: "",
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
      brand: customer.brand ?? "",
      sales_channel: customer.sales_channel ?? "",
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
    if (!editCustomer.brand.trim()) {
      setEditError("Brand is required");
      return;
    }
    if (!editCustomer.sales_channel.trim()) {
      setEditError("Sales channel is required");
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

  // Handle promote click
  const handlePromoteClick = (customer: Customer) => {
    setPromoteTarget(customer);
    setShowPromoteModal(true);
  };

  // Handle merge click
  const handleMergeClick = (customer: Customer) => {
    setMergeTarget(customer);
    setShowMergeModal(true);
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
          <CustomersTable
            customers={customers}
            loading={loading}
            error={error}
            onRetry={fetchCustomers}
            onEdit={handleEditClick}
            onArchive={handleArchiveClick}
            onUnarchive={handleUnarchiveClick}
            onArchiveSelected={handleArchiveSelected}
            onPromote={handlePromoteClick}
            onMerge={handleMergeClick}
            onCreateNew={() => setShowCreateModal(true)}
            onRefresh={fetchCustomers}
            refreshing={loading}
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
          />
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
              Add Customer
            </button>
          </div>

          {/* Mobile Cards */}
          <CustomersMobileCards
            customers={customers}
            paginatedCustomers={customers}
            filteredCustomers={customers}
            loading={loading}
            error={error}
            onRetry={fetchCustomers}
            page={tablePage + 1}
            totalPages={pageCount}
            onPageChange={(p) => setTablePage(p - 1)}
            onView={handleViewClick}
            onEdit={handleEditClick}
            onArchive={handleArchiveClick}
            onUnarchive={handleUnarchiveClick}
          />
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
        searchQuery={searchQuery}
        showArchived={showArchived}
      />

      {/* Promote Customer Modal */}
      <PromoteCustomerModal
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        customer={promoteTarget}
        onSuccess={fetchCustomers}
      />

      {/* Merge Customer Modal */}
      <MergeCustomerModal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        customer={mergeTarget}
        onSuccess={fetchCustomers}
      />
    </>
  );
}

export default Customers;
