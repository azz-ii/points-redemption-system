import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/context/AuthContext";
import { Search } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewRedemptionStatusModal, WithdrawConfirmationModal } from "./modals/ViewRedemptionStatusModal";
import { BulkWithdrawModal } from "./modals/BulkWithdrawModal";
import type { RedemptionRequest } from "./modals/types";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import {
  RedemptionStatusTable,
  RedemptionStatusMobileCards,
} from "./components";

export default function RedemptionStatus() {
  const _navigate = useNavigate();
  const _handleLogout = useLogout();

  // State for data
  const [searchQuery, setSearchQuery] = useState(""); // Mobile only
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBulkWithdrawModal, setShowBulkWithdrawModal] = useState(false);
  const [bulkWithdrawTargets, setBulkWithdrawTargets] = useState<RedemptionRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [requests, setRequests] = useState<RedemptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 7; // Mobile only

  // Fetch redemption requests from API
  const fetchRequests = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Mobile filtering and pagination
  const filtered = requests.filter((request) => {
    const q = searchQuery.toLowerCase();
    return (
      request.id.toString().includes(q) ||
      request.requested_for_name.toLowerCase().includes(q) ||
      request.status_display.toLowerCase().includes(q) ||
      request.items.some(item => 
        item.product_code.toLowerCase().includes(q) ||
        item.product_name.toLowerCase().includes(q)
      )
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPageIndex, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filtered.slice(startIndex, endIndex);

  const openDetails = (request: RedemptionRequest) => {
    setSelectedRequest(request);
  };
  
  const closeDetails = () => {
    setSelectedRequest(null);
  };

  const openWithdrawModal = (request: RedemptionRequest) => {
    setSelectedRequest(request);
    setShowWithdrawModal(true);
  };
  
  const closeWithdrawModal = () => {
    setShowWithdrawModal(false);
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

      closeWithdrawModal();
      closeDetails();
      fetchRequests(true);
    } catch (err) {
      console.error("Failed to cancel request:", err);
      alert(err instanceof Error ? err.message : "Failed to cancel request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkWithdraw = async (selectedRequests: RedemptionRequest[]) => {
    setBulkWithdrawTargets(selectedRequests);
    setShowBulkWithdrawModal(true);
  };

  const handleBulkWithdrawConfirm = async (reason: string) => {
    setIsSubmitting(true);
    try {
      const results = await Promise.allSettled(
        bulkWithdrawTargets.map(request =>
          fetchWithCsrf(`${API_URL}/redemption-requests/${request.id}/withdraw_request/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ withdrawal_reason: reason }),
          })
        )
      );

      const succeeded = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      if (succeeded > 0) {
        alert(`Successfully cancelled ${succeeded} request(s)${failed > 0 ? `, ${failed} failed` : ""}`);
      } else {
        throw new Error("All cancellations failed");
      }

      setShowBulkWithdrawModal(false);
      setBulkWithdrawTargets([]);
      fetchRequests(true);
    } catch (err) {
      console.error("Bulk withdraw failed:", err);
      alert(err instanceof Error ? err.message : "Failed to cancel requests");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col flex-1 p-4 pb-20">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">Redemption Status</h1>
          <p className="text-xs text-muted-foreground">
            See exactly where your rewards are
          </p>
        </div>

        {/* Mobile Search Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border bg-background border-border">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
            />
          </div>
        </div>

        <TooltipProvider>
          <RedemptionStatusMobileCards
            requests={paginatedRequests}
            filteredCount={filtered.length}
            onViewRequest={openDetails}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPageIndex}
            loading={loading}
            error={error}
          />
        </TooltipProvider>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-1">Redemption Status</h1>
          <p className="text-base text-muted-foreground">
            See exactly where your rewards are
          </p>
        </div>

        <TooltipProvider>
          <RedemptionStatusTable
            requests={requests}
            onViewRequest={openDetails}
            onCancelRequest={openWithdrawModal}
            onBulkCancel={handleBulkWithdraw}
            onRefresh={() => fetchRequests(true)}
            refreshing={refreshing}
            loading={loading}
            error={error}
          />
        </TooltipProvider>
      </div>

      <ViewRedemptionStatusModal
        isOpen={!!selectedRequest && !showWithdrawModal}
        onClose={closeDetails}
        item={selectedRequest?.items[0] || null}
        request={selectedRequest}
        onRequestWithdrawn={() => fetchRequests(true)}
      />

      {showWithdrawModal && selectedRequest && (
        <WithdrawConfirmationModal
          isOpen={showWithdrawModal}
          onClose={closeWithdrawModal}
          onConfirm={handleWithdraw}
          requestId={selectedRequest.id}
          isSubmitting={isSubmitting}
        />
      )}

      {showBulkWithdrawModal && (
        <BulkWithdrawModal
          isOpen={showBulkWithdrawModal}
          onClose={() => setShowBulkWithdrawModal(false)}
          onConfirm={handleBulkWithdrawConfirm}
          requests={bulkWithdrawTargets}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
