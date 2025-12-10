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
  Package,
  ArrowLeft,
  LogOut,
} from "lucide-react";

interface CatalogueItem {
  id: number;
  reward: string | null;
  item_name: string;
  item_code: string;
  description: string;
  purpose: string;
  specifications: string;
  options: string | null;
  points: string;
  price: string;
  legend: "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT";
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
  const [items] = useState<CatalogueItem[]>([
    {
      id: "MC3001",
      itemName: "Platinum Polo",
      type: "Apparel",
      points: 500,
      price: 1200,
      description:
        "A high-quality polo shirt made from premium platinum fabric with lasting charm and style.",
      purpose:
        "Ideal for casual wear, company events, or as a stylish uniform piece.",
      specifications: [
        "Material: 100% Platinum Cotton",
        "Fit: Modern Fit",
        "Color: Ribbed Polo Collar",
        "Sleeves: Short sleeves with ribbed armbands",
      ],
      options:
        "Available in sizes S, M, L, XL and colors Black, White, and Navy Blue.",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch catalogue items from API
  useEffect(() => {
    fetchCatalogueItems();
  }, []);

  const fetchCatalogueItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/catalogue/");
      
      if (!response.ok) {
        throw new Error("Failed to fetch catalogue items");
      }

      const data = await response.json();
      setItems(data.items || []);
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

  // Modal and form state for creating new item
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    reward: "",
    item_name: "",
    item_code: "",
    description: "",
    purpose: "",
    specifications: "",
    options: "",
    points: "",
    price: "",
    legend: "GIVEAWAY" as "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT",
  });

  // Modal state for edit/view/delete
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogueItem | null>(null);
  const [viewTarget, setViewTarget] = useState<CatalogueItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogueItem | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const [editItem, setEditItem] = useState({
    reward: "",
    item_name: "",
    item_code: "",
    description: "",
    purpose: "",
    specifications: "",
    options: "",
    points: "",
    price: "",
    legend: "GIVEAWAY" as "COLLATERAL" | "GIVEAWAY" | "ASSET" | "BENEFIT",
  });

  // Handle create item submission
  const handleCreateItem = async () => {
    setCreateError(null);

    // Validation
    if (!newItem.item_name.trim()) {
      setCreateError("Item name is required");
      return;
    }
    if (!newItem.item_code.trim()) {
      setCreateError("Item code is required");
      return;
    }
    if (!newItem.points.trim()) {
      setCreateError("Points is required");
      return;
    }
    if (!newItem.price.trim()) {
      setCreateError("Price is required");
      return;
    }
    if (!newItem.legend) {
      setCreateError("Category is required");
      return;
    }

    try {
      setCreating(true);
      const response = await fetch("http://localhost:8000/api/catalogue/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reward: newItem.reward || null,
          item_name: newItem.item_name,
          item_code: newItem.item_code,
          description: newItem.description,
          purpose: newItem.purpose,
          specifications: newItem.specifications,
          options: newItem.options || null,
          points: newItem.points,
          price: newItem.price,
          legend: newItem.legend,
        }),
      });

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
        item_code: "",
        description: "",
        purpose: "",
        specifications: "",
        options: "",
        points: "",
        price: "",
        legend: "GIVEAWAY",
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
  const handleEditClick = (item: CatalogueItem) => {
    setEditingItem(item);
    setEditItem({
      reward: item.reward || "",
      item_name: item.item_name,
      item_code: item.item_code,
      description: item.description,
      purpose: item.purpose,
      specifications: item.specifications,
      options: item.options || "",
      points: item.points,
      price: item.price,
      legend: item.legend,
    });
    setShowEditModal(true);
    setEditError(null);
  };

