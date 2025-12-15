import { useTheme } from "next-themes";
import { useMemo, useState } from "react";
import { Search, Bell } from "lucide-react";
import { SidebarMarketing } from "@/components/sidebar";
import { NotificationPanel } from "@/components/notification-panel";
import { MobileBottomNavMarketing } from "@/components/mobile-bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";

interface HistoryItem {
  id: string;
  campaign: string;
  details: string;
  quantity: number;
  status: "Pending" | "Approved" | "Rejected";
}

interface HistoryProps {
  onNavigate?: (page: "dashboard" | "history") => void;
  onLogout?: () => void;
}

export default function MarketingHistory({
  onNavigate,
  onLogout,
}: HistoryProps) {
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const items: HistoryItem[] = [
    {
      id: "MK1001",
      campaign: "Holiday Promo",
      details: "Facebook Ads",
      quantity: 12,
      status: "Pending",
    },
    {
      id: "MK1002",
      campaign: "Holiday Promo",
      details: "Instagram Reels",
      quantity: 8,
      status: "Approved",
    },
    {
      id: "MK1003",
      campaign: "New Year Blast",
      details: "Billboards",
      quantity: 3,
      status: "Rejected",
    },
    {
      id: "MK1004",
      campaign: "New Year Blast",
      details: "Press Release",
      quantity: 6,
      status: "Approved",
    },
    {
      id: "MK1005",
      campaign: "Loyalty Push",
      details: "Email Campaign",
      quantity: 10,
      status: "Pending",
    },
    {
      id: "MK1006",
      campaign: "Loyalty Push",
      details: "SMS Blast",
      quantity: 20,
      status: "Approved",
    },
    {
      id: "MK1007",
      campaign: "Product Launch",
      details: "Influencer Content",
      quantity: 5,
      status: "Pending",
    },
    {
      id: "MK1007",
      campaign: "Product Launch",
      details: "Influencer Content",
      quantity: 5,
      status: "Pending",
    },
    {
      id: "MK1007",
      campaign: "Product Launch",
      details: "Influencer Content",
      quantity: 5,
      status: "Pending",
    },
  ];

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.id, item.campaign, item.details, item.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const handleNavigate = (page: "dashboard" | "history") => {
    if (page === "history") {
      onNavigate?.("marketing-history" as any);
    } else {
      onNavigate?.(page);
    }
  };

  const statusClass = (status: HistoryItem["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-600 text-white";
      case "Rejected":
        return "bg-red-600 text-white";
      default:
        return "bg-yellow-400 text-black";
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
      <SidebarMarketing
        currentPage="history"
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />

      {/* Main */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Header */}
        <div className="sticky top-0 z-30 px-4 py-4 md:px-8 md:py-5 mt-2 md:mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Marketing History
            </h1>
            <p
              className={`text-sm ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Track campaigns and requests
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`p-2 rounded-lg transition-colors border border-transparent ${
                resolvedTheme === "dark"
                  ? "hover:bg-gray-800 hover:border-gray-700"
                  : "hover:bg-gray-100 hover:border-gray-300"
              }`}
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <ThemeToggle />
          </div>
        </div>

        <NotificationPanel
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />

        {/* Search */}
        <div className="p-4 md:p-8">
          <div
            className={`relative flex items-center ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border border-gray-700"
                : "bg-white border border-gray-300"
            }`}
          >
            <Search className="absolute left-3 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search by ID, Campaign, Details, or Status....."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`pl-10 w-full h-12 ${
                resolvedTheme === "dark"
                  ? "bg-transparent border-gray-700 text-white placeholder:text-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden px-4 space-y-3">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="mb-3">
                <p className="text-xs text-gray-400">{item.id}</p>
                <p className="font-semibold text-base mt-1">{item.details}</p>
                <p className="text-sm text-gray-500">{item.campaign}</p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`flex items-center gap-2 text-xs font-semibold ${
                    item.status === "Pending"
                      ? "text-yellow-400"
                      : item.status === "Approved"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {item.status}
                </span>
                <span className="text-xs text-gray-500">2025-12-31</span>
              </div>
              <button
                onClick={() => setSelectedItem(item)}
                className="w-full py-2.5 rounded bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 text-sm font-semibold transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div
          className={`hidden md:block border rounded-lg overflow-hidden ${
            resolvedTheme === "dark"
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          } transition-colors mx-4 md:mx-8`}
        >
          <table className="w-full">
            <thead>
              <tr
                className={
                  resolvedTheme === "dark"
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }
              >
                <th className="text-left p-4 font-semibold">ID</th>
                <th className="text-left p-4 font-semibold">Campaign</th>
                <th className="text-left p-4 font-semibold">Details</th>
                <th className="text-left p-4 font-semibold">Quantity</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className={
                    resolvedTheme === "dark"
                      ? "hover:bg-gray-800"
                      : "hover:bg-gray-50"
                  }
                >
                  <td className="p-4 font-medium">{item.id}</td>
                  <td className="p-4">
                    <span className="inline-block rounded-full px-2 py-1 text-xs font-semibold bg-green-500 text-white">
                      {item.campaign}
                    </span>
                  </td>
                  <td className="p-4">{item.details}</td>
                  <td className="p-4">{item.quantity}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-2 rounded-md font-medium ${
              resolvedTheme === "dark"
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            Previous
          </button>
          <span
            className={`text-sm ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Page {safePage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className={`px-3 py-2 rounded-md font-medium ${
              resolvedTheme === "dark"
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
          >
            Next
          </button>
        </div>
      </div>

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
                  <h2 className="text-xl font-bold">View Account</h2>
                  <p className="text-sm text-gray-400 mt-1">Details for Izza</p>
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
            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm text-gray-400 mb-1">Username</p>
                <p className="font-semibold">{selectedItem.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Full Name</p>
                <p className="font-semibold">Izza</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Email</p>
                <p className="font-semibold">
                  {selectedItem.id.toLowerCase()}@email.com
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Position</p>
                <p className="font-semibold">{selectedItem.campaign}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <p className="font-semibold">
                  {selectedItem.status === "Approved"
                    ? "Active"
                    : selectedItem.status === "Rejected"
                    ? "Inactive"
                    : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile nav */}
      <MobileBottomNavMarketing
        currentPage="history"
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />
    </div>
  );
}
