import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { fetchWithCsrf } from "@/lib/csrf";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { InventoryItem, StockStatus } from "./modals";
import {
  ViewInventoryModal,
  EditStockModal,
  ExportModal,
  SetInventoryModal,
} from "./modals";
import { inventoryApi } from "@/lib/inventory-api";
import {
  InventoryTable,
  InventoryMobileCards,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state (0-indexed for DataTable compatibility)
  const [tablePage, setTablePage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

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

      const params = new URLSearchParams();
      params.append("page", String(tablePage + 1));
      params.append("page_size", String(pageSize));
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const response = await fetch(`/api/inventory/?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch inventory items");
      }

      const data = await response.json();
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
  }, [tablePage, pageSize, searchQuery]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  const handlePageChange = useCallback((pageIndex: number) => {
    setTablePage(pageIndex);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setTablePage(0);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setTablePage(0);
  }, []);

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
        toast.success(`Successfully updated stock for ${result.updated_count} item(s)`);
      } else {
        toast.warning(
          `Updated ${result.updated_count} of ${updates.length} item(s). ${result.failed_count} failed.`,
        );
      }

      fetchInventoryItems();
    } catch (err) {
      console.error("Error updating stock:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update stock");
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
      toast.success(
        result.message ||
          `Successfully updated ${result.updated_count} item(s)`,
      );
      fetchInventoryItems();
    } catch (err) {
      console.error("Error bulk updating stock:", err);
      toast.error(err instanceof Error ? err.message : "Failed to bulk update stock");
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
      toast.success(
        result.message || `Successfully reset ${result.updated_count} item(s)`,
      );
      fetchInventoryItems();
    } catch (err) {
      console.error("Error resetting stock:", err);
      toast.error(err instanceof Error ? err.message : "Failed to reset stock");
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
    <>


        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Inventory</h1>
              <p
                className="text-sm text-muted-foreground"
              >
                View and manage stock levels and reorder points.
              </p>
            </div>
          </div>

          {/* Table */}
          <InventoryTable
            items={items}
            loading={loading}
            error={error}
            onViewItem={handleViewClick}
            onEditItem={handleEditClick}
            onRetry={fetchInventoryItems}
            onRefresh={fetchInventoryItems}
            refreshing={loading}
            onExport={() => setShowExportModal(true)}
            onSetInventory={() => setShowSetInventoryModal(true)}
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
          <h2 className="text-2xl font-semibold mb-2">Inventory</h2>
          <p
            className="text-xs mb-4 text-muted-foreground"
          >
            Manage stock levels
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setTablePage(0);
                }}
                className="pl-10 w-full text-sm bg-transparent border-0 text-foreground placeholder:text-muted-foreground"
              />
            </div>
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

          {items.length > 0 && !loading && !error && (
            <div className="flex items-center justify-center gap-2 mt-4 pb-2">
              <button
                onClick={() => setTablePage((p) => Math.max(0, p - 1))}
                disabled={tablePage === 0}
                className="p-1.5 rounded transition-colors hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium px-2">
                Page {tablePage + 1} of {pageCount}
              </span>
              <button
                onClick={() => setTablePage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={tablePage >= pageCount - 1}
                className="p-1.5 rounded transition-colors hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

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
        searchQuery={searchQuery}
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
    </>
  );
}

export default Inventory;
