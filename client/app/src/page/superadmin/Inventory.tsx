import { useState } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { BaseModal } from "@/page/superadmin/Accounts/modals/BaseModal";
import {
  Bell,
  Search,
  Sliders,
  Trash2,
  Edit,
  Eye,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  stock: number;
  reorderLevel: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated: string;
}

interface InventoryProps {
  onNavigate?: (
    page:
      | "dashboard"
      | "history"
      | "accounts"
      | "catalogue"
      | "redemption"
      | "inventory"
      | "distributors"
      | "teams"
  ) => void;
  onLogout?: () => void;
}

function Inventory({ onNavigate, onLogout }: InventoryProps) {
  const { resolvedTheme } = useTheme();
  const currentPage = "inventory";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const itemsPerPage = 7;
  const [items] = useState<InventoryItem[]>([
    {
      id: "INV001",
      itemName: "Platinum Polo",
      category: "Apparel",
      stock: 150,
      reorderLevel: 50,
      status: "In Stock",
      lastUpdated: "2025-12-10",
    },
    {
      id: "INV002",
      itemName: "Corporate Tie",
      category: "Accessories",
      stock: 25,
      reorderLevel: 30,
      status: "Low Stock",
      lastUpdated: "2025-12-09",
    },
    {
      id: "INV003",
      itemName: "Executive Notebook",
      category: "Stationery",
      stock: 0,
      reorderLevel: 20,
      status: "Out of Stock",
      lastUpdated: "2025-12-08",
    },
    {
      id: "INV004",
      itemName: "Leather Belt",
      category: "Accessories",
      stock: 80,
      reorderLevel: 40,
      status: "In Stock",
      lastUpdated: "2025-12-11",
    },
    {
      id: "INV005",
      itemName: "Business Card Holder",
      category: "Accessories",
      stock: 120,
      reorderLevel: 30,
      status: "In Stock",
      lastUpdated: "2025-12-10",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: "",
    category: "",
    stock: "",
    reorderLevel: "",
  });

  const getStatusColor = (status: InventoryItem["status"]) => {
    switch (status) {
      case "In Stock":
        return "bg-green-500 text-white";
      case "Low Stock":
        return "bg-yellow-400 text-black";
      case "Out of Stock":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.itemName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / itemsPerPage)
  );
  const safePage = Math.min(currentPageIndex, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar
        currentPage="inventory"
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
              <h1 className="text-3xl font-semibold">Inventory</h1>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View and manage inventory stock levels and reorder points.
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
                placeholder="Search by ID, Name....."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPageIndex(1);
                }}
                className={`pl-10 w-80 ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                className={`p-2 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700 hover:bg-gray-800"
                    : "bg-white border-gray-300 hover:bg-gray-100"
                } transition-colors`}
              >
                <Sliders className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-semibold transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Item
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div
            className={`border rounded-lg overflow-hidden ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            } transition-colors`}
          >
            <table className="w-full text-sm">
              <thead
                className={`${
                  resolvedTheme === "dark"
                    ? "bg-slate-800 text-gray-200"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">ID</th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Item Name
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Category
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Stock</th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Reorder Level
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`${
                  resolvedTheme === "dark"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                {paginatedItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-t ${
                      resolvedTheme === "dark"
                        ? "border-slate-800"
                        : "border-gray-200"
                    }`}
                  >
                    <td className="px-5 py-4 align-middle">{item.id}</td>
                    <td className="px-5 py-4 align-middle">{item.itemName}</td>
                    <td className="px-5 py-4 align-middle">{item.category}</td>
                    <td className="px-5 py-4 align-middle">{item.stock}</td>
                    <td className="px-5 py-4 align-middle">
                      {item.reorderLevel}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => setEditItem(item)}
                          className={`px-4 py-2 rounded font-semibold text-sm flex items-center gap-2 ${
                            resolvedTheme === "dark"
                              ? "bg-gray-600 hover:bg-gray-700 text-white"
                              : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                          }`}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setCurrentPageIndex(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm font-medium">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPageIndex(Math.min(totalPages, safePage + 1))
                }
                disabled={safePage === totalPages}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto pb-20 p-4">
          <h2 className="text-2xl font-semibold mb-4">Inventory</h2>

          {/* Search */}
          <div
            className={`relative flex items-center rounded-lg border mb-4 ${
              resolvedTheme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            <Search className="absolute left-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPageIndex(1);
              }}
              className={`pl-10 w-full text-sm ${
                resolvedTheme === "dark"
                  ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                  : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 mb-4 ${
              resolvedTheme === "dark"
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-900 text-white hover:bg-gray-700"
            } transition-colors font-semibold text-sm`}
          >
            <Plus className="h-5 w-5" />
            Add New Item
          </button>

          {/* Mobile Cards */}
          <div className="space-y-3">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                } transition-colors`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm">{item.id}</p>
                    <p className="text-lg font-bold">{item.itemName}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Stock</p>
                    <p className="font-semibold">{item.stock}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Reorder Level</p>
                    <p className="font-semibold">{item.reorderLevel}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setEditItem(item)}
                    className={`flex-1 px-3 py-2 rounded font-semibold text-xs ${
                      resolvedTheme === "dark"
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                    }`}
                  >
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold text-xs">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setCurrentPageIndex(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                  : "bg-white border border-gray-300 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span className="text-xs font-medium">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPageIndex(Math.min(totalPages, safePage + 1))
              }
              disabled={safePage === totalPages}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                  : "bg-white border border-gray-300 hover:bg-gray-100"
              }`}
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <MobileBottomNav
        currentPage={currentPage}
        onNavigate={onNavigate || (() => {})}
        isModalOpen={!!selectedItem || !!editItem || showAddModal}
      />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* View Details Modal */}
      {selectedItem && (
        <BaseModal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title="Inventory Details"
          subtitle="View item information"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Item ID
              </p>
              <p className="font-semibold text-base">{selectedItem.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Item Name
              </p>
              <p className="font-semibold text-base">{selectedItem.itemName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Category
              </p>
              <p className="font-semibold text-base">{selectedItem.category}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Current Stock
                </p>
                <p className="font-semibold text-lg">{selectedItem.stock}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Reorder Level
                </p>
                <p className="font-semibold text-lg">
                  {selectedItem.reorderLevel}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Status
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  selectedItem.status
                )}`}
              >
                {selectedItem.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Last Updated
              </p>
              <p className="font-semibold text-base">
                {selectedItem.lastUpdated}
              </p>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Edit Inventory Modal */}
      {editItem && (
        <BaseModal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          title="Edit Inventory"
          subtitle="Update stock level"
          size="md"
          footer={
            <>
              <button
                onClick={() => setEditItem(null)}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle update logic here
                  setEditItem(null);
                }}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Update Stock
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Item ID
              </p>
              <p className="font-semibold text-base">{editItem.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Item Name
              </p>
              <p className="font-semibold text-base">{editItem.itemName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Category
              </p>
              <p className="font-semibold text-base">{editItem.category}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Current Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  defaultValue={editItem.stock}
                  min="0"
                  className={`w-full px-3 py-2 rounded-lg border text-base font-semibold ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Reorder Level</p>
                <div className="flex items-center h-10">
                  <p className="font-semibold text-base">
                    {editItem.reorderLevel}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Status
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  editItem.status
                )}`}
              >
                {editItem.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Last Updated
              </p>
              <p className="font-semibold text-base">{editItem.lastUpdated}</p>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <BaseModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Inventory Item"
          subtitle="Enter item details below"
          size="md"
          footer={
            <>
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle add logic here
                  setShowAddModal(false);
                }}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Add Item
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter item name"
                value={newItem.itemName}
                onChange={(e) =>
                  setNewItem({ ...newItem, itemName: e.target.value })
                }
                className={`w-full ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter category"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className={`w-full ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Initial Stock <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={newItem.stock}
                  onChange={(e) =>
                    setNewItem({ ...newItem, stock: e.target.value })
                  }
                  className={`w-full ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Reorder Level <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={newItem.reorderLevel}
                  onChange={(e) =>
                    setNewItem({ ...newItem, reorderLevel: e.target.value })
                  }
                  className={`w-full ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
}

export default Inventory;
