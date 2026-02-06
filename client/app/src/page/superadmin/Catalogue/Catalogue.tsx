import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNavSuperAdmin } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { API_URL } from "@/lib/config";
import {
  Bell,
  Search,
  Sliders,
  Plus,
  Warehouse,
  LogOut,
  RotateCw,
  Download,
} from "lucide-react";
import type { Product, User } from "./modals";
import {
  CreateItemModal,
  EditItemModal,
  ViewItemModal,
  DeleteItemModal,
  ExportModal,
} from "./modals";
import {
  CatalogueTable,
  CatalogueMobileCards,
  CataloguePagination,
} from "./components";

function Catalogue() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const currentPage = "catalogue";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Product[]>([
    {
      id: 1,
      item_name: "Platinum Polo",
      item_code: "MC3001",
      description:
        "A high-quality polo shirt made from premium platinum fabric with lasting charm and style.",
      purpose:
        "Ideal for casual wear, company events, or as a stylish uniform piece.",
      specifications:
        "Material: 100% Platinum Cotton, Fit: Modern Fit, Color: Ribbed Polo Collar, Sleeves: Short sleeves with ribbed armbands",
      category:
        "Available in sizes S, M, L, XL and colors Black, White, and Navy Blue.",
      points: "500",
      price: "1200",
      legend: "MERCH",
      pricing_type: "FIXED",
      min_order_qty: 1,
      max_order_qty: null,
      has_stock: true,
      stock: 100,
      committed_stock: 10,
      available_stock: 90,
      is_archived: false,
      date_added: new Date().toISOString().split("T")[0],
      added_by: null,
      date_archived: null,
      archived_by: null,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [_users, setUsers] = useState<User[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | "ALL">(15);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch catalogue items from API
  useEffect(() => {
    fetchCatalogueItems();
  }, [page, rowsPerPage, searchQuery]);

  // Fetch users for dropdowns
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/users/`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.accounts || []);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const fetchCatalogueItems = async () => {
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

      const url = `/api/catalogue/?${params.toString()}`;
      console.log("[Catalogue] Fetching products (GET) -> url=", url);
      const response = await fetch(url, {
        credentials: "include",
      });
      console.log("[Catalogue] GET response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      // Handle paginated response format: { count, next, previous, results }
      const products = data.results || [];
      setTotalCount(data.count || 0);

      // Map API response to Product model
      const mappedItems: Product[] = products.map((product: Product) => ({
        id: product.id,
        item_code: product.item_code,
        item_name: product.item_name,
        description: product.description,
        purpose: product.purpose,
        specifications: product.specifications,
        legend: product.legend,
        category: product.category,
        points: product.points,
        price: product.price,
        pricing_type: product.pricing_type || "FIXED",
        stock: product.stock || 0,
        committed_stock: product.committed_stock || 0,
        available_stock: product.available_stock || 0,
        is_archived: product.is_archived || false,
        date_added: product.date_added,
        added_by: product.added_by,
        date_archived: product.date_archived,
        archived_by: product.archived_by,
      }));
      setItems(mappedItems);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic using server-side count
  const totalPages =
    rowsPerPage === "ALL"
      ? 1
      : Math.max(1, Math.ceil(totalCount / (rowsPerPage as number)));
  const safePage = Math.min(page, totalPages);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Modal and form state for creating new item
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    item_code: "",
    item_name: "",
    category: "",
    description: "",
    purpose: "",
    specifications: "",
    legend: "GIVEAWAY" as
      | "GIVEAWAY"
      | "MERCH"
      | "PROMO"
      | "AD_MATERIALS"
      | "POINT_OF_SALE"
      | "ASSET"
      | "OTHERS",
    pricing_type: "FIXED" as
      | "FIXED"
      | "PER_SQFT"
      | "PER_INVOICE"
      | "PER_DAY"
      | "PER_EU_SRP",
    points: "",
    price: "",
    min_order_qty: "1",
    max_order_qty: "",
    stock: "0",
    has_stock: true,
    requires_sales_approval: true,
    points_multiplier: "",
    price_multiplier: "",
  });

  const [editItem, setEditItem] = useState({
    item_code: "",
    item_name: "",
    category: "",
    description: "",
    purpose: "",
    specifications: "",
    legend: "GIVEAWAY" as
      | "GIVEAWAY"
      | "MERCH"
      | "PROMO"
      | "AD_MATERIALS"
      | "POINT_OF_SALE"
      | "ASSET"
      | "OTHERS",
    pricing_type: "FIXED" as
      | "FIXED"
      | "PER_SQFT"
      | "PER_INVOICE"
      | "PER_DAY"
      | "PER_EU_SRP",
    points: "",
    price: "",
    min_order_qty: "1",
    max_order_qty: "",
    stock: "",
    has_stock: true,
    requires_sales_approval: true,
    points_multiplier: "",
    price_multiplier: "",
  });

  // Modal state for edit/view/delete
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [viewTarget, setViewTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Additional modal state for product/variant operations
  const [viewProductTarget, setViewProductTarget] = useState<Product | null>(
    null,
  );
  const [showViewProductModal, setShowViewProductModal] = useState(false);
  const [editVariantTarget, setEditVariantTarget] = useState<Product | null>(
    null,
  );
  const [editVariantData, setEditVariantData] = useState({
    item_code: "",
    category: "",
    points: "",
    price: "",
    pricing_type: "FIXED" as
      | "FIXED"
      | "PER_SQFT"
      | "PER_INVOICE"
      | "PER_DAY"
      | "PER_EU_SRP",
    points_multiplier: "",
    price_multiplier: "",
  });
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [editVariantError, setEditVariantError] = useState<string | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] =
    useState<Product | null>(null);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [updatingVariant, setUpdatingVariant] = useState(false);

  // Handle create item submission
  const handleCreateItem = async () => {
    setCreateError(null);

    // Validation
    if (!newItem.item_code.trim()) {
      setCreateError("Item code is required");
      return;
    }
    if (!newItem.item_name.trim()) {
      setCreateError("Item name is required");
      return;
    }
    if (!newItem.legend) {
      setCreateError("Legend is required");
      return;
    }

    const isFixed = newItem.pricing_type === "FIXED";
    if (isFixed) {
      if (!newItem.points.trim()) {
        setCreateError("Points is required");
        return;
      }
      if (!newItem.price.trim()) {
        setCreateError("Price is required");
        return;
      }
    } else {
      if (!newItem.points_multiplier.trim()) {
        setCreateError("Points multiplier is required");
        return;
      }
      if (!newItem.price_multiplier.trim()) {
        setCreateError("Price multiplier is required");
        return;
      }
    }

    try {
      setCreating(true);

      const payload = {
        item_code: newItem.item_code,
        item_name: newItem.item_name,
        category: newItem.category || "",
        description: newItem.description,
        purpose: newItem.purpose,
        specifications: newItem.specifications,
        legend: newItem.legend,
        pricing_type: newItem.pricing_type,
        points: isFixed
          ? parseFloat(newItem.points)
          : parseFloat(newItem.points_multiplier),
        price: isFixed
          ? parseFloat(newItem.price)
          : parseFloat(newItem.price_multiplier),
        min_order_qty: parseInt(newItem.min_order_qty) || 1,
        max_order_qty: newItem.max_order_qty
          ? parseInt(newItem.max_order_qty)
          : null,
        stock: parseInt(newItem.stock) || 0,
        has_stock: newItem.has_stock,
        requires_sales_approval: newItem.requires_sales_approval,
      };

      console.log("[Catalogue] Creating product (POST) payload:", payload);
      const response = await fetch(`${API_URL}/catalogue/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("[Catalogue] POST response status:", response.status);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.details?.item_name?.[0] ||
            data.details?.item_code?.[0] ||
            data.error ||
            "Failed to create product",
        );
      }

      // Success: reset form and close modal
      setNewItem({
        item_code: "",
        item_name: "",
        category: "",
        description: "",
        purpose: "",
        specifications: "",
        legend: "GIVEAWAY",
        pricing_type: "FIXED",
        points: "",
        price: "",
        min_order_qty: "1",
        max_order_qty: "",
        stock: "0",
        has_stock: true,
        requires_sales_approval: true,
        points_multiplier: "",
        price_multiplier: "",
      });
      setShowCreateModal(false);
      setCreateError(null);

      // Refresh items list
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error creating product:", err);
      setCreateError(
        err instanceof Error ? err.message : "Failed to create product",
      );
    } finally {
      setCreating(false);
    }
  };

  // Handle edit click
  const handleEditClick = async (item: Product) => {
    setEditingProductId(item.id);
    setShowEditModal(true);
    setEditError(null);

    // Populate edit form with selected product's data
    const isFixed = item.pricing_type === "FIXED";
    setEditItem({
      item_code: item.item_code,
      item_name: item.item_name,
      category: item.category || "",
      description: item.description,
      purpose: item.purpose,
      specifications: item.specifications,
      legend: item.legend,
      pricing_type: item.pricing_type || "FIXED",
      points: isFixed ? item.points.toString() : "",
      price: isFixed ? item.price.toString() : "",
      min_order_qty: (item.min_order_qty ?? 1).toString(),
      max_order_qty: item.max_order_qty?.toString() ?? "",
      stock: item.stock?.toString() || "0",
      has_stock: item.has_stock ?? true,
      requires_sales_approval: item.requires_sales_approval ?? true,
      points_multiplier: !isFixed ? item.points.toString() : "",
      price_multiplier: !isFixed ? item.price.toString() : "",
    });
  };

  // Handle update item
  const handleUpdateItem = async () => {
    if (!editingProductId) return;

    setEditError(null);

    // Validation
    if (!editItem.item_code.trim()) {
      setEditError("Item code is required");
      return;
    }
    if (!editItem.item_name.trim()) {
      setEditError("Item name is required");
      return;
    }
    if (!editItem.legend) {
      setEditError("Legend is required");
      return;
    }

    const isFixed = editItem.pricing_type === "FIXED";
    if (isFixed) {
      if (!editItem.points.trim()) {
        setEditError("Points is required");
        return;
      }
      if (!editItem.price.trim()) {
        setEditError("Price is required");
        return;
      }
    } else {
      if (!editItem.points_multiplier.trim()) {
        setEditError("Points multiplier is required");
        return;
      }
      if (!editItem.price_multiplier.trim()) {
        setEditError("Price multiplier is required");
        return;
      }
    }

    try {
      setUpdating(true);

      const payload = {
        item_code: editItem.item_code,
        item_name: editItem.item_name,
        category: editItem.category || "",
        description: editItem.description,
        purpose: editItem.purpose,
        specifications: editItem.specifications,
        legend: editItem.legend,
        pricing_type: editItem.pricing_type,
        points: isFixed
          ? parseFloat(editItem.points)
          : parseFloat(editItem.points_multiplier),
        price: isFixed
          ? parseFloat(editItem.price)
          : parseFloat(editItem.price_multiplier),
        min_order_qty: parseInt(editItem.min_order_qty) || 1,
        max_order_qty: editItem.max_order_qty
          ? parseInt(editItem.max_order_qty)
          : null,
        stock: parseInt(editItem.stock) || 0,
        has_stock: editItem.has_stock,
        requires_sales_approval: editItem.requires_sales_approval ?? true,
      };

      console.log(
        "[Catalogue] Updating product (PATCH) id=",
        editingProductId,
        " payload:",
        payload,
      );

      const response = await fetch(`/api/catalogue/${editingProductId}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("[Catalogue] PATCH response status:", response.status);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.item_code?.[0] ||
            data.item_name?.[0] ||
            data.error ||
            "Failed to update product",
        );
      }

      setShowEditModal(false);
      setEditingProductId(null);
      setEditError(null);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error updating product:", err);
      setEditError(
        err instanceof Error ? err.message : "Failed to update product",
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handle view click
  const handleViewClick = async (item: Product) => {
    setViewTarget(item);
    setShowViewModal(true);
  };

  // Handle delete with modal
  const handleDeleteClick = (item: Product) => {
    setDeleteTarget(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      console.log("[Catalogue] Deleting product (DELETE) id=", deleteTarget.id);
      const response = await fetch(`/api/catalogue/${deleteTarget.id}/`, {
        method: "DELETE",
        credentials: "include",
      });
      console.log("[Catalogue] DELETE response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleViewProductClick = (product: Product) => {
    setViewProductTarget(product);
    setShowViewProductModal(true);
  };

  const handleEditVariantClick = (product: Product) => {
    setEditVariantTarget(product);
    setEditVariantData({
      item_code: product.item_code,
      category: product.category || "",
      points: product.points,
      price: product.price,
      pricing_type: product.pricing_type || "FIXED",
      points_multiplier: "",
      price_multiplier: "",
    });
    setShowEditVariantModal(true);
    setEditVariantError(null);
  };

  const handleDeleteProductClick = (product: Product) => {
    setDeleteProductTarget(product);
    setShowDeleteProductModal(true);
  };

  const handleUpdateVariant = async () => {
    if (!editVariantTarget) return;
    setEditVariantError(null);

    const isFixed = editVariantData.pricing_type === "FIXED";

    // Validation
    if (!editVariantData.item_code.trim()) {
      setEditVariantError("Item code is required");
      return;
    }

    // Validate based on pricing type
    if (isFixed) {
      if (!editVariantData.points.toString().trim()) {
        setEditVariantError("Points is required");
        return;
      }
      if (!editVariantData.price.toString().trim()) {
        setEditVariantError("Price is required");
        return;
      }
    } else {
      if (!editVariantData.points_multiplier.toString().trim()) {
        setEditVariantError("Points multiplier is required");
        return;
      }
      if (!editVariantData.price_multiplier.toString().trim()) {
        setEditVariantError("Price multiplier is required");
        return;
      }
    }

    try {
      setUpdatingVariant(true);

      // Build payload based on pricing type
      const payload: Record<string, unknown> = {
        item_code: editVariantData.item_code,
        category: editVariantData.category || null,
        pricing_type: editVariantData.pricing_type || "FIXED",
      };

      if (isFixed) {
        payload.points = editVariantData.points;
        payload.price = editVariantData.price;
        payload.points_multiplier = null;
        payload.price_multiplier = null;
      } else {
        payload.points = editVariantData.points_multiplier; // Backend may use points field
        payload.price = editVariantData.price_multiplier; // Backend may use price field
        payload.points_multiplier = editVariantData.points_multiplier;
        payload.price_multiplier = editVariantData.price_multiplier;
      }

      const response = await fetch(`/api/catalogue/${editVariantTarget.id}/`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update product");
      }
      setShowEditVariantModal(false);
      setEditVariantTarget(null);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error updating product:", err);
      setEditVariantError(
        err instanceof Error ? err.message : "Failed to update product",
      );
    } finally {
      setUpdatingVariant(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    try {
      const response = await fetch(
        `/api/catalogue/${deleteProductTarget.id}/`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      setShowDeleteProductModal(false);
      setDeleteProductTarget(null);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product. Please try again.");
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
              <Warehouse className="h-5 w-5" />
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
              <h1 className="text-3xl font-semibold">Catalogue</h1>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View and manage the catalogue of redeemable items.
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

          {/* Table */}
          <CatalogueTable
            products={items}
            loading={loading}
            onView={handleViewClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onCreateNew={() => setShowCreateModal(true)}
            onRefresh={fetchCatalogueItems}
            refreshing={loading}
            onExport={() => setShowExportModal(true)}
          />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24">
          <h2 className="text-2xl font-semibold mb-2">Catalogue</h2>
          <p
            className={`text-xs mb-4 ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Manage catalogue items
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
              Add Item
            </button>
          </div>

          {/* Mobile Cards and Pagination */}
          <CatalogueMobileCards
            products={items}
            loading={loading}
            error={error}
            onView={handleViewClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onRetry={fetchCatalogueItems}
            searchQuery={searchQuery}
          />

          {items.length > 0 && (
            <CataloguePagination
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

      <CreateItemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        creating={creating}
        error={createError}
        onConfirm={handleCreateItem}
      />

      <EditItemModal
        isOpen={showEditModal && !!editingProductId}
        onClose={() => setShowEditModal(false)}
        editItem={editItem}
        setEditItem={setEditItem}
        updating={updating}
        error={editError}
        onConfirm={handleUpdateItem}
      />

      <ViewItemModal
        isOpen={showViewModal && !!viewTarget}
        onClose={() => {
          setShowViewModal(false);
          setViewTarget(null);
        }}
        product={viewTarget}
      />

      <DeleteItemModal
        isOpen={showDeleteModal && !!deleteTarget}
        onClose={() => setShowDeleteModal(false)}
        item={deleteTarget}
        onConfirm={confirmDelete}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        items={items}
      />
    </div>
  );
}

export default Catalogue;
