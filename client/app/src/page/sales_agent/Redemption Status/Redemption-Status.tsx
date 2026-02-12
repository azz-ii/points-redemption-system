import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/context/AuthContext";
import { Search } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewRedemptionStatusModal, WithdrawConfirmationModal } from "./modals/ViewRedemptionStatusModal";
import type { RedemptionRequest, RedemptionRequestItem } from "./modals/types";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import {
  RedemptionStatusTable,
  RedemptionStatusMobileCards,
} from "./components";

// SalesPages type (single declaration)
type SalesPages = "dashboard" | "redemption-status" | "redeem-items";

export default function RedemptionStatus() {
  const _navigate = useNavigate();
  const _handleLogout = useLogout();
  const _currentPage = "redemption-status" as SalesPages;

  // Use currentPage from props to reflect parent routing state
  const [searchQuery, setSearchQuery] = useState(""); // Only for mobile view
  const [selectedItem, setSelectedItem] = useState<RedemptionRequestItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1); // Only for mobile view
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 7; // Only for mobile view

  // Fetch redemption requests from API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/redemption-requests/`, {
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

  useEffect(() => {
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

  // Filtering and pagination for mobile view only
  const filtered = flattenedItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.requestId.toString().includes(q) ||
      item.product_code.toLowerCase().includes(q) ||
      item.product_name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
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

  const openCancelModal = (item: RedemptionRequestItem & { request: RedemptionRequest }) => {
    setSelectedItem(item);
    setSelectedRequest(item.request);
    setShowCancelModal(true);
  };
  const closeCancelModal = () => {
    setShowCancelModal(false);
  };

  const handleWithdraw = async (reason: string) => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetchWithCsrf(`${API_URL}/redemption-requests/${selectedRequest.id}/withdraw_request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawal_reason: reason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel request");
      }

      closeCancelModal();
      fetchRequests();
    } catch (err) {
      console.error("Failed to cancel request:", err);
      alert(err instanceof Error ? err.message : "Failed to cancel request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto pb-20 md:pb-0"
    >
      {/* Header */}
      <div className="p-4 md:p-8 md:pb-6">
        <div className="flex justify-between items-start mb-4 md:mb-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1">
              Redemption Status
            </h1>
            <p
              className="text-xs md:text-base text-muted-foreground"
            >
              See exactly where your rewards are
            </p>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="flex md:hidden items-center gap-3 mb-4">
          <div
            className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border bg-background border-border"
          >
            <Search
              className="h-5 w-5 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search by ID, Name......"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
            />
          </div>
        </div>

        <TooltipProvider>
          <RedemptionStatusTable
            items={flattenedItems}
            onViewItem={openDetails}
            onCancelRequest={openCancelModal}
            loading={loading}
            error={error}
          />

          <RedemptionStatusMobileCards
            items={paginatedItems}
            filteredCount={filtered.length}
            onViewItem={openDetails}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPageIndex}
            loading={loading}
            error={error}
          />
        </TooltipProvider>
      </div>

      <ViewRedemptionStatusModal
        isOpen={!!selectedItem && !showCancelModal}
        onClose={closeDetails}
        item={selectedItem}
        request={selectedRequest}
        onRequestWithdrawn={fetchRequests}
      />

      {showCancelModal && selectedRequest && (
        <WithdrawConfirmationModal
          isOpen={showCancelModal}
          onClose={closeCancelModal}
          onConfirm={handleWithdraw}
          requestId={selectedRequest.id}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
