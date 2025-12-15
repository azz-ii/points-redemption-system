import { useState, useEffect } from "react";
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
  Warehouse,
  X,
  LogOut,
  RotateCw,
  ArchiveX,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft
} from "lucide-react";

interface CatalogueItem {
  id: number;
  reward: string | null;
  item_name: string;
  description: string;
  purpose: string;
  specifications: string;
  legend: "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT";
  date_added: string;
  added_by: number | null;
  is_archived: boolean;
  date_archived: string | null;
  archived_by: number | null;
}

interface Variant {
  id: number;
  catalogue_item: CatalogueItem;
  item_code: string;
  option_description: string | null;
  points: string;
  price: string;
  image_url: string | null;
}

interface CatalogueVariant {
  id: string;
  catalogue_item_id: number;
  reward: string | null;
  item_name: string;
  item_code: string;
  description: string;
  purpose: string;
  specifications: string;
  option_description: string | null;
  points: string;
  price: string;
  legend: "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT";
  image_url: string | null;
  is_archived: boolean;
  date_added: string;
}

interface CatalogueProps {
  onNavigate?: (
    page:
      | "dashboard"
      | "history"
      | "accounts"
      | "catalogue"
      | "redemption"
      | "inventory"
  ) => void;
  onLogout?: () => void;
}

