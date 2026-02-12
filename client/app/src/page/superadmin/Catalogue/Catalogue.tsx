import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/config";
import { fetchWithCsrf } from "@/lib/csrf";
import {
  Search,
  Plus,
} from "lucide-react";
import type { Product, User } from "./modals";
import {
  CreateItemModal,
  EditItemModal,
  ViewItemModal,
  ArchiveItemModal,
  UnarchiveItemModal,
  BulkArchiveItemModal,
  ExportModal,
} from "./modals";
import {
  CatalogueTable,
  CatalogueMobileCards,
  CataloguePagination,
} from "./components";

function Catalogue() {
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
      image: null,
      is_archived: false,
      date_added: new Date().toISOString().split("T")[0],
      added_by: null,
      date_archived: null,
      archived_by: null,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [_users, setUsers] = useState<User[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | "ALL">(15);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch catalogue items from API
  useEffect(() => {
    fetchCatalogueItems();
  }, [page, rowsPerPage, searchQuery, showArchived]);

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
      if (showArchived) {
        params.append("show_archived", "true");
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
        image: product.image || null,
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
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(null);
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

  // Modal state for edit/view/archive
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [showBulkArchiveModal, setShowBulkArchiveModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [viewTarget, setViewTarget] = useState<Product | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);
  const [unarchiveTarget, setUnarchiveTarget] = useState<Product | null>(null);
  const [bulkArchiveTargets, setBulkArchiveTargets] = useState<Product[]>([]);
  const [archiving, setArchiving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editCurrentImage, setEditCurrentImage] = useState<string | null>(null);
  const [editImageRemoved, setEditImageRemoved] = useState(false);

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
  const [deleteProductTarget, _setDeleteProductTarget] =
    useState<Product | null>(null);
  const [showDeleteProductModal, _setShowDeleteProductModal] = useState(false);
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

      // Build FormData for multipart upload (supports image)
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      if (createImageFile) {
        formData.append('image', createImageFile);
      }

      console.log("[Catalogue] Creating product (POST) payload:", payload);
      const response = await fetch(`${API_URL}/catalogue/`, {
        method: "POST",
        credentials: "include",
        body: formData,
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
      setCreateImageFile(null);
      setCreateImagePreview(null);

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
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditCurrentImage(item.image || null);
    setEditImageRemoved(false);
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

      // Build FormData for multipart upload (supports image)
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      if (editImageFile) {
        formData.append('image', editImageFile);
      } else if (editImageRemoved) {
        formData.append('remove_image', 'true');
      }

      console.log(
        "[Catalogue] Updating product (PATCH) id=",
        editingProductId,
        " payload:",
        payload,
      );

      const response = await fetchWithCsrf(`/api/catalogue/${editingProductId}/`, {
        method: "PATCH",
        body: formData,
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

  // Handle archive with modal
  const handleArchiveClick = (item: Product) => {
    setArchiveTarget(item);
    setShowArchiveModal(true);
  };

  // Handle unarchive with modal
  const handleUnarchiveClick = (item: Product) => {
    setUnarchiveTarget(item);
    setShowUnarchiveModal(true);
  };

  // Handle bulk archive
  const handleBulkArchiveClick = (items: Product[]) => {
    const activeItems = items.filter((item) => !item.is_archived);
    if (activeItems.length === 0) return;
    setBulkArchiveTargets(activeItems);
    setShowBulkArchiveModal(true);
  };

  const confirmArchive = async (id: number) => {
    try {
      setArchiving(true);
      console.log("[Catalogue] Archiving product (DELETE) id=", id);
      const response = await fetchWithCsrf(`/api/catalogue/${id}/`, {
        method: "DELETE",
      });
      console.log("[Catalogue] DELETE response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to archive product");
      }

      const data = await response.json();
      if (data.warning) {
        alert(data.warning);
      }

      setShowArchiveModal(false);
      setArchiveTarget(null);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error archiving product:", err);
      alert("Failed to archive product. Please try again.");
    } finally {
      setArchiving(false);
    }
  };

  const confirmUnarchive = async (id: number) => {
    try {
      setArchiving(true);
      console.log("[Catalogue] Unarchiving product (POST) id=", id);
      const response = await fetchWithCsrf(`/api/catalogue/${id}/unarchive/`, {
        method: "POST",
      });
      console.log("[Catalogue] Unarchive response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to restore product");
      }

      setShowUnarchiveModal(false);
      setUnarchiveTarget(null);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error restoring product:", err);
      alert("Failed to restore product. Please try again.");
    } finally {
      setArchiving(false);
    }
  };

  const confirmBulkArchive = async () => {
    try {
      setArchiving(true);
      for (const item of bulkArchiveTargets) {
        const response = await fetchWithCsrf(`/api/catalogue/${item.id}/`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`Failed to archive product ${item.item_name}`);
        }
      }
      setShowBulkArchiveModal(false);
      setBulkArchiveTargets([]);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error bulk archiving products:", err);
      alert("Failed to archive some products. Please try again.");
    } finally {
      setArchiving(false);
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

  const handleDeleteProductClick = (_product: Product) => {
    // Dead code — kept for backward compatibility but not rendered
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

      const response = await fetchWithCsrf(`/api/catalogue/${editVariantTarget.id}/`, {
        method: "PUT",
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
    // Dead code — kept for backward compatibility but not called
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Catalogue</h1>
            <p className="text-sm text-muted-foreground">
              View and manage the catalogue of redeemable items.
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

        {/* Table */}
        <CatalogueTable
          products={items}
          loading={loading}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onArchive={handleArchiveClick}
          onUnarchive={handleUnarchiveClick}
          onArchiveSelected={handleBulkArchiveClick}
          onCreateNew={() => setShowCreateModal(true)}
          onRefresh={fetchCatalogueItems}
          refreshing={loading}
          onExport={() => setShowExportModal(true)}
        />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24">
        <h2 className="text-2xl font-semibold mb-2">Catalogue</h2>
        <p className="text-xs mb-4 text-muted-foreground">
          Manage catalogue items
        </p>

        {/* Mobile Search */}
        <div className="mb-4">
          <div className="relative flex items-center rounded-lg border bg-card border-border">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search....."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full text-sm bg-transparent border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 border text-sm font-semibold transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>

        <div className="mb-4">
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

        {/* Mobile Cards and Pagination */}
        <CatalogueMobileCards
          products={items}
          loading={loading}
          error={error}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onArchive={handleArchiveClick}
          onUnarchive={handleUnarchiveClick}
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

      <CreateItemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        creating={creating}
        error={createError}
        onConfirm={handleCreateItem}
        imageFile={createImageFile}
        imagePreview={createImagePreview}
        onImageSelect={(file) => {
          setCreateImageFile(file);
          if (file) {
            setCreateImagePreview(URL.createObjectURL(file));
          } else {
            setCreateImagePreview(null);
          }
        }}
        onImageRemove={() => {
          setCreateImageFile(null);
          setCreateImagePreview(null);
        }}
      />

      <EditItemModal
        isOpen={showEditModal && !!editingProductId}
        onClose={() => setShowEditModal(false)}
        editItem={editItem}
        setEditItem={setEditItem}
        updating={updating}
        error={editError}
        onConfirm={handleUpdateItem}
        currentImage={editCurrentImage}
        imageFile={editImageFile}
        imagePreview={editImagePreview}
        onImageSelect={(file) => {
          setEditImageFile(file);
          setEditImageRemoved(false);
          if (file) {
            setEditImagePreview(URL.createObjectURL(file));
          } else {
            setEditImagePreview(null);
          }
        }}
        onImageRemove={() => {
          setEditImageFile(null);
          setEditImagePreview(null);
          setEditCurrentImage(null);
          setEditImageRemoved(true);
        }}
      />

      <ViewItemModal
        isOpen={showViewModal && !!viewTarget}
        onClose={() => {
          setShowViewModal(false);
          setViewTarget(null);
        }}
        product={viewTarget}
      />

      <ArchiveItemModal
        isOpen={showArchiveModal && !!archiveTarget}
        onClose={() => {
          setShowArchiveModal(false);
          setArchiveTarget(null);
        }}
        item={archiveTarget}
        loading={archiving}
        onConfirm={confirmArchive}
      />

      <UnarchiveItemModal
        isOpen={showUnarchiveModal && !!unarchiveTarget}
        onClose={() => {
          setShowUnarchiveModal(false);
          setUnarchiveTarget(null);
        }}
        item={unarchiveTarget}
        loading={archiving}
        onConfirm={confirmUnarchive}
      />

      <BulkArchiveItemModal
        isOpen={showBulkArchiveModal && bulkArchiveTargets.length > 0}
        onClose={() => {
          setShowBulkArchiveModal(false);
          setBulkArchiveTargets([]);
        }}
        items={bulkArchiveTargets}
        loading={archiving}
        onConfirm={confirmBulkArchive}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        items={items}
      />
    </>
  );
}

export default Catalogue;
