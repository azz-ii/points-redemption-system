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
import { Bell, Search, Sliders, Filter, Warehouse, LogOut } from "lucide-react";
import {
  ViewRedemptionModal,
  EditRedemptionModal,
  type RedemptionItem,
} from "./modals";
import { RedemptionTable, RedemptionMobileCards } from "./components";
import { toast } from "react-hot-toast";

// Using the API response type directly
type RedemptionItemAPI = RedemptionRequestResponse;

interface RedemptionProps {
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

function Redemption({ onNavigate, onLogout }: RedemptionProps) {
  const { resolvedTheme } = useTheme();
  const currentPage = "redemption";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const itemsPerPage = 7;
  const [selectedItem, setSelectedItem] = useState<RedemptionItem | null>(null);
  const [editItem, setEditItem] = useState<RedemptionItem | null>(null);
  const [processItem, setProcessItem] = useState<RedemptionItem | null>(null);
  const [cancelItem, setCancelItem] = useState<RedemptionItem | null>(null);
  const [items, setItems] = useState<RedemptionItemAPI[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // Only for mobile view
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

  // Filtering and pagination for mobile only
  // Filter and pagination for mobile view only
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

  const handleMarkAsProcessed = async (remarks: string) => {
    if (!processItem) return;

    setProcessItem(null);
    toast.success("Request marked as processed successfully");

    redemptionRequestsApi
      .markAsProcessed(processItem.id, remarks)
      .then(() => {
        fetchRequests();
      })
      .catch((err) => {
        toast.error(err.message || "Failed to mark request as processed");
        fetchRequests();
      });
  };

  const handleCancelRequest = async (reason: string, remarks: string) => {
    if (!cancelItem) return;

    setCancelItem(null);
    toast.success("Request cancelled successfully");

    redemptionRequestsApi
      .cancelRequest(cancelItem.id, reason, remarks)
      .then(() => {
        fetchRequests();
      })
      .catch((err) => {
        toast.error(err.message || "Failed to cancel request");
        fetchRequests();
      });
  };

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

          <RedemptionTable
            redemptions={items as unknown as RedemptionItem[]}
            loading={loading}
            onView={(item) => setSelectedItem(item)}
            onEdit={(item) => setEditItem(item)}
            onMarkAsProcessed={(item) => setProcessItem(item)}
            onCancelRequest={(item) => setCancelItem(item)}
            onCreateNew={() => console.log("Create new redemption request")}
          />
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

          <RedemptionMobileCards
            paginatedItems={paginatedItems as unknown as RedemptionItem[]}
            filteredItems={filteredItems as unknown as RedemptionItem[]}
            loading={loading}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPageIndex}
            onView={(item) => setSelectedItem(item)}
            onEdit={(item) => setEditItem(item)}
          />
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

      <ViewRedemptionModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem as RedemptionItem}
      />

      <EditRedemptionModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem as RedemptionItem}
      />

      <MarkAsProcessedModal
        isOpen={!!processItem}
        onClose={() => setProcessItem(null)}
        item={processItem as RedemptionItem}
        onConfirm={handleMarkAsProcessed}
      />

      <CancelRequestModal
        isOpen={!!cancelItem}
        onClose={() => setCancelItem(null)}
        item={cancelItem as RedemptionItem}
        onConfirm={handleCancelRequest}
      />
    </div>
  );
}

export default Redemption;
