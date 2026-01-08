import { useState } from "react";
import { useTheme } from "next-themes";
import { SidebarSales } from "@/components/sidebar/sidebar";
import { MobileBottomNavSales } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Search, Filter, ShoppingCart } from "lucide-react";
import { ViewRedemptionStatusModal, type StatusItem } from "./modals";
import {
  RedemptionStatusTable,
  RedemptionStatusMobileCards,
} from "./components";

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
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const itemsPerPage = 7;

  const history: StatusItem[] = [
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Pending",
      date: "2025-12-31",
      image: "/images/tshirt.png",
    },
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Approved",
      date: "2025-12-31",
      image: "/images/tshirt.png",
    },
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Rejected",
      date: "2025-12-31",
      image: "/images/tshirt.png",
    },
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Rejected",
      date: "2025-12-31",
      image: "/images/tshirt.png",
    },
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Rejected",
      date: "2025-12-31",
      image: "/images/tshirt.png",
    },
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Rejected",
      date: "2025-12-31",
      image: "/images/tshirt.png",
    },
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Rejected",
      date: "2025-12-31",
      image: "/images/tshirt.png",
    },
    {
      id: "MC0003C",
      type: "T-shirt",
      details: "Platinum Polo",
      status: "Rejected",
      date: "2025-12-31",
      image: "/images/tshirt.png",
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPageIndex, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, endIndex);

  const handleNavigate = (page: SalesPages) => onNavigate(page);

  const openDetails = (item: StatusItem) => setSelectedItem(item);
  const closeDetails = () => setSelectedItem(null);

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

          <RedemptionStatusTable
            items={paginatedItems}
            onViewItem={openDetails}
            isDark={isDark}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPageIndex}
          />

          <RedemptionStatusMobileCards
            items={paginatedItems}
            filteredCount={filtered.length}
            onViewItem={openDetails}
            isDark={isDark}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPageIndex}
          />
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
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavSales
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />
    </div>
  );
}
