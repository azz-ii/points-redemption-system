import { useState } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import {
  Bell,
  Search,
  Sliders,
  Trash2,
  Edit,
  Eye,
  Plus,
  X,
  Home,
  History as HistoryIcon,
  Package,
  User,
  ArrowLeft,
  LogOut,
  ClipboardList,
} from "lucide-react";

interface CatalogueItem {
  id: string;
  itemName: string;
  type: string;
  points: number;
  price?: number;
  description?: string;
  purpose?: string;
  specifications?: string[];
  options?: string;
  image?: string;
}

interface CatalogueProps {
  onNavigate?: (
    page: "dashboard" | "history" | "accounts" | "catalogue" | "redemption"
  ) => void;
  onLogout?: () => void;
}

function Catalogue({ onNavigate, onLogout }: CatalogueProps) {
  const { resolvedTheme } = useTheme();
  const currentPage = "catalogue";
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
  const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: "",
    type: "",
    points: "",
    price: "",
    description: "",
    purpose: "",
    specifications: "",
    options: "",
    image: null as File | null,
  });

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
              <h1 className="text-3xl font-semibold">Catalogue</h1>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                View and manage the complete history of point redemptions.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
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
                placeholder="Search by ID, Name......"
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
                className={`p-2 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "border-gray-700 hover:bg-gray-900"
                    : "border-gray-300 hover:bg-gray-100"
                } transition-colors`}
              >
                <Sliders className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  resolvedTheme === "dark"
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-gray-900 text-white hover:bg-gray-700"
                } transition-colors font-semibold`}
              >
                <Plus className="h-5 w-5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Table */}
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
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Item Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Points
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
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4 text-sm">{item.id}</td>
                    <td className="px-6 py-4 text-sm">{item.itemName}</td>
                    <td className="px-6 py-4 text-sm">{item.type}</td>
                    <td className="px-6 py-4 text-sm">{item.points}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-4 py-2 rounded flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">View</span>
                        </button>
                        <button
                          className="px-4 py-2 rounded flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="text-sm">Edit</span>
                        </button>

                        <button
                          className="px-4 py-2 rounded flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-sm">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

          {/* Add Item Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 mb-6 ${
              resolvedTheme === "dark"
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-900 text-white hover:bg-gray-700"
            } transition-colors font-semibold text-sm`}
          >
            <Plus className="h-5 w-5" />
            <span>Add Item</span>
          </button>

          {/* Mobile Cards */}
          <div className="space-y-3">
            {items.map((item) => (
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
                    <p className="font-semibold text-sm">{item.itemName}</p>
                    <p
                      className={`text-xs ${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      ID: {item.id}
                    </p>
                  </div>
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
                      Type: {item.type}
                    </p>
                    <p className="font-semibold text-sm">{item.points} pts</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className={`flex-1 px-3 py-2 rounded flex items-center justify-center gap-1 ${
                      resolvedTheme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    } transition-colors font-semibold text-sm`}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
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
                  <button className="flex-1 px-3 py-2 rounded flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white transition-colors font-semibold text-sm">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center p-4 border-t ${
          resolvedTheme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <button
          onClick={() => onNavigate?.("dashboard")}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            currentPage === "dashboard"
              ? resolvedTheme === "dark"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700"
              : resolvedTheme === "dark"
              ? "text-gray-200 hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs">Dashboard</span>
        </button>
        <button
          onClick={() => onNavigate?.("history")}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            currentPage === "history"
              ? resolvedTheme === "dark"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700"
              : resolvedTheme === "dark"
              ? "text-gray-200 hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <HistoryIcon className="h-6 w-6" />
          <span className="text-xs">History</span>
        </button>
        <button
          onClick={() => onNavigate?.("accounts")}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            currentPage === "accounts"
              ? resolvedTheme === "dark"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700"
              : resolvedTheme === "dark"
              ? "text-gray-200 hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs">Accounts</span>
        </button>
        <button
          onClick={() => onNavigate?.("catalogue")}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            currentPage === "catalogue"
              ? resolvedTheme === "dark"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700"
              : resolvedTheme === "dark"
              ? "text-gray-200 hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Package className="h-6 w-6" />
          <span className="text-xs">Catalogue</span>
        </button>
        <button
          onClick={() => onNavigate?.("redemption")}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            currentPage === "redemption"
              ? resolvedTheme === "dark"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700"
              : resolvedTheme === "dark"
              ? "text-gray-200 hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <ClipboardList className="h-6 w-6" />
          <span className="text-xs">Redemption</span>
        </button>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md rounded-lg shadow-lg ${
              resolvedTheme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-900"
            } transition-colors my-8`}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-bold">Add New Catalogue Item</h2>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Please fill in the details to create a new item
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-1 rounded ${
                  resolvedTheme === "dark"
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-100"
                } transition-colors`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Item Image */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Item Image
                </label>
                <label
                  className={`flex items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    resolvedTheme === "dark"
                      ? "border-gray-700 hover:bg-gray-800"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setNewItem({ ...newItem, image: e.target.files[0] });
                      }
                    }}
                  />
                  <div className="text-center">
                    <p
                      className={`text-sm ${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      Click to upload or drag and drop
                    </p>
                  </div>
                </label>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Item Name
                </label>
                <Input
                  placeholder="e.g. Platinum Polo"
                  value={newItem.itemName}
                  onChange={(e) =>
                    setNewItem({ ...newItem, itemName: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>

              {/* Type and Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Type
                  </label>
                  <select
                    value={newItem.type}
                    onChange={(e) =>
                      setNewItem({ ...newItem, type: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="">Select Type</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Points
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 5,000"
                    value={newItem.points}
                    onChange={(e) =>
                      setNewItem({ ...newItem, points: e.target.value })
                    }
                    className={`w-full px-4 py-2 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    }`}
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Price
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1,200"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter item description"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Purpose
                </label>
                <textarea
                  placeholder="Enter item purpose"
                  value={newItem.purpose}
                  onChange={(e) =>
                    setNewItem({ ...newItem, purpose: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Specifications
                </label>
                <textarea
                  placeholder="Enter specifications (one per line)"
                  value={newItem.specifications}
                  onChange={(e) =>
                    setNewItem({ ...newItem, specifications: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Options
                </label>
                <textarea
                  placeholder="Enter available options (sizes, colors, etc.)"
                  value={newItem.options}
                  onChange={(e) =>
                    setNewItem({ ...newItem, options: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border resize-none ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col gap-3 p-6 border-t border-gray-700">
              <button
                className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-2xl rounded-lg shadow-lg ${
              resolvedTheme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-900"
            } transition-colors overflow-hidden`}
          >
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Image Section */}
              <div className="flex items-center justify-center">
                {selectedItem.image ? (
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.itemName}
                    className="w-full h-auto rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className={`w-full aspect-square rounded-lg flex items-center justify-center ${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
                    }`}
                  >
                    <Package className="h-24 w-24 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {selectedItem.id}
                    </p>
                    <h2 className="text-2xl font-bold">
                      {selectedItem.itemName}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className={`p-2 rounded flex items-center gap-2 text-sm font-medium ${
                      resolvedTheme === "dark"
                        ? "hover:bg-gray-800 text-gray-200"
                        : "hover:bg-gray-100 text-gray-800"
                    }`}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </button>
                </div>

                {selectedItem.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p
                      className={`text-sm ${
                        resolvedTheme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      {selectedItem.description}
                    </p>
                  </div>
                )}

                {selectedItem.purpose && (
                  <div>
                    <h3 className="font-semibold mb-2">Purpose</h3>
                    <p
                      className={`text-sm ${
                        resolvedTheme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      {selectedItem.purpose}
                    </p>
                  </div>
                )}

                {selectedItem.specifications &&
                  selectedItem.specifications.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Specifications</h3>
                      <ul className="space-y-1">
                        {selectedItem.specifications.map((spec, idx) => (
                          <li
                            key={idx}
                            className={`text-sm flex gap-2 ${
                              resolvedTheme === "dark"
                                ? "text-gray-300"
                                : "text-gray-700"
                            }`}
                          >
                            <span>•</span>
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedItem.options && (
                  <div>
                    <h3 className="font-semibold mb-2">Options</h3>
                    <p
                      className={`text-sm ${
                        resolvedTheme === "dark"
                          ? "text-gray-300"
                          : "text-gray-700"
                      }`}
                    >
                      {selectedItem.options}
                    </p>
                  </div>
                )}

                {/* Points and Price */}
                <div className="flex gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <p className="font-semibold text-lg">
                      {selectedItem.points} Points
                    </p>
                  </div>
                  {selectedItem.price && (
                    <div>
                      <p
                        className={`text-lg font-semibold ${
                          resolvedTheme === "dark"
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        ₱{selectedItem.price.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalogue;
