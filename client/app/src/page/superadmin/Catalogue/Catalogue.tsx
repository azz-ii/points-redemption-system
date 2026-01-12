import { useState, useEffect } from "react";
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
  Sliders,
  Plus,
  Warehouse,
  LogOut,
  RotateCw,
} from "lucide-react";
import type { CatalogueItem, Variant, CatalogueVariant } from "./modals";
import {
  CreateItemModal,
  EditItemModal,
  ViewItemModal,
  DeleteItemModal,
  ViewVariantModal,
  EditVariantModal,
  DeleteVariantModal,
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
  const [items, setItems] = useState<CatalogueVariant[]>([
    {
      id: "1",
      catalogue_item_id: 1,
      reward: null,
      item_name: "Platinum Polo",
      item_code: "MC3001",
      description:
        "A high-quality polo shirt made from premium platinum fabric with lasting charm and style.",
      purpose:
        "Ideal for casual wear, company events, or as a stylish uniform piece.",
      specifications:
        "Material: 100% Platinum Cotton, Fit: Modern Fit, Color: Ribbed Polo Collar, Sleeves: Short sleeves with ribbed armbands",
      option_description:
        "Available in sizes S, M, L, XL and colors Black, White, and Navy Blue.",
      points: "500",
      price: "1200",
      legend: "ASSET",
      image_url: null,
      is_archived: false,
      date_added: new Date().toISOString().split("T")[0], // Add this
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | "ALL">(15);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch catalogue items from API
  useEffect(() => {
    fetchCatalogueItems();
  }, [page, rowsPerPage, searchQuery]);

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
      console.log("[Catalogue] Fetching catalogue items (GET) -> url=", url);
      const response = await fetch(url, {
        credentials: "include",
      });
      console.log("[Catalogue] GET response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch catalogue items");
      }

      const data = await response.json();
      // Handle paginated response format: { count, next, previous, results }
      const variants = data.results || [];
      setTotalCount(data.count || 0);

      const flattenedItems: CatalogueVariant[] = variants.map(
        (variant: Variant) => ({
          id: variant.id.toString(),
          catalogue_item_id: variant.catalogue_item.id,
          reward: variant.catalogue_item.reward,
          item_name: variant.catalogue_item.item_name,
          item_code: variant.item_code,
          description: variant.catalogue_item.description,
          purpose: variant.catalogue_item.purpose,
          specifications: variant.catalogue_item.specifications,
          option_description: variant.option_description,
          points: variant.points,
          price: variant.price,
          legend: variant.catalogue_item.legend,
          image_url: variant.image_url,
          is_archived: variant.catalogue_item.is_archived,
          date_added: variant.catalogue_item.date_added,
        })
      );
      setItems(flattenedItems);
      setError(null);
    } catch (err) {
      console.error("Error fetching catalogue items:", err);
      setError("Failed to load catalogue items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Group variants by catalogue_item_id (items are already filtered server-side)
  const groupedItems = items.reduce((acc, item) => {
    const catalogueItemId = item.catalogue_item_id;
    if (!acc[catalogueItemId]) {
      acc[catalogueItemId] = {
        catalogueItem: {
          id: catalogueItemId,
          item_name: item.item_name,
          description: item.description,
          purpose: item.purpose,
          specifications: item.specifications,
          legend: item.legend,
          reward: item.reward,
          is_archived: item.is_archived,
          date_added: item.date_added,
        },
        variants: [],
      };
    }
    acc[catalogueItemId].variants.push(item);
    return acc;
  }, {} as Record<number, { catalogueItem: { id: number; item_name: string; description: string; purpose: string; specifications: string; legend: string; reward: string | null; is_archived: boolean; date_added: string }; variants: CatalogueVariant[] }>);

  const groupedItemsArray = Object.values(groupedItems);

  // Pagination logic using server-side count
  // Note: We're paginating at variant level on server, but displaying grouped items
  const totalPages =
    rowsPerPage === "ALL"
      ? 1
      : Math.max(1, Math.ceil(totalCount / (rowsPerPage as number)));
  const safePage = Math.min(page, totalPages);
  const paginatedGroupedItems = groupedItemsArray;

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Toggle row expansion
  const toggleRow = (catalogueItemId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(catalogueItemId)) {
        newSet.delete(catalogueItemId);
      } else {
        newSet.add(catalogueItemId);
      }
      return newSet;
    });
  };

  // Modal and form state for creating new item
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    reward: "",
    item_name: "",
    description: "",
    purpose: "",
    specifications: "",
    legend: "GIVEAWAY" as "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT",
    variants: [
      {
        item_code: "",
        option_description: "",
        points: "",
        price: "",
        image_url: "",
      },
    ],
  });

  const [editItem, setEditItem] = useState({
    reward: "",
    item_name: "",
    description: "",
    purpose: "",
    specifications: "",
    legend: "GIVEAWAY" as "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT",
    variants: [
      {
        id: null as number | null,
        item_code: "",
        option_description: "",
        points: "",
        price: "",
        image_url: "",
      },
    ],
  });

  // Modal state for edit/view/delete
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCatalogueItemId, setEditingCatalogueItemId] = useState<
    number | null
  >(null);
  const [viewTarget, setViewTarget] = useState<CatalogueVariant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogueVariant | null>(
    null
  );
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [loadingViewVariants, setLoadingViewVariants] = useState(false);
  const [viewVariants, setViewVariants] = useState<Variant[]>([]);

  const [showViewVariantModal, setShowViewVariantModal] = useState(false);
  const [viewVariantTarget, setViewVariantTarget] =
    useState<CatalogueVariant | null>(null);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [editVariantTarget, setEditVariantTarget] =
    useState<CatalogueVariant | null>(null);
  const [showDeleteVariantModal, setShowDeleteVariantModal] = useState(false);
  const [deleteVariantTarget, setDeleteVariantTarget] =
    useState<CatalogueVariant | null>(null);
  const [editVariantError, setEditVariantError] = useState<string | null>(null);
  const [updatingVariant, setUpdatingVariant] = useState(false);
  const [editVariantData, setEditVariantData] = useState({
    item_code: "",
    option_description: "",
    points: "",
    price: "",
    image_url: "",
  });

  // Handle create item submission
  const handleCreateItem = async () => {
    setCreateError(null);

    // Validation
    if (!newItem.item_name.trim()) {
      setCreateError("Item name is required");
      return;
    }
    if (!newItem.legend) {
      setCreateError("Category is required");
      return;
    }
    if (newItem.variants.length === 0) {
      setCreateError("At least one variant is required");
      return;
    }
    for (let i = 0; i < newItem.variants.length; i++) {
      const variant = newItem.variants[i];
      if (!variant.item_code.trim()) {
        setCreateError(`Variant ${i + 1}: Item code is required`);
        return;
      }
      if (!variant.points.trim()) {
        setCreateError(`Variant ${i + 1}: Points is required`);
        return;
      }
      if (!variant.price.trim()) {
        setCreateError(`Variant ${i + 1}: Price is required`);
        return;
      }
    }

    try {
      setCreating(true);
      const payload = {
        reward: newItem.reward || null,
        item_name: newItem.item_name,
        description: newItem.description,
        purpose: newItem.purpose,
        specifications: newItem.specifications,
        legend: newItem.legend,
        variants: newItem.variants.map((v) => ({
          item_code: v.item_code,
          option_description: v.option_description || null,
          points: v.points,
          price: v.price,
          image_url: v.image_url || null,
        })),
      };
      console.log("[Catalogue] Creating item (POST) payload:", payload);
      const response = await fetch("/api/catalogue/", {
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
            "Failed to create item"
        );
      }

      // Success: reset form and close modal
      setNewItem({
        reward: "",
        item_name: "",
        description: "",
        purpose: "",
        specifications: "",
        legend: "GIVEAWAY",
        variants: [
          {
            item_code: "",
            option_description: "",
            points: "",
            price: "",
            image_url: "",
          },
        ],
      });
      setShowCreateModal(false);
      setCreateError(null);

      // Refresh items list
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error creating item:", err);
      setCreateError(
        err instanceof Error ? err.message : "Failed to create item"
      );
    } finally {
      setCreating(false);
    }
  };

  // Handle edit click
  const handleEditClick = async (item: CatalogueVariant) => {
    setEditingCatalogueItemId(item.catalogue_item_id);
    setLoadingVariants(true);
    setShowEditModal(true);
    setEditError(null);

    try {
      // Fetch all variants for this catalogue item (use large page_size to get all)
      const response = await fetch(`/api/catalogue/?page_size=1000`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch catalogue items");
      }

      const data = await response.json();
      const allVariants = (data.results || []).filter(
        (v: Variant) => v.catalogue_item.id === item.catalogue_item_id
      );

      if (allVariants.length > 0) {
        const catalogueItem = allVariants[0].catalogue_item;
        setEditItem({
          reward: catalogueItem.reward || "",
          item_name: catalogueItem.item_name,
          description: catalogueItem.description,
          purpose: catalogueItem.purpose,
          specifications: catalogueItem.specifications,
          legend: catalogueItem.legend,
          variants: allVariants.map((v: Variant) => ({
            id: v.id,
            item_code: v.item_code,
            option_description: v.option_description || "",
            points: v.points,
            price: v.price,
            image_url: v.image_url || "",
          })),
        });
      }
    } catch (err) {
      console.error("Error fetching variants:", err);
      setEditError("Failed to load variants. Please try again.");
    } finally {
      setLoadingVariants(false);
    }
  };

  // Handle update item
  const handleUpdateItem = async () => {
    if (!editingCatalogueItemId) return;

    setEditError(null);

    // Validation
    if (!editItem.item_name.trim()) {
      setEditError("Item name is required");
      return;
    }
    if (!editItem.legend) {
      setEditError("Category is required");
      return;
    }
    if (editItem.variants.length === 0) {
      setEditError("At least one variant is required");
      return;
    }
    for (let i = 0; i < editItem.variants.length; i++) {
      const variant = editItem.variants[i];
      if (!variant.item_code.trim()) {
        setEditError(`Variant ${i + 1}: Item code is required`);
        return;
      }
      if (!variant.points.trim()) {
        setEditError(`Variant ${i + 1}: Points is required`);
        return;
      }
      if (!variant.price.trim()) {
        setEditError(`Variant ${i + 1}: Price is required`);
        return;
      }
    }

    try {
      setUpdating(true);
      const updatePayload = {
        reward: editItem.reward || null,
        item_name: editItem.item_name,
        description: editItem.description,
        purpose: editItem.purpose,
        specifications: editItem.specifications,
        legend: editItem.legend,
        variants: editItem.variants.map((v) => ({
          id: v.id,
          item_code: v.item_code,
          option_description: v.option_description || null,
          points: v.points,
          price: v.price,
          image_url: v.image_url || null,
        })),
      };
      console.log(
        "[Catalogue] Updating item (PUT) id=",
        editingCatalogueItemId,
        " payload:",
        updatePayload
      );
      const response = await fetch(
        `/api/catalogue/item/${editingCatalogueItemId}/`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );
      console.log("[Catalogue] PUT response status:", response.status);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.details?.item_name?.[0] ||
            data.details?.item_code?.[0] ||
            data.error ||
            "Failed to update item"
        );
      }

      setShowEditModal(false);
      setEditingCatalogueItemId(null);
      setEditError(null);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error updating item:", err);
      setEditError(
        err instanceof Error ? err.message : "Failed to update item"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Handle view click
  const handleViewClick = async (item: CatalogueVariant) => {
    setViewTarget(item);
    setViewVariants([]); // Reset variants before loading
    setLoadingViewVariants(true);
    setShowViewModal(true);

    try {
      // Fetch all variants for this catalogue item (use large page_size to get all)
      const response = await fetch(`/api/catalogue/?page_size=1000`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch catalogue items");
      }

      const data = await response.json();
      const allVariants = (data.results || []).filter(
        (v: Variant) => v.catalogue_item.id === item.catalogue_item_id
      );

      setViewVariants(allVariants);
    } catch (err) {
      console.error("Error fetching variants for view:", err);
    } finally {
      setLoadingViewVariants(false);
    }
  };

  // Handle delete with modal
  const handleDeleteClick = (item: CatalogueVariant) => {
    setDeleteTarget(item);
    setShowDeleteModal(true);
  };

  // Add variant to edit item
  const addEditVariant = () => {
    setEditItem({
      ...editItem,
      variants: [
        ...editItem.variants,
        {
          id: null,
          item_code: "",
          option_description: "",
          points: "",
          price: "",
          image_url: "",
        },
      ],
    });
  };

  // Remove variant from edit item
  const removeEditVariant = (index: number) => {
    setEditItem({
      ...editItem,
      variants: editItem.variants.filter((_, i) => i !== index),
    });
  };

  // Update variant in edit item
  const updateEditVariant = (index: number, field: string, value: string) => {
    const updatedVariants = editItem.variants.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    setEditItem({ ...editItem, variants: updatedVariants });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      console.log("[Catalogue] Deleting item (DELETE) id=", deleteTarget.id);
      const response = await fetch(`/api/catalogue/${deleteTarget.id}/`, {
        method: "DELETE",
        credentials: "include",
      });
      console.log("[Catalogue] DELETE response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item. Please try again.");
    }
  };

  const handleViewVariantClick = (variant: CatalogueVariant) => {
    setViewVariantTarget(variant);
    setShowViewVariantModal(true);
  };

  const handleEditVariantClick = (variant: CatalogueVariant) => {
    setEditVariantTarget(variant);
    setEditVariantData({
      item_code: variant.item_code,
      option_description: variant.option_description || "",
      points: variant.points,
      price: variant.price,
      image_url: variant.image_url || "",
    });
    setShowEditVariantModal(true);
    setEditVariantError(null);
  };

  const handleDeleteVariantClick = (variant: CatalogueVariant) => {
    setDeleteVariantTarget(variant);
    setShowDeleteVariantModal(true);
  };

  const handleUpdateVariant = async () => {
    if (!editVariantTarget) return;
    setEditVariantError(null);
    // Validation
    if (!editVariantData.item_code.trim()) {
      setEditVariantError("Item code is required");
      return;
    }
    if (!editVariantData.points.trim()) {
      setEditVariantError("Points is required");
      return;
    }
    if (!editVariantData.price.trim()) {
      setEditVariantError("Price is required");
      return;
    }
    try {
      setUpdatingVariant(true);
      const response = await fetch(`/api/catalogue/${editVariantTarget.id}/`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_code: editVariantData.item_code,
          option_description: editVariantData.option_description || null,
          points: editVariantData.points,
          price: editVariantData.price,
          image_url: editVariantData.image_url || null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update variant");
      }
      setShowEditVariantModal(false);
      setEditVariantTarget(null);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error updating variant:", err);
      setEditVariantError(
        err instanceof Error ? err.message : "Failed to update variant"
      );
    } finally {
      setUpdatingVariant(false);
    }
  };

  const confirmDeleteVariant = async () => {
    if (!deleteVariantTarget) return;
    try {
      const response = await fetch(
        `/api/catalogue/${deleteVariantTarget.id}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete variant");
      }
      setShowDeleteVariantModal(false);
      setDeleteVariantTarget(null);
      fetchCatalogueItems();
    } catch (err) {
      console.error("Error deleting variant:", err);
      alert("Failed to delete variant. Please try again.");
    }
  };

  // Add variant to new item
  const addVariant = () => {
    setNewItem({
      ...newItem,
      variants: [
        ...newItem.variants,
        {
          item_code: "",
          option_description: "",
          points: "",
          price: "",
          image_url: "",
        },
      ],
    });
  };

  // Remove variant from new item
  const removeVariant = (index: number) => {
    setNewItem({
      ...newItem,
      variants: newItem.variants.filter((_, i) => i !== index),
    });
  };

  // Update variant in new item
  const updateVariant = (index: number, field: string, value: string) => {
    const updatedVariants = newItem.variants.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    setNewItem({ ...newItem, variants: updatedVariants });
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
                onClick={() => fetchCatalogueItems()}
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
                <span>Add Item</span>
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
            <CatalogueTable
              groupedItems={paginatedGroupedItems}
              loading={loading}
              error={error}
              expandedRows={expandedRows}
              onToggleRow={toggleRow}
              onViewItem={handleViewClick}
              onEditItem={handleEditClick}
              onDeleteItem={handleDeleteClick}
              onViewVariant={handleViewVariantClick}
              onEditVariant={handleEditVariantClick}
              onDeleteVariant={handleDeleteVariantClick}
              onRetry={fetchCatalogueItems}
              searchQuery={searchQuery}
            />

            <CataloguePagination
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
            groupedItems={paginatedGroupedItems}
            loading={loading}
            error={error}
            expandedRows={expandedRows}
            onToggleRow={toggleRow}
            onViewItem={handleViewClick}
            onEditItem={handleEditClick}
            onDeleteItem={handleDeleteClick}
            onViewVariant={handleViewVariantClick}
            onEditVariant={handleEditVariantClick}
            onDeleteVariant={handleDeleteVariantClick}
            onRetry={fetchCatalogueItems}
            searchQuery={searchQuery}
          />

          {paginatedGroupedItems.length > 0 && (
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

      <MobileBottomNav />
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
        onAddVariant={addVariant}
        onRemoveVariant={removeVariant}
        onUpdateVariant={updateVariant}
      />

      <EditItemModal
        isOpen={showEditModal && !!editingCatalogueItemId}
        onClose={() => setShowEditModal(false)}
        editItem={editItem}
        setEditItem={setEditItem}
        loading={loadingVariants}
        updating={updating}
        error={editError}
        onConfirm={handleUpdateItem}
        onAddVariant={addEditVariant}
        onRemoveVariant={removeEditVariant}
        onUpdateVariant={updateEditVariant}
      />

      <ViewItemModal
        isOpen={showViewModal && !!viewTarget}
        onClose={() => {
          setShowViewModal(false);
          setViewTarget(null);
        }}
        viewVariants={viewVariants}
        loading={loadingViewVariants}
      />

      <DeleteItemModal
        isOpen={showDeleteModal && !!deleteTarget}
        onClose={() => setShowDeleteModal(false)}
        item={deleteTarget}
        onConfirm={confirmDelete}
      />

      <ViewVariantModal
        isOpen={showViewVariantModal && !!viewVariantTarget}
        onClose={() => setShowViewVariantModal(false)}
        variant={viewVariantTarget}
      />

      <EditVariantModal
        isOpen={showEditVariantModal && !!editVariantTarget}
        onClose={() => setShowEditVariantModal(false)}
        variant={editVariantTarget}
        data={editVariantData}
        setData={setEditVariantData}
        updating={updatingVariant}
        error={editVariantError}
        onConfirm={handleUpdateVariant}
      />

      <DeleteVariantModal
        isOpen={showDeleteVariantModal && !!deleteVariantTarget}
        onClose={() => setShowDeleteVariantModal(false)}
        variant={deleteVariantTarget}
        onConfirm={confirmDeleteVariant}
      />
    </div>
  );
}

export default Catalogue;