function Catalogue({ onNavigate, onLogout }: CatalogueProps) {
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
      option_description: "Available in sizes S, M, L, XL and colors Black, White, and Navy Blue.",
      points: "500",
      price: "1200",
      legend: "ASSET",
      image_url: null,
      is_archived: false,
      date_added: new Date().toISOString().split('T')[0], // Add this
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | "ALL">(15);

  // Fetch catalogue items from API
  useEffect(() => {
    fetchCatalogueItems();
  }, []);

  const fetchCatalogueItems = async () => {
    try {
      setLoading(true);
      console.log("[Catalogue] Fetching catalogue items (GET) -> url=/api/catalogue/");
      const response = await fetch("/api/catalogue/", {
        credentials: 'include',
      });
      console.log('[Catalogue] GET response status:', response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch catalogue items");
      }

      const data = await response.json();
      const flattenedItems: CatalogueVariant[] = (data.items || []).map((variant: Variant) => ({
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
      }));
      setItems(flattenedItems);
      setError(null);
    } catch (err) {
      console.error("Error fetching catalogue items:", err);
      setError("Failed to load catalogue items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getLegendColor = (legend: string) => {
    switch (legend) {
      case "COLLATERAL":
        return "bg-red-500 text-white";
      case "GIVEAWAY":
        return "bg-blue-500 text-white";
      case "ASSET":
        return "bg-yellow-500 text-black";
      case "BENEFIT":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.item_name.toLowerCase().includes(query) ||
      item.item_code.toLowerCase().includes(query) ||
      item.legend.toLowerCase().includes(query) ||
      (item.reward && item.reward.toLowerCase().includes(query))
    );
  });

  // Group variants by catalogue_item_id
  const groupedItems = filteredItems.reduce((acc, item) => {
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

  // Pagination logic
  const totalPages = rowsPerPage === "ALL" ? 1 : Math.max(1, Math.ceil(groupedItemsArray.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = rowsPerPage === "ALL" ? 0 : (safePage - 1) * rowsPerPage;
  const endIndex = rowsPerPage === "ALL" ? groupedItemsArray.length : startIndex + rowsPerPage;
  const paginatedGroupedItems = groupedItemsArray.slice(startIndex, endIndex);

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
    variants: [{ item_code: "", option_description: "", points: "", price: "", image_url: "" }],
  });

  const [editItem, setEditItem] = useState({
    reward: "",
    item_name: "",
    description: "",
    purpose: "",
    specifications: "",
    legend: "GIVEAWAY" as "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT",
    variants: [{ id: null as number | null, item_code: "", option_description: "", points: "", price: "", image_url: "" }],
  });

  // Modal state for edit/view/delete
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCatalogueItemId, setEditingCatalogueItemId] = useState<number | null>(null);
  const [viewTarget, setViewTarget] = useState<CatalogueVariant | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogueVariant | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [loadingViewVariants, setLoadingViewVariants] = useState(false);
  const [viewVariants, setViewVariants] = useState<Variant[]>([]);

  const [showViewVariantModal, setShowViewVariantModal] = useState(false);
  const [viewVariantTarget, setViewVariantTarget] = useState<CatalogueVariant | null>(null);
  const [showEditVariantModal, setShowEditVariantModal] = useState(false);
  const [editVariantTarget, setEditVariantTarget] = useState<CatalogueVariant | null>(null);
  const [showDeleteVariantModal, setShowDeleteVariantModal] = useState(false);
  const [deleteVariantTarget, setDeleteVariantTarget] = useState<CatalogueVariant | null>(null);
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
        variants: newItem.variants.map(v => ({
          item_code: v.item_code,
          option_description: v.option_description || null,
          points: v.points,
          price: v.price,
          image_url: v.image_url || null,
        })),
      };
      console.log('[Catalogue] Creating item (POST) payload:', payload);
      const response = await fetch("/api/catalogue/", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log('[Catalogue] POST response status:', response.status);

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
        variants: [{ item_code: "", option_description: "", points: "", price: "", image_url: "" }],
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
      // Fetch all variants for this catalogue item
      const response = await fetch(`/api/catalogue/`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch catalogue items");
      }

      const data = await response.json();
      const allVariants = (data.items || []).filter(
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
        variants: editItem.variants.map(v => ({
          id: v.id,
          item_code: v.item_code,
          option_description: v.option_description || null,
          points: v.points,
          price: v.price,
          image_url: v.image_url || null,
        })),
      };
      console.log('[Catalogue] Updating item (PUT) id=', editingCatalogueItemId, ' payload:', updatePayload);
      const response = await fetch(
        `/api/catalogue/item/${editingCatalogueItemId}/`,
        {
          method: "PUT",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );
      console.log('[Catalogue] PUT response status:', response.status);

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
    setLoadingViewVariants(true);
    setShowViewModal(true);

    try {
      // Fetch all variants for this catalogue item
      const response = await fetch(`/api/catalogue/`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch catalogue items");
      }

      const data = await response.json();
      const allVariants = (data.items || []).filter(
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
      variants: [...editItem.variants, { id: null, item_code: "", option_description: "", points: "", price: "", image_url: "" }],
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
      console.log('[Catalogue] Deleting item (DELETE) id=', deleteTarget.id);
      const response = await fetch(
        `/api/catalogue/${deleteTarget.id}/`,
        {
          method: "DELETE",
          credentials: 'include',
        }
      );
      console.log('[Catalogue] DELETE response status:', response.status);

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
        credentials: 'include',
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
      setEditVariantError(err instanceof Error ? err.message : "Failed to update variant");
    } finally {
      setUpdatingVariant(false);
    }
  };

  const confirmDeleteVariant = async () => {
    if (!deleteVariantTarget) return;
    try {
      const response = await fetch(`/api/catalogue/${deleteVariantTarget.id}/`, {
        method: "DELETE",
        credentials: 'include',
      });
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
      variants: [...newItem.variants, { item_code: "", option_description: "", points: "", price: "", image_url: "" }],
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
      <Sidebar
        currentPage="catalogue"
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
              <Warehouse className="h-5 w-5" />
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

          {/* Loading/Error States */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading catalogue items...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchCatalogueItems}
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
                      Item Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Reward
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Date Added
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Variants
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
                  {paginatedGroupedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No items match your search"
                            : "No catalogue items found"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedGroupedItems.map((group) => {
                      const isExpanded = expandedRows.has(group.catalogueItem.id);
                      const firstVariant = group.variants[0];
                      
                      return (
                        <>
                          {/* Main Row */}
                          <tr
                            key={`main-${group.catalogueItem.id}`}
                            className={`hover:${
                              resolvedTheme === "dark"
                                ? "bg-gray-800"
                                : "bg-gray-50"
                            } transition-colors`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleRow(group.catalogueItem.id)}
                                  className="hover:opacity-70 transition-opacity"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                                <span className="text-sm font-medium">
                                  {group.catalogueItem.item_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                                  group.catalogueItem.legend
                                )}`}
                              >
                                {group.catalogueItem.legend}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {group.catalogueItem.reward || "-"}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {group.catalogueItem.description.length > 50
                                ? group.catalogueItem.description.substring(0, 50) + "..."
                                : group.catalogueItem.description}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {new Date(group.catalogueItem.date_added).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  group.catalogueItem.is_archived
                                    ? "bg-red-500 text-white"
                                    : "bg-green-500 text-white"
                                }`}
                              >
                                {group.catalogueItem.is_archived ? "Archived" : "Active"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {group.variants.length} variant{group.variants.length !== 1 ? 's' : ''}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleViewClick(firstVariant)}
                                  className="px-4 py-2 rounded flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => handleEditClick(firstVariant)}
                                  className="px-4 py-2 rounded flex items-center bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>

                                <button
                                  onClick={() => handleDeleteClick(firstVariant)}
                                  className="px-4 py-2 rounded flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Variant Rows */}
                          {isExpanded && group.variants.map((variant, index) => (
                            <tr
                              key={`variant-${variant.id}`}
                              className={`${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800/50"
                                  : "bg-gray-50/50"
                              }`}
                            >
                              <td className="px-6 py-3" colSpan={8}>
                                <div className="pl-8 grid grid-cols-5 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-500 text-xs">Item Code:</span>
                                    <p className="font-mono font-medium">{variant.item_code}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-xs">Variant:</span>
                                    <p className="font-medium">{variant.option_description || "-"}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-xs">Points:</span>
                                    <p className="font-medium">{variant.points}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-xs">Price:</span>
                                    <p className="font-medium">{variant.price}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleViewVariantClick(variant)}
                                      className="px-4 py-2 rounded flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                                      title="View Variant"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleEditVariantClick(variant)}
                                      className={`px-4 py-2 rounded flex items-center ${resolvedTheme === "dark" ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"} font-semibold transition-colors`}
                                      title="Edit Variant"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteVariantClick(variant)}
                                      className="px-4 py-2 rounded flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                                      title="Delete Variant"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      );
                    })
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
                onClick={fetchCatalogueItems}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && !error && (
            <>
              <div className="space-y-3">
                {paginatedGroupedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">
                      {searchQuery
                        ? "No items match your search"
                        : "No catalogue items found"}
                    </p>
                  </div>
                ) : (
                  paginatedGroupedItems.map((group) => {
                  const isExpanded = expandedRows.has(group.catalogueItem.id);
                  const firstVariant = group.variants[0];
                  
                  return (
                    <div
                      key={`mobile-${group.catalogueItem.id}`}
                      className={`p-4 rounded-lg border ${
                        resolvedTheme === "dark"
                          ? "bg-gray-800 border-gray-700"
                          : "bg-white border-gray-200"
                      } transition-colors`}
                    >
                      {/* Main Item Info */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 flex items-start gap-2">
                          <button
                            onClick={() => toggleRow(group.catalogueItem.id)}
                            className="mt-0.5 hover:opacity-70 transition-opacity"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          <div>
                            <p className="font-semibold text-sm">
                              {group.catalogueItem.item_name}
                            </p>
                            <p
                              className={`text-xs ${
                                resolvedTheme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {group.variants.length} variant{group.variants.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                            group.catalogueItem.legend
                          )}`}
                        >
                          {group.catalogueItem.legend}
                        </span>
                      </div>
                      {/* New Info Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div>
                          <span className="text-gray-500">Reward:</span>
                          <p className="font-medium">{group.catalogueItem.reward || "-"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Date Added:</span>
                          <p className="font-medium">{new Date(group.catalogueItem.date_added).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span
                            className={`px-1 py-0.5 rounded-full text-xs font-semibold ${
                              group.catalogueItem.is_archived
                                ? "bg-red-500 text-white"
                                : "bg-green-500 text-white"
                            }`}
                          >
                            {group.catalogueItem.is_archived ? "Archived" : "Active"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Description:</span>
                          <p className="font-medium">
                            {group.catalogueItem.description.length > 30
                              ? group.catalogueItem.description.substring(0, 30) + "..."
                              : group.catalogueItem.description}
                          </p>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mb-3 space-y-2 pl-6">
                          {group.variants.map((variant, index) => (
                            <div
                              key={`mobile-variant-${variant.id}`}
                              className={`p-3 rounded border ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-700/50 border-gray-600"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500">Code:</span>
                                  <p className="font-mono font-medium">{variant.item_code}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Variant:</span>
                                  <p className="font-medium">{variant.option_description || "-"}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Points:</span>
                                  <p className="font-medium">{variant.points}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Price:</span>
                                  <p className="font-medium">{variant.price}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleViewVariantClick(variant)}
                                  className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors font-semibold text-sm"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEditVariantClick(variant)}
                                  className={`flex-1 px-3 py-2 rounded flex items-center justify-center text-sm ${resolvedTheme === "dark" ? "bg-gray-600 hover:bg-gray-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"} transition-colors font-semibold`}
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteVariantClick(variant)}
                                  className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold text-sm"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewClick(firstVariant)}
                          className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white transition-colors font-semibold text-sm"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(firstVariant)}
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
                          onClick={() => handleDeleteClick(firstVariant)}
                          className="flex-1 px-3 py-2 rounded flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              </div>
              
              {/* Mobile Pagination */}
              {paginatedGroupedItems.length > 0 && (
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
                      <ChevronsLeft className="h-4 w-4" />
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
                      <ChevronLeft className="h-4 w-4" />
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
                      <ChevronRight className="h-4 w-4" />
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
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
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

      {/* Create Catalogue Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-4xl w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">Add Catalogue Item</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Create a new redeemable item with variants
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Error Message */}
              {createError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
                  {createError}
                </div>
              )}

              {/* Shared Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Item Details</h3>

                {/* Reward */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reward Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={newItem.reward}
                    onChange={(e) =>
                      setNewItem({ ...newItem, reward: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., PLATINUM, GOLD, SILVER"
                  />
                </div>

                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={newItem.item_name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, item_name: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., Platinum Polo Shirt"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500 resize-none`}
                    rows={3}
                    placeholder="Detailed description of the item"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Purpose
                  </label>
                  <textarea
                    value={newItem.purpose}
                    onChange={(e) =>
                      setNewItem({ ...newItem, purpose: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500 resize-none`}
                    rows={2}
                    placeholder="Purpose of the item"
                  />
                </div>

                {/* Specifications */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Specifications
                  </label>
                  <textarea
                    value={newItem.specifications}
                    onChange={(e) =>
                      setNewItem({ ...newItem, specifications: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500 resize-none`}
                    rows={2}
                    placeholder="Specifications (e.g., 100% cotton, XS-XXL)"
                  />
                </div>

                {/* Legend */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    value={newItem.legend}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        legend: e.target.value as
                          | "COLLATERAL"
                          | "GIVEAWAY"
                          | "ASSET"
                          | "BENEFIT",
                      })
                    }
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                  >
                    <option value="COLLATERAL">Collateral (Red)</option>
                    <option value="GIVEAWAY">Giveaway (Blue)</option>
                    <option value="ASSET">Asset (Yellow)</option>
                    <option value="BENEFIT">Benefit (Green)</option>
                  </select>
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Variants</h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                  >
                    <Plus className="h-4 w-4 inline mr-1" />
                    Add Variant
                  </button>
                </div>

                {newItem.variants.map((variant, index) => (
                  <div key={index} className="border rounded p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-medium">Variant {index + 1}</h4>
                      {newItem.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Item Code */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Item Code *
                        </label>
                        <input
                          type="text"
                          value={variant.item_code}
                          onChange={(e) => updateVariant(index, 'item_code', e.target.value)}
                          className={`w-full px-3 py-2 rounded border ${
                            resolvedTheme === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="e.g., MC0001"
                        />
                      </div>

                      {/* Option Description */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Variant Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={variant.option_description}
                          onChange={(e) => updateVariant(index, 'option_description', e.target.value)}
                          className={`w-full px-3 py-2 rounded border ${
                            resolvedTheme === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="e.g., Size S, Color Blue"
                        />
                      </div>

                      {/* Points */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Points Required *
                        </label>
                        <input
                          type="text"
                          value={variant.points}
                          onChange={(e) => updateVariant(index, 'points', e.target.value)}
                          className={`w-full px-3 py-2 rounded border ${
                            resolvedTheme === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="e.g., 500"
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Price *
                        </label>
                        <input
                          type="text"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          className={`w-full px-3 py-2 rounded border ${
                            resolvedTheme === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="e.g., ₱130.00"
                        />
                      </div>

                      {/* Image URL */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          Image URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={variant.image_url}
                          onChange={(e) => updateVariant(index, 'image_url', e.target.value)}
                          className={`w-full px-3 py-2 rounded border ${
                            resolvedTheme === "dark"
                              ? "bg-gray-800 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:border-blue-500`}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
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
                onClick={handleCreateItem}
                disabled={creating}
                className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Catalogue Item Modal */}
      {showEditModal && editingCatalogueItemId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-4xl w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">Edit Catalogue Item</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Update item details and variants
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Error Message */}
              {editError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
                  {editError}
                </div>
              )}

              {/* Loading State */}
              {loadingVariants && (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading variants...</p>
                </div>
              )}

              {!loadingVariants && (
                <>
                  {/* Shared Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Item Details</h3>

                    {/* Reward */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Reward Category (Optional)
                      </label>
                      <input
                        type="text"
                        value={editItem.reward}
                        onChange={(e) =>
                          setEditItem({ ...editItem, reward: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded border ${
                          resolvedTheme === "dark"
                            ? "bg-gray-800 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:border-blue-500`}
                        placeholder="e.g., PLATINUM, GOLD, SILVER"
                      />
                    </div>

                    {/* Item Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={editItem.item_name}
                        onChange={(e) =>
                          setEditItem({ ...editItem, item_name: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded border ${
                          resolvedTheme === "dark"
                            ? "bg-gray-800 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:border-blue-500`}
                        placeholder="e.g., Platinum Polo Shirt"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={editItem.description}
                        onChange={(e) =>
                          setEditItem({ ...editItem, description: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded border ${
                          resolvedTheme === "dark"
                            ? "bg-gray-800 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:border-blue-500 resize-none`}
                        rows={3}
                        placeholder="Detailed description of the item"
                      />
                    </div>

                    {/* Purpose */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Purpose
                      </label>
                      <textarea
                        value={editItem.purpose}
                        onChange={(e) =>
                          setEditItem({ ...editItem, purpose: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded border ${
                          resolvedTheme === "dark"
                            ? "bg-gray-800 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:border-blue-500 resize-none`}
                        rows={2}
                        placeholder="Purpose of the item"
                      />
                    </div>

                    {/* Specifications */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Specifications
                      </label>
                      <textarea
                        value={editItem.specifications}
                        onChange={(e) =>
                          setEditItem({ ...editItem, specifications: e.target.value })
                        }
                        className={`w-full px-3 py-2 rounded border ${
                          resolvedTheme === "dark"
                            ? "bg-gray-800 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:border-blue-500 resize-none`}
                        rows={2}
                        placeholder="Specifications (e.g., 100% cotton, XS-XXL)"
                      />
                    </div>

                    {/* Legend */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Category *
                      </label>
                      <select
                        value={editItem.legend}
                        onChange={(e) =>
                          setEditItem({
                            ...editItem,
                            legend: e.target.value as
                              | "COLLATERAL"
                              | "GIVEAWAY"
                              | "ASSET"
                              | "BENEFIT",
                          })
                        }
                        className={`w-full px-3 py-2 rounded border ${
                          resolvedTheme === "dark"
                            ? "bg-gray-800 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:border-blue-500`}
                      >
                        <option value="COLLATERAL">Collateral (Red)</option>
                        <option value="GIVEAWAY">Giveaway (Blue)</option>
                        <option value="ASSET">Asset (Yellow)</option>
                        <option value="BENEFIT">Benefit (Green)</option>
                      </select>
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Variants</h3>
                      <button
                        type="button"
                        onClick={addEditVariant}
                        className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                      >
                        <Plus className="h-4 w-4 inline mr-1" />
                        Add Variant
                      </button>
                    </div>

                    {editItem.variants.map((variant, index) => (
                      <div key={index} className="border rounded p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-md font-medium">Variant {index + 1}</h4>
                          {editItem.variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEditVariant(index)}
                              className="px-2 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-sm transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Item Code */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Item Code *
                            </label>
                            <input
                              type="text"
                              value={variant.item_code}
                              onChange={(e) => updateEditVariant(index, 'item_code', e.target.value)}
                              className={`w-full px-3 py-2 rounded border ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
                              placeholder="e.g., MC0001"
                            />
                          </div>

                          {/* Option Description */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Variant Description (Optional)
                            </label>
                            <input
                              type="text"
                              value={variant.option_description}
                              onChange={(e) => updateEditVariant(index, 'option_description', e.target.value)}
                              className={`w-full px-3 py-2 rounded border ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
                              placeholder="e.g., Size S, Color Blue"
                            />
                          </div>

                          {/* Points */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Points Required *
                            </label>
                            <input
                              type="text"
                              value={variant.points}
                              onChange={(e) => updateEditVariant(index, 'points', e.target.value)}
                              className={`w-full px-3 py-2 rounded border ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
                              placeholder="e.g., 500"
                            />
                          </div>

                          {/* Price */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Price *
                            </label>
                            <input
                              type="text"
                              value={variant.price}
                              onChange={(e) => updateEditVariant(index, 'price', e.target.value)}
                              className={`w-full px-3 py-2 rounded border ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
                              placeholder="e.g., ₱130.00"
                            />
                          </div>

                          {/* Image URL */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">
                              Image URL (Optional)
                            </label>
                            <input
                              type="url"
                              value={variant.image_url}
                              onChange={(e) => updateEditVariant(index, 'image_url', e.target.value)}
                              className={`w-full px-3 py-2 rounded border ${
                                resolvedTheme === "dark"
                                  ? "bg-gray-800 border-gray-600 text-white"
                                  : "bg-white border-gray-300 text-gray-900"
                              } focus:outline-none focus:border-blue-500`}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
                onClick={handleUpdateItem}
                disabled={updating}
                className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Update Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Catalogue Item Modal */}
      {showViewModal && viewTarget && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-4xl w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">View Catalogue Item</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Item details and variants
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Loading State */}
              {loadingViewVariants && (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading variants...</p>
                </div>
              )}

              {!loadingViewVariants && viewVariants.length > 0 && (
                <>
                  {/* Shared Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Item Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* ID */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Catalogue Item ID</p>
                        <p className="font-semibold">{viewVariants[0].catalogue_item.id}</p>
                      </div>

                      {/* Reward */}
                      {viewVariants[0].catalogue_item.reward && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Reward Category
                          </p>
                          <p className="font-semibold uppercase">
                            {viewVariants[0].catalogue_item.reward}
                          </p>
                        </div>
                      )}

                      {/* Item Name */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Item Name</p>
                        <p className="font-semibold">{viewVariants[0].catalogue_item.item_name}</p>
                      </div>

                      {/* Legend */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                            viewVariants[0].catalogue_item.legend
                          )}`}
                        >
                          {viewVariants[0].catalogue_item.legend}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className={`leading-relaxed ${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {viewVariants[0].catalogue_item.description}
                      </p>
                    </div>

                    {/* Purpose */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Purpose</p>
                      <p className={`leading-relaxed ${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {viewVariants[0].catalogue_item.purpose}
                      </p>
                    </div>

                    {/* Specifications */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Specifications</p>
                      <p className={`leading-relaxed ${resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                        {viewVariants[0].catalogue_item.specifications}
                      </p>
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Variants ({viewVariants.length})</h3>
                    </div>

                    {viewVariants.map((variant, index) => (
                      <div key={variant.id} className={`border rounded p-4 space-y-4 ${
                        resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}>
                        <div className="flex justify-between items-center">
                          <h4 className="text-md font-medium">Variant {index + 1}</h4>
                          <span className="text-xs text-gray-500">ID: {variant.id}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Item Code */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Item Code
                            </p>
                            <p className="font-mono font-semibold text-sm">
                              {variant.item_code}
                            </p>
                          </div>

                          {/* Option Description */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Variant Description
                            </p>
                            <p className="font-semibold text-sm">
                              {variant.option_description || "-"}
                            </p>
                          </div>

                          {/* Points */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Points Required
                            </p>
                            <p className="font-semibold">{variant.points}</p>
                          </div>

                          {/* Price */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Price
                            </p>
                            <p className="font-semibold">{variant.price}</p>
                          </div>

                          {/* Image URL */}
                          {variant.image_url && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-gray-500 mb-1">
                                Image URL
                              </p>
                              <a 
                                href={variant.image_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 text-sm break-all"
                              >
                                {variant.image_url}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
                <h2 className="text-xl font-semibold">Delete Item</h2>
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
                <strong>{deleteTarget.item_name}</strong>? This action cannot be
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

      {/* View Variant Modal */}
      {showViewVariantModal && viewVariantTarget && (
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
                <h2 className="text-xl font-semibold">View Variant</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Variant details
                </p>
              </div>
              <button
                onClick={() => setShowViewVariantModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Variant ID */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Variant ID</p>
                  <p className="font-semibold">{viewVariantTarget.id}</p>
                </div>

                {/* Item Code */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Item Code</p>
                  <p className="font-mono font-semibold">{viewVariantTarget.item_code}</p>
                </div>

                {/* Option Description */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Variant Description</p>
                  <p className="font-semibold">{viewVariantTarget.option_description || "-"}</p>
                </div>

                {/* Points */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Points Required</p>
                  <p className="font-semibold">{viewVariantTarget.points}</p>
                </div>

                {/* Price */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="font-semibold">{viewVariantTarget.price}</p>
                </div>

                {/* Catalogue Item */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Catalogue Item</p>
                  <p className="font-semibold">{viewVariantTarget.item_name}</p>
                </div>

                {/* Image URL */}
                {viewVariantTarget.image_url && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Image URL</p>
                    <a
                      href={viewVariantTarget.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 text-sm break-all"
                    >
                      {viewVariantTarget.image_url}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-2 justify-end">
              <button
                onClick={() => setShowViewVariantModal(false)}
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

      {/* Edit Variant Modal */}
      {showEditVariantModal && editVariantTarget && (
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
                <h2 className="text-xl font-semibold">Edit Variant</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Update variant details
                </p>
              </div>
              <button
                onClick={() => setShowEditVariantModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Error Message */}
              {editVariantError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
                  {editVariantError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item Code */}
                <div>
                  <label className="block text-sm font-medium mb-2">Item Code *</label>
                  <input
                    type="text"
                    value={editVariantData.item_code}
                    onChange={(e) => setEditVariantData({ ...editVariantData, item_code: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., MC0001"
                  />
                </div>

                {/* Option Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Variant Description (Optional)</label>
                  <input
                    type="text"
                    value={editVariantData.option_description}
                    onChange={(e) => setEditVariantData({ ...editVariantData, option_description: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., Size S, Color Blue"
                  />
                </div>

                {/* Points */}
                <div>
                  <label className="block text-sm font-medium mb-2">Points Required *</label>
                  <input
                    type="text"
                    value={editVariantData.points}
                    onChange={(e) => setEditVariantData({ ...editVariantData, points: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., 500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price *</label>
                  <input
                    type="text"
                    value={editVariantData.price}
                    onChange={(e) => setEditVariantData({ ...editVariantData, price: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="e.g., ₱130.00"
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={editVariantData.image_url}
                    onChange={(e) => setEditVariantData({ ...editVariantData, image_url: e.target.value })}
                    className={`w-full px-3 py-2 rounded border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:border-blue-500`}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-2 justify-end">
              <button
                onClick={() => setShowEditVariantModal(false)}
                disabled={updatingVariant}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  resolvedTheme === "dark"
                    ? "border-gray-600 hover:bg-gray-800 disabled:opacity-50"
                    : "border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateVariant}
                disabled={updatingVariant}
                className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingVariant ? "Updating..." : "Update Variant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Variant Confirmation Modal */}
      {showDeleteVariantModal && deleteVariantTarget && (
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
                <h2 className="text-xl font-semibold">Delete Variant</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Confirm deletion
                </p>
              </div>
              <button
                onClick={() => setShowDeleteVariantModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p>
                Are you sure you want to delete variant{" "}
                <strong>{deleteVariantTarget.item_code}</strong> ({deleteVariantTarget.option_description || "No description"})? This action cannot be undone.
              </p>
            </div>

            <div className="p-6 border-t border-gray-700 flex gap-2">
              <button
                onClick={() => setShowDeleteVariantModal(false)}
                className={`flex-1 px-6 py-2 rounded-lg border transition-colors ${
                  resolvedTheme === "dark"
                    ? "border-gray-600 hover:bg-gray-800"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteVariant}
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

export default Catalogue;
