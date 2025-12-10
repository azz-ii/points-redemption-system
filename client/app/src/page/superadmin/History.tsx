import { useState } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { Bell, Eye, Search, Sliders, Warehouse, X, LogOut } from "lucide-react";

interface HistoryItem {
  id: string;
  type: string;
  details: string;
  quantity: number;
  status: "Pending" | "Approved" | "Rejected";
}

interface HistoryProps {
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

function History({ onNavigate, onLogout }: HistoryProps) {
  const { resolvedTheme } = useTheme();
  const activePage = "history";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [historyItems] = useState<HistoryItem[]>([
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      quantity: 8,
      status: "Pending",
    },
    {
      id: "MC0004C",
      type: "Cap",
      details: "Platinum Cap",
      quantity: 5,
      status: "Approved",
    },
    {
      id: "SA220015",
      type: "Tie",
      details: "Corporate Tie",
      quantity: 10,
      status: "Rejected",
    },
    {
      id: "SA220016",
      type: "Shirt",
      details: "Casual Shirt",
      quantity: 10,
      status: "Rejected",
    },
    {
      id: "SA220017",
      type: "Jacket",
      details: "Wool Jacket",
      quantity: 5,
      status: "Approved",
    },
    {
      id: "SA220018",
      type: "Pants",
      details: "Business Pants",
      quantity: 3,
      status: "Pending",
    },
    {
      id: "SA220019",
      type: "Shoes",
      details: "Leather Shoes",
      quantity: 7,
      status: "Approved",
    },
    {
      id: "SA220020",
      type: "Belt",
      details: "Leather Belt",
      quantity: 4,
      status: "Rejected",
    },
  ]);

  const totalPages = Math.ceil(historyItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = historyItems.slice(startIndex, endIndex);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar
        currentPage="history"
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
              <h1 className="text-3xl font-semibold">History</h1>
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

          {/* Filter and Search */}
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
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historyItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4 text-sm">{item.id}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          resolvedTheme === "dark"
                            ? "bg-green-700 text-green-200"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.details}</td>
                    <td className="px-6 py-4 text-sm">{item.quantity}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "Pending"
                            ? "bg-yellow-400 text-black"
                            : item.status === "Approved"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors ${
                            resolvedTheme === "dark"
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          }`}
                        >
                          <Eye className="h-4 w-4" />
                          View
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
          <h2 className="text-2xl font-semibold mb-2">History</h2>
          <p
            className={`text-xs mb-4 ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            View and manage redemptions
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
            {historyItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } transition-colors`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm">{item.id}</p>
                    <p
                      className={`text-xs ${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {item.details}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === "Pending"
                        ? "bg-yellow-400 text-black"
                        : item.status === "Approved"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        resolvedTheme === "dark"
                          ? "bg-green-700 text-green-200"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.type}
                    </span>
                    <p
                      className={`text-xs mt-2 ${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className={`ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold shadow-sm transition-colors ${
                      resolvedTheme === "dark"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MobileBottomNav
        currentPage={activePage}
        onNavigate={onNavigate || (() => {})}
      />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div
            className={`${
              resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
            } rounded-lg shadow-2xl max-w-md w-full pointer-events-auto border ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold">View Details</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Request ID</p>
                <p className="font-semibold">{selectedItem.id}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <p className="font-semibold">{selectedItem.type}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Details</p>
                <p className="font-semibold">{selectedItem.details}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Quantity</p>
                <p className="font-semibold">{selectedItem.quantity}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedItem.status === "Pending"
                      ? "bg-yellow-400 text-black"
                      : selectedItem.status === "Approved"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {selectedItem.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
