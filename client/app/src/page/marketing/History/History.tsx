import { useTheme } from "next-themes";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/context/AuthContext";
import { Search, Bell, RefreshCw } from "lucide-react";
import { SidebarMarketing } from "@/components/sidebar";
import { NotificationPanel } from "@/components/notification-panel";
import { MobileBottomNavMarketing } from "@/components/mobile-bottom-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { marketingRequestsApi } from "@/lib/api";
import { toast } from "sonner";
import type { RequestItem, MarketingProcessingStatusItem } from "@/page/marketing/ProcessRequests/modals/types";
import { HistoryTable } from "./components/HistoryTable";
import { HistoryMobileCards } from "./components/HistoryMobileCards";
import { ViewRequestModal } from "@/page/marketing/ProcessRequests/modals/ViewRequestModal";

export default function MarketingHistory() {
  const _navigate = useNavigate();
  const _handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [myProcessedItems, setMyProcessedItems] = useState<MarketingProcessingStatusItem[]>([]);

  const fetchHistory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await marketingRequestsApi.getHistory();
      setRequests(data as unknown as RequestItem[]);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredRequests = requests.filter((request) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.id.toString().includes(query) ||
      request.requested_by_name.toLowerCase().includes(query) ||
      request.requested_for_name.toLowerCase().includes(query) ||
      request.status.toLowerCase().includes(query) ||
      request.processing_status.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handleViewClick = (request: RequestItem) => {
    setSelectedRequest(request);
    // Filter items that were processed by this user from the request data
    const processedItems = (request.items?.filter(item => item.item_processed_by !== null) || []) as MarketingProcessingStatusItem[];
    setMyProcessedItems(processedItems);
    setShowViewModal(true);
  };

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <SidebarMarketing />

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
              View your processed requests
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchHistory(true)}
              disabled={refreshing}
              className={`p-2 rounded-lg transition-colors border border-transparent ${
                resolvedTheme === "dark"
                  ? "hover:bg-gray-800 hover:border-gray-700"
                  : "hover:bg-gray-100 hover:border-gray-300"
              } ${refreshing ? "opacity-50" : ""}`}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
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

        

        {/* Mobile Cards */}
        <div className="md:hidden px-4">
          <HistoryMobileCards
            requests={paginatedRequests}
            loading={loading}
            onView={handleViewClick}
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block px-4 md:px-8">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => fetchHistory()}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <HistoryTable
              requests={paginatedRequests}
              loading={loading}
              onView={handleViewClick}
            />
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-md font-medium ${
              resolvedTheme === "dark"
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
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
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-md font-medium ${
              resolvedTheme === "dark"
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* View Request Modal */}
      <ViewRequestModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRequest(null);
          setMyProcessedItems([]);
        }}
        request={selectedRequest}
        myItems={myProcessedItems}
      />

      {/* Mobile nav */}
      <MobileBottomNavMarketing />
    </div>
  );
}