  // Handle update item
  const handleUpdateItem = async () => {
    if (!editingItem) return;

    setEditError(null);

    if (!editItem.item_name.trim()) {
      setEditError("Item name is required");
      return;
    }
    if (!editItem.item_code.trim()) {
      setEditError("Item code is required");
      return;
    }
    if (!editItem.points.trim()) {
      setEditError("Points is required");
      return;
    }
    if (!editItem.price.trim()) {
      setEditError("Price is required");
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(
        `http://localhost:8000/api/catalogue/${editingItem.id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reward: editItem.reward || null,
            item_name: editItem.item_name,
            item_code: editItem.item_code,
            description: editItem.description,
            purpose: editItem.purpose,
            specifications: editItem.specifications,
            options: editItem.options || null,
            points: editItem.points,
            price: editItem.price,
            legend: editItem.legend,
          }),
        }
      );

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
      setEditingItem(null);
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

  // Handle delete with modal
  const handleDeleteClick = (item: CatalogueItem) => {
    setDeleteTarget(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/catalogue/${deleteTarget.id}/`,
        {
          method: "DELETE",
        }
      );

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
                <RotateCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
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
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 transition-colors"
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
              className={`border rounded-lg overflow-hidden ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
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
                      Item Code
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Item Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Options
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Points
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Price
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
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-gray-500">
                          {searchQuery
                            ? "No items match your search"
                            : "No catalogue items found"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:${
                          resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                        } transition-colors`}
                      >
                        <td className="px-6 py-4 text-sm font-mono">
                          {item.item_code}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {item.item_name}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                              item.legend
                            )}`}
                          >
                            {item.legend}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{item.options || "-"}</td>
                        <td className="px-6 py-4 text-sm">{item.points}</td>
                        <td className="px-6 py-4 text-sm">{item.price}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setViewTarget(item);
                                setShowViewModal(true);
                              }}
                              className="px-4 py-2 rounded flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleEditClick(item)}
                              className="px-4 py-2 rounded flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="px-4 py-2 rounded flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
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
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">
                    {searchQuery
                      ? "No items match your search"
                      : "No catalogue items found"}
                  </p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.item_name}</p>
                        <p
                          className={`text-xs font-mono ${
                            resolvedTheme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          {item.item_code}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                          item.legend
                        )}`}
                      >
                        {item.legend}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p
                          className={`text-xs mb-1 ${
                            resolvedTheme === "dark"
                              ? "text-gray-400"
                              : "text-gray-600"
                          }`}
                        >
                          Points: {item.points}
                        </p>
                        <p className="font-semibold text-sm">{item.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setViewTarget(item);
                          setShowViewModal(true);
                        }}
                        className="flex-1 px-3 py-2 rounded flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white transition-colors font-semibold text-sm"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleEditClick(item)}
                        className={`flex-1 px-3 py-2 rounded flex items-center justify-center gap-1 ${
                          resolvedTheme === "dark"
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                        } transition-colors font-semibold text-sm`}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="flex-1 px-3 py-2 rounded flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
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

      {/* Create Catalogue Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-2xl w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">Add Catalogue Item</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  Create a new redeemable item
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
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {/* Error Message */}
              {createError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
                  {createError}
                </div>
              )}

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

              {/* Item Code */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Item Code *
                </label>
                <input
                  type="text"
                  value={newItem.item_code}
                  onChange={(e) =>
                    setNewItem({ ...newItem, item_code: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="e.g., MC0001 or [MC0001, MC0002]"
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

              {/* Options */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Options (Optional)
                </label>
                <input
                  type="text"
                  value={newItem.options}
                  onChange={(e) =>
                    setNewItem({ ...newItem, options: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Available options (e.g., colors, sizes)"
                />
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Points Required *
                </label>
                <input
                  type="text"
                  value={newItem.points}
                  onChange={(e) =>
                    setNewItem({ ...newItem, points: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="e.g., 5000 or 1/inv amt"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price *
                </label>
                <input
                  type="text"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="e.g., ₱2,500.00 or P0.50/inv amt"
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
                  <option value="COLLATERAL">
                    Collateral (Red)
                  </option>
                  <option value="GIVEAWAY">Giveaway (Blue)</option>
                  <option value="ASSET">Asset (Yellow)</option>
                  <option value="BENEFIT">Benefit (Green)</option>
                </select>
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
      {showEditModal && editingItem && (
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
                <h2 className="text-xl font-semibold">Edit Catalogue Item</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  Update item details
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {editError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
                  {editError}
                </div>
              )}

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

              <div>
                <label className="block text-sm font-medium mb-2">
                  Item Code *
                </label>
                <input
                  type="text"
                  value={editItem.item_code}
                  onChange={(e) =>
                    setEditItem({ ...editItem, item_code: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="e.g., MC0001 or [MC0001, MC0002]"
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium mb-2">
                  Options (Optional)
                </label>
                <input
                  type="text"
                  value={editItem.options}
                  onChange={(e) =>
                    setEditItem({ ...editItem, options: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="Available options (e.g., colors, sizes)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Points Required *
                </label>
                <input
                  type="text"
                  value={editItem.points}
                  onChange={(e) =>
                    setEditItem({ ...editItem, points: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="e.g., 5000 or 1/inv amt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Price *
                </label>
                <input
                  type="text"
                  value={editItem.price}
                  onChange={(e) =>
                    setEditItem({ ...editItem, price: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                  placeholder="e.g., ₱2,500.00 or P0.50/inv amt"
                />
              </div>

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
            } rounded-lg shadow-2xl max-w-2xl w-full border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">View Catalogue Item</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  }`}
                >
                  Item details
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="font-medium">ID:</span>
                <span>{viewTarget.id}</span>
              </div>
              {viewTarget.reward && (
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="font-medium">Reward Category:</span>
                  <span>{viewTarget.reward}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="font-medium">Item Name:</span>
                <span>{viewTarget.item_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="font-medium">Item Code:</span>
                <span className="font-mono text-sm">{viewTarget.item_code}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="font-medium">Description:</span>
                <span className="text-right max-w-md">{viewTarget.description}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="font-medium">Purpose:</span>
                <span className="text-right max-w-md">{viewTarget.purpose}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="font-medium">Specifications:</span>
                <span className="text-right max-w-md">{viewTarget.specifications}</span>
              </div>
              {viewTarget.options && (
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="font-medium">Options:</span>
                  <span className="text-right max-w-md">{viewTarget.options}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="font-medium">Points:</span>
                <span>{viewTarget.points}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="font-medium">Price:</span>
                <span>{viewTarget.price}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <span className="font-medium">Category:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getLegendColor(
                    viewTarget.legend
                  )}`}
                >
                  {viewTarget.legend}
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => setShowViewModal(false)}
                className={`w-full px-6 py-2 rounded-lg border transition-colors ${
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
                    resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
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
                Are you sure you want to delete <strong>{deleteTarget.item_name}</strong>? This action cannot be undone.
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

export default Catalogue;
