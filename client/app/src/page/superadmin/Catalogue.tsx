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
  Home,
  LogOut,
  History as HistoryIcon,
  Package,
} from "lucide-react";

interface CatalogueItem {
  id: string;
  itemName: string;
  type: string;
  points: number;
  image?: string;
}

interface CatalogueProps {
  onNavigate?: (
    page: "dashboard" | "history" | "accounts" | "catalogue"
  ) => void;
  onLogout?: () => void;
}

function Catalogue({ onNavigate, onLogout }: CatalogueProps) {
  const { resolvedTheme } = useTheme();
  const [items] = useState<CatalogueItem[]>([
    {
      id: "MC3001",
      itemName: "Platinum Polo",
      type: "Apparel",
      points: 5000,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

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
            <button
              className={`p-2 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "border-gray-700 hover:bg-gray-900"
                  : "border-gray-300 hover:bg-gray-100"
              } transition-colors`}
            >
              <Sliders className="h-5 w-5" />
            </button>
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
          className="flex flex-col items-center gap-1"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs">Dashboard</span>
        </button>
        <button
          onClick={() => onNavigate?.("history")}
          className="flex flex-col items-center gap-1"
        >
          <HistoryIcon className="h-6 w-6" />
          <span className="text-xs">History</span>
        </button>
        <button
          onClick={() => onNavigate?.("catalogue")}
          className="flex flex-col items-center gap-1"
        >
          <Package className="h-6 w-6" />
          <span className="text-xs">Catalogue</span>
        </button>
        <button onClick={onLogout} className="flex flex-col items-center gap-1">
          <LogOut className="h-6 w-6" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Catalogue;
