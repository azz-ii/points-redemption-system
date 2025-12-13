import { useState } from "react";
import { useTheme } from "next-themes";
import { SidebarSales } from "@/components/sidebar/sidebar";
import { MobileBottomNavSales } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Search, Filter, Eye, X, ShoppingCart } from "lucide-react";

interface StatusItem {
  id: string;
  type: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected";
  date: string;
}

// SalesPages type (single declaration)
type SalesPages = "dashboard" | "redemption-status" | "redeem-items";

interface RedemptionStatusProps {
  onNavigate: (page: SalesPages) => void;
  onLogout?: () => void;
  currentPage?: SalesPages;
}

export default function RedemptionStatus({
  onNavigate,
  onLogout,
  currentPage = "redemption-status",
}: RedemptionStatusProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Use currentPage from props to reflect parent routing state
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StatusItem | null>(null);

  const history: StatusItem[] = [
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Pending",
      date: "2025-12-31",
    },
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Approved",
      date: "2025-12-31",
    },
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Rejected",
      date: "2025-12-31",
    },
  ];

  const filtered = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.details.toLowerCase().includes(q)
    );
  });

  const handleNavigate = (page: SalesPages) => onNavigate(page);

  const openDetails = (item: StatusItem) => setSelectedItem(item);
  const closeDetails = () => setSelectedItem(null);

  const statusChip = (status: StatusItem["status"]) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold inline-block";
    if (status === "Approved")
      return `${base} ${
        isDark ? "bg-green-500 text-black" : "bg-green-100 text-green-700"
      }`;
    if (status === "Pending")
      return `${base} ${
        isDark ? "bg-yellow-400 text-black" : "bg-yellow-100 text-yellow-700"
      }`;
    return `${base} ${
      isDark ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
    }`;
  };

  return (
    <div className="flex h-screen">
      <SidebarSales
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />

      <div
        className={`flex-1 overflow-y-auto pb-20 md:pb-0 ${
          isDark ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-8 md:pb-6">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-1">
                Redemption Status
              </h1>
              <p
                className={`text-xs md:text-base ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                See exactly where your rewards are
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className={`relative p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
                aria-label="Cart"
              >
                <ShoppingCart className="h-6 w-6" />
              </button>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Search + Actions */}
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
            <div
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-800"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Search
                className={`h-5 w-5 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search by ID, Name......"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${
                  isDark
                    ? "text-white placeholder-gray-500"
                    : "text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
            <button
              className={`hidden md:inline-flex items-center justify-center p-3 rounded-lg border ${
                isDark
                  ? "border-gray-800 hover:bg-gray-800"
                  : "border-gray-200 hover:bg-gray-100"
              }`}
              aria-label="Filter"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Table */}
          <div
            className={`hidden md:block rounded-lg border overflow-hidden ${
              isDark ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <table className="w-full">
              <thead className={isDark ? "bg-gray-900" : "bg-gray-50"}>
                <tr>
                  <th
                    className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    ID
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Type
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Details
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-t ${
                      isDark ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium">{item.id}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isDark
                            ? "bg-green-700 text-white"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {item.details}
                    </td>
                    <td className="px-6 py-4">
                      <span className={statusChip(item.status)}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className={
                          `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ` +
                          (isDark
                            ? "bg-blue-600 text-white hover:bg-blue-500"
                            : "bg-blue-600 text-white hover:bg-blue-700")
                        }
                        aria-label="View"
                        onClick={() => openDetails(item)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards: Request History */}
          <div className="md:hidden" aria-live="polite">
            <h2 className="text-xl font-bold mb-2">Request History</h2>
            <p
              className={`${
                isDark ? "text-gray-400" : "text-gray-600"
              } text-xs mb-4`}
            >
              Showing {filtered.length} processed
            </p>

            <div className="space-y-3">
              {filtered.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border ${
                    isDark
                      ? "bg-gray-900 border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {item.id}
                        </p>
                        <h3 className="text-lg font-bold">{item.type}</h3>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {item.details}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={statusChip(item.status)}>
                          {item.status}
                        </span>
                        <p
                          className={`text-xs mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {item.date}
                        </p>
                        <div className="mt-3">
                          <button
                            onClick={() => openDetails(item)}
                            className={
                              `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ` +
                              (isDark
                                ? "bg-blue-600 text-white hover:bg-blue-500"
                                : "bg-blue-600 text-white hover:bg-blue-700")
                            }
                            aria-label={`View details for ${item.details}`}
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeDetails}
          />
          {/* Card */}
          <div
            className={`relative mx-4 w-full max-w-md md:max-w-3xl rounded-xl shadow-2xl ${
              isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`}
          >
            {/* Top bar with close */}
            <div className="flex items-center justify-end p-3">
              <button
                onClick={closeDetails}
                className={`p-2 rounded-md ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Content area: stacked on mobile, side-by-side on desktop */}
            <div className="px-4 md:px-6">
              <div className="md:flex md:gap-6">
                {/* Image */}
                <div className="overflow-hidden rounded-lg md:w-1/2">
                  <img
                    src="/images/sample-shirt.jpg"
                    alt={`${selectedItem.type}: ${selectedItem.details}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Details */}
                <div className="pb-4 md:pb-6 md:w-1/2">
                  <p
                    className={`mt-3 text-sm font-semibold ${
                      isDark ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    {selectedItem.id}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">
                    {selectedItem.details}
                  </h3>
                  <div
                    className={`mt-3 space-y-3 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">Description</p>
                      <p className="text-sm">
                        Premium cotton polo for events and daily wear.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Purpose</p>
                      <p className="text-sm">
                        Company events or stylish uniform piece.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Specifications</p>
                      <ul className="list-disc pl-5 text-sm">
                        <li>Material: 100% Platinum Cotton</li>
                        <li>Fit: Modern</li>
                        <li>Collar: Ribbed Polo</li>
                        <li>Sleeves: Short with ribbed armbands</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Options</p>
                      <p className="text-sm">
                        Sizes S–XL; Colors Black, White, Navy Blue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Bottom points/price bar */}
            <div
              className={`flex items-center justify-end rounded-b-xl px-4 md:px-6 py-3 ${
                isDark ? "bg-gray-800" : "bg-gray-100"
              }`}
            >
              <p
                className={`ml-auto text-sm font-bold ${
                  isDark ? "text-yellow-300" : "text-yellow-600"
                }`}
              >
                500 Points
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavSales
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />
    </div>
  );
}
