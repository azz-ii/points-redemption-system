import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { SidebarSales } from "@/components/sidebar/sidebar";
import { MobileBottomNavSales } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Search, Filter, ShoppingCart } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewRedemptionStatusModal } from "./modals/ViewRedemptionStatusModal";
import type { RedemptionRequest, RedemptionRequestItem } from "./modals/types";
import {
  RedemptionStatusTable,
  RedemptionStatusMobileCards,
} from "./components";

// SalesPages type (single declaration)
type SalesPages = "dashboard" | "redemption-status" | "redeem-items";

export default function RedemptionStatus() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const currentPage = "redemption-status" as SalesPages;

  // Use currentPage from props to reflect parent routing state
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RedemptionRequestItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 7;

  // Fetch redemption requests from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/redemption-requests/", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch requests: ${response.statusText}`);
        }

        const data = await response.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching redemption requests:", err);
        setError(err instanceof Error ? err.message : "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Flatten request items for display
  const flattenedItems = requests.flatMap((request) =>
    request.items.map((item) => ({
      ...item,
      requestId: request.id,
      status: request.status,
      status_display: request.status_display,
      processing_status: request.processing_status,
      date_requested: request.date_requested,
      request: request,
    }))
  );

  const filtered = flattenedItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.requestId.toString().includes(q) ||
      item.variant_code.toLowerCase().includes(q) ||
      item.catalogue_item_name.toLowerCase().includes(q) ||
      (item.variant_option && item.variant_option.toLowerCase().includes(q)) ||
      item.status_display.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPageIndex, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  const openDetails = (item: RedemptionRequestItem & { request: RedemptionRequest }) => {
    setSelectedItem(item);
    setSelectedRequest(item.request);
  };
  const closeDetails = () => {
    setSelectedItem(null);
    setSelectedRequest(null);
  };

  return (
    <div className="flex h-screen">
      <SidebarSales />

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

          <TooltipProvider>
            <RedemptionStatusTable
              items={paginatedItems}
              onViewItem={openDetails}
              isDark={isDark}
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPageIndex}
              loading={loading}
              error={error}
            />

            <RedemptionStatusMobileCards
              items={paginatedItems}
              filteredCount={filtered.length}
              onViewItem={openDetails}
              isDark={isDark}
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPageIndex}
              loading={loading}
              error={error}
            />
          </TooltipProvider>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      <ViewRedemptionStatusModal
        isOpen={!!selectedItem}
        onClose={closeDetails}
        item={selectedItem}
        request={selectedRequest}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavSales />
    </div>
  );
}
