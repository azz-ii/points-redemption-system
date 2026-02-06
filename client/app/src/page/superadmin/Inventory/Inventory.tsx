import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { fetchWithCsrf } from "@/lib/csrf";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNavSuperAdmin } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  Search,
  Sliders,
  LogOut,
  RotateCw,
  BookOpen,
  Download,
} from "lucide-react";
import type { InventoryItem, StockStatus } from "./modals";
import {
  ViewInventoryModal,
  EditStockModal,
  ExportModal,
  SetInventoryModal,
  STATUS_OPTIONS,
} from "./modals";
import { inventoryApi } from "@/lib/inventory-api";
import {
  InventoryTable,
  InventoryMobileCards,
  InventoryPagination,
} from "./components";

interface ApiInventoryItem {
  id: number;
  item_name: string;
  item_code: string;
  category: string;
  points: string;
  price: string;
  stock: number;
  committed_stock: number;
  available_stock: number;
  has_stock: boolean;
  legend:
    | "GIVEAWAY"
    | "MERCH"
    | "PROMO"
    | "AD_MATERIALS"
    | "POINT_OF_SALE"
    | "OTHERS";
  stock_status: string;
}

function Inventory() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | "ALL">(15);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSetInventoryModal, setShowSetInventoryModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<InventoryItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [editData, setEditData] = useState({ stock: "" });
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Fetch inventory items from API
  const fetchInventoryItems = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (rowsPerPage !== "ALL") {
        params.append("page_size", rowsPerPage.toString());
      } else {
        params.append("page_size", "1000"); // Large number for "ALL"
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const url = `/api/inventory/?${params.toString()}`;
      console.log("[Inventory] Fetching inventory items (GET) -> url=", url);
      const response = await fetch(url, {
        credentials: "include",
      });
      console.log("[Inventory] GET response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch inventory items");
      }

      const data = await response.json();
      // Handle paginated response format: { count, next, previous, results }
      const inventoryItems: InventoryItem[] = (data.results || []).map(
        (item: ApiInventoryItem) => ({
          id: item.id,
          item_name: item.item_name,
          item_code: item.item_code,
          category: item.category,
          points: item.points,
          price: item.price,
          stock: item.stock,
          committed_stock: item.committed_stock,
          available_stock: item.available_stock,
          has_stock: item.has_stock,
          legend: item.legend,
          stock_status: item.stock_status as StockStatus,
        }),
      );
      setItems(inventoryItems);
      setTotalCount(data.count || 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      setError("Failed to load inventory items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchQuery, statusFilter]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  // Pagination logic
  const totalPages =
    rowsPerPage === "ALL"
      ? 1
      : Math.max(1, Math.ceil(totalCount / (rowsPerPage as number)));
  const safePage = Math.min(page, totalPages);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  // Handle view click
  const handleViewClick = (item: InventoryItem) => {
    setViewTarget(item);
    setShowViewModal(true);
  };

  // Handle edit click
  const handleEditClick = (item: InventoryItem) => {
    setEditTarget(item);
    setEditData({
      stock: item.stock.toString(),
    });
    setEditError(null);
    setShowEditModal(true);
  };

  // Handle set inventory - batch updates (only changed items)
  const handleSetStock = async (updates: { id: number; stock: number }[]) => {
    try {
      setLoading(true);

      // Use batch API for efficiency
      const result = await inventoryApi.batchUpdateStock(updates);

      // Success
      setShowSetInventoryModal(false);

      if (result.failed_count === 0) {
        alert(`Successfully updated stock for ${result.updated_count} item(s)`);
      } else {
        alert(
          `Updated ${result.updated_count} of ${updates.length} item(s). ${result.failed_count} failed.`,
        );
      }

      fetchInventoryItems();
    } catch (err) {
      console.error("Error updating stock:", err);
      alert(err instanceof Error ? err.message : "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk set stock
  const handleBulkSetStock = async (stockDelta: number, password: string) => {
    try {
      setLoading(true);
      const result = await inventoryApi.bulkUpdateStock(stockDelta, password);

      // Success
      setShowSetInventoryModal(false);
      alert(
        result.message ||
          `Successfully updated ${result.updated_count} item(s)`,
      );
      fetchInventoryItems();
    } catch (err) {
      console.error("Error bulk updating stock:", err);
      alert(err instanceof Error ? err.message : "Failed to bulk update stock");
    } finally {
      setLoading(false);
    }
  };

  // Handle reset all stock
  const handleResetAllStock = async (password: string) => {
    try {
      setLoading(true);
      const result = await inventoryApi.resetAllStock(password);

      // Success
      setShowSetInventoryModal(false);
      alert(
        result.message || `Successfully reset ${result.updated_count} item(s)`,
      );
      fetchInventoryItems();
    } catch (err) {
      console.error("Error resetting stock:", err);
      alert(err instanceof Error ? err.message : "Failed to reset stock");
    } finally {
      setLoading(false);
    }
  };

  // Handle update stock
  const handleUpdateStock = async () => {
    if (!editTarget) return;

    setEditError(null);

    // Validation
    const stock = parseInt(editData.stock);

    if (isNaN(stock) || stock < 0) {
      setEditError("Stock must be a valid non-negative number");
      return;
    }

    try {
      setUpdating(true);
      const payload = {
        stock: stock,
      };
      console.log(
        "[Inventory] Updating stock (PATCH) id=",
        editTarget.id,
        " payload:",
        payload,
      );
      const response = await fetchWithCsrf(`/api/inventory/${editTarget.id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("[Inventory] PATCH response status:", response.status);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update stock");
      }

      setShowEditModal(false);
      setEditTarget(null);
      setEditError(null);
      fetchInventoryItems();
    } catch (err) {
      console.error("Error updating stock:", err);
      setEditError(
        err instanceof Error ? err.message : "Failed to update stock",
      );
    } finally {
      setUpdating(false);
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
              onClick={() => navigate("/admin/catalogue")}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
            >
              <BookOpen className="h-5 w-5" />
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
              <h1 className="text-3xl font-semibold">Inventory</h1>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View and manage stock levels and reorder points.
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
                placeholder="Search by name, code, category......"
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
                onClick={() => fetchInventoryItems()}
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
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                    resolvedTheme === "dark"
                      ? "border-gray-700 hover:bg-gray-900"
                      : "border-gray-300 hover:bg-gray-100"
                  } transition-colors ${statusFilter ? "ring-2 ring-blue-500" : ""}`}
                >
                  <Sliders className="h-5 w-5" />
                  <span>Filter</span>
                  {statusFilter && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                      1
                    </span>
                  )}
                </button>
                {showFilterDropdown && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="p-2">
                      <p
                        className={`text-xs font-medium mb-2 px-2 ${
                          resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        Stock Status
                      </p>
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setStatusFilter(option.value);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm ${
                            statusFilter === option.value
                              ? "bg-blue-500 text-white"
                              : resolvedTheme === "dark"
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowSetInventoryModal(true)}
                className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                  resolvedTheme === "dark"
                    ? "border-blue-700 hover:bg-blue-900 text-blue-400"
                    : "border-blue-300 hover:bg-blue-50 text-blue-600"
                } transition-colors`}
              >
                <BookOpen className="h-5 w-5" />
                <span>Set Inventory</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                  resolvedTheme === "dark"
                    ? "border-gray-700 hover:bg-gray-900"
                    : "border-gray-300 hover:bg-gray-100"
                } transition-colors`}
              >
                <Download className="h-5 w-5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div
            className={`border rounded-lg flex flex-col ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            } transition-colors`}
          >
            <InventoryTable
              items={items}
              loading={loading}
              error={error}
              onViewItem={handleViewClick}
              onEditItem={handleEditClick}
              onRetry={fetchInventoryItems}
              searchQuery={searchQuery}
            />

            <InventoryPagination
              page={safePage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24">
          <h2 className="text-2xl font-semibold mb-2">Inventory</h2>
          <p
            className={`text-xs mb-4 ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage stock levels
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

          {/* Mobile Filter */}
          <div className="mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border text-sm font-medium ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Cards and Pagination */}
          <InventoryMobileCards
            items={items}
            loading={loading}
            error={error}
            onViewItem={handleViewClick}
            onEditItem={handleEditClick}
            onRetry={fetchInventoryItems}
            searchQuery={searchQuery}
          />

          {items.length > 0 && (
            <InventoryPagination
              page={safePage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
              isMobile={true}
            />
          )}
        </div>
      </div>

      <MobileBottomNavSuperAdmin />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Close filter dropdown when clicking outside */}
      {showFilterDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowFilterDropdown(false)}
        />
      )}

      <ViewInventoryModal
        isOpen={showViewModal && !!viewTarget}
        onClose={() => {
          setShowViewModal(false);
          setViewTarget(null);
        }}
        item={viewTarget}
      />

      <EditStockModal
        isOpen={showEditModal && !!editTarget}
        onClose={() => {
          setShowEditModal(false);
          setEditTarget(null);
          setEditError(null);
        }}
        item={editTarget}
        data={editData}
        setData={setEditData}
        updating={updating}
        error={editError}
        onConfirm={handleUpdateStock}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        items={items}
      />

      <SetInventoryModal
        isOpen={showSetInventoryModal}
        onClose={() => setShowSetInventoryModal(false)}
        onFetchPage={inventoryApi.getInventoryPage}
        loading={loading}
        onSubmit={handleSetStock}
        onBulkSubmit={handleBulkSetStock}
        onResetAll={handleResetAllStock}
      />
    </div>
  );
}

export default Inventory;
