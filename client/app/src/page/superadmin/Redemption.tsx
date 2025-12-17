import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sidebar } from "@/components/sidebar";
import {
  redemptionRequestsApi,
  type RedemptionRequestResponse,
} from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  Search,
  Sliders,
  Filter,
  Warehouse,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash,
} from "lucide-react";

// Using the API response type directly
type RedemptionItem = RedemptionRequestResponse;

interface RedemptionProps {
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

function Redemption({ onNavigate, onLogout }: RedemptionProps) {
  const { resolvedTheme } = useTheme();
  const currentPage = "redemption";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const itemsPerPage = 7;
  const [selectedItem, setSelectedItem] = useState<RedemptionItem | null>(null);
  const [editItem, setEditItem] = useState<RedemptionItem | null>(null);
  const [items, setItems] = useState<RedemptionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch redemption requests on mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const requests = await redemptionRequestsApi.getRequests();
        setItems(requests);
      } catch (err) {
        console.error("Error fetching redemption requests:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load redemption requests"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.id.toString().includes(q) ||
      item.requested_for_name.toLowerCase().includes(q) ||
      item.requested_by_name.toLowerCase().includes(q) ||
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
        currentPage="redemption"
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
            <h1 className="text-3xl font-semibold">Redemption Request</h1>
            <div className="flex items-center gap-3">
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

          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div
              className={`relative flex items-center rounded-md border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-300"
              } w-full max-w-xl flex-1`}
            >
              <Search className="absolute left-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPageIndex(1);
                }}
                className={`pl-10 pr-3 py-3 text-sm ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                    : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                    : "bg-black border-black text-white hover:bg-gray-900"
                }`}
              >
                <Sliders className="h-4 w-4" />
              </button>
              <button
                className={`px-4 py-2 rounded-lg border font-semibold inline-flex items-center gap-2 transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-white text-gray-900 border-gray-300 hover:bg-gray-200"
                    : "bg-black text-white border-black hover:bg-gray-900"
                }`}
              >
                New Request
              </button>
            </div>
          </div>

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
                  <th className="px-5 py-3 text-left font-semibold">
                    Request ID
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Requested By
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Distributor
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Total Points
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
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
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-gray-500"
                    >
                      Loading redemption requests...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-red-500"
                    >
                      {error}
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center text-gray-500"
                    >
                      No redemption requests found
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-gray-200 dark:border-slate-800"
                    >
                      <td className="px-5 py-4 align-middle">#{item.id}</td>
                      <td className="px-5 py-4 align-middle">
                        {item.requested_by_name}
                      </td>
                      <td className="px-5 py-4 align-middle">
                        {item.requested_for_name}
                      </td>
                      <td className="px-5 py-4 align-middle">
                        {item.total_points.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : item.status === "APPROVED"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {item.status_display}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        {new Date(item.date_requested).toLocaleDateString()}
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24 space-y-4">
          <h2 className="text-2xl font-semibold">Redemption Request</h2>
          <div
            className={`relative flex items-center rounded-lg border ${
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
          <div className="flex gap-2">
            <button
              className={`flex-1 p-3 rounded-lg border text-sm font-semibold ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-black border-black text-white"
              } transition-colors flex items-center justify-center gap-2`}
            >
              <Sliders className="h-4 w-4" />
              Filter
            </button>
            <button
              className={`flex-1 p-3 rounded-lg border text-sm font-semibold ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } transition-colors flex items-center justify-center gap-2`}
            >
              <Filter className="h-4 w-4" />
              Sort
            </button>
          </div>
          <button
            className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 border transition-colors font-semibold text-sm ${
              resolvedTheme === "dark"
                ? "bg-white text-gray-900 border-gray-300 hover:bg-gray-200"
                : "bg-black text-white border-black hover:bg-gray-900"
            }`}
          >
            New Request
          </button>

          <div
            className={`border rounded-lg overflow-hidden ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            } transition-colors`}
          >
            <div className="space-y-3 p-4">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  Loading requests...
                </div>
              ) : error ? (
                <div className="px-4 py-8 text-center text-red-500 text-sm">
                  {error}
                </div>
              ) : paginatedItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  No requests found
                </div>
              ) : (
                paginatedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 ${
                      resolvedTheme === "dark" ? "bg-gray-800/50" : "bg-gray-50"
                    } rounded-lg`}
                  >
                    <p className="text-xs text-gray-400 mb-1">#{item.id}</p>
                    <p className="font-semibold text-base mb-0.5">
                      {item.requested_by_name}
                    </p>
                    <p className="text-sm text-gray-400 mb-3">
                      {item.requested_for_name}
                    </p>
                    <div className="flex justify-between items-center mb-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : item.status === "APPROVED"
                            ? "bg-green-500 text-white"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {item.status_display}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.date_requested).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        resolvedTheme === "dark"
                          ? "bg-white text-gray-900 hover:bg-gray-200"
                          : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
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
      />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* View Account Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`relative w-full max-w-md rounded-lg shadow-xl ${
              resolvedTheme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-gray-50 text-gray-900"
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">View Request</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Request #{selectedItem.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <p className="text-sm text-gray-400 mb-1">Requested By</p>
                <p className="font-semibold">
                  {selectedItem.requested_by_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Distributor</p>
                <p className="font-semibold">
                  {selectedItem.requested_for_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Points</p>
                <p className="font-semibold">
                  {selectedItem.total_points.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">
                  Points Deducted From
                </p>
                <p className="font-semibold">
                  {selectedItem.points_deducted_from_display}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <p className="font-semibold">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      selectedItem.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : selectedItem.status === "APPROVED"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {selectedItem.status_display}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Date Requested</p>
                <p className="font-semibold">
                  {new Date(selectedItem.date_requested).toLocaleString()}
                </p>
              </div>
              {selectedItem.reviewed_by_name && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Reviewed By</p>
                  <p className="font-semibold">
                    {selectedItem.reviewed_by_name}
                  </p>
                </div>
              )}
              {selectedItem.date_reviewed && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date Reviewed</p>
                  <p className="font-semibold">
                    {new Date(selectedItem.date_reviewed).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedItem.remarks && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Remarks</p>
                  <p className="font-semibold">{selectedItem.remarks}</p>
                </div>
              )}
              {selectedItem.rejection_reason && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Rejection Reason</p>
                  <p className="font-semibold text-red-500">
                    {selectedItem.rejection_reason}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400 mb-2">
                  Items ({selectedItem.items.length})
                </p>
                <div className="space-y-2">
                  {selectedItem.items.map((reqItem, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        resolvedTheme === "dark"
                          ? "border-gray-700 bg-gray-800"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      <p className="font-semibold text-sm">
                        {reqItem.variant_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Code: {reqItem.variant_code} • Qty: {reqItem.quantity} •{" "}
                        {reqItem.points_per_item} pts each
                      </p>
                      <p className="text-xs font-semibold mt-1">
                        Total: {reqItem.total_points.toLocaleString()} pts
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`relative w-full max-w-md rounded-lg shadow-xl ${
              resolvedTheme === "dark"
                ? "bg-gray-900 text-white"
                : "bg-gray-50 text-gray-900"
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Edit Account</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Update account details for {editItem.name}
                  </p>
                </div>
                <button
                  onClick={() => setEditItem(null)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">ID</label>
                <input
                  type="text"
                  value={editItem.id}
                  disabled
                  className={`w-full px-4 py-3 rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-500"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  } cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editItem.name}
                  disabled
                  className={`w-full px-4 py-3 rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-500"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  } cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={`${editItem.id.toLowerCase()}@email.com`}
                  disabled
                  className={`w-full px-4 py-3 rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-500"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  } cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Item Type
                </label>
                <input
                  type="text"
                  value={editItem.type}
                  disabled
                  className={`w-full px-4 py-3 rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-gray-500"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                  } cursor-not-allowed`}
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  defaultValue={editItem.points}
                  min="1"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Footer Button */}
            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  // Handle update logic here
                  setEditItem(null);
                }}
                className="w-full py-3 rounded-lg bg-white text-gray-900 hover:bg-gray-100 font-semibold transition-colors"
              >
                Update Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Redemption;
