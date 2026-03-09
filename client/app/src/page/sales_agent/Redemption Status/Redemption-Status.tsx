import { useState, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import { useRequests } from "@/hooks/queries/useRequests";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewRedemptionStatusModal, WithdrawConfirmationModal } from "./modals/ViewRedemptionStatusModal";
import { BulkWithdrawModal } from "./modals/BulkWithdrawModal";
import type { RedemptionRequest } from "./modals/types";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  RedemptionStatusTable,
  RedemptionStatusMobileCards,
} from "./components";

export default function RedemptionStatus() {
  const queryClient = useQueryClient();

  // State for data
  const [searchQuery, setSearchQuery] = useState(""); // Mobile only
  const [selectedRequest, setSelectedRequest] = useState<RedemptionRequest | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBulkWithdrawModal, setShowBulkWithdrawModal] = useState(false);
  const [bulkWithdrawTargets, setBulkWithdrawTargets] = useState<RedemptionRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const itemsPerPage = 7; // Mobile only

  const { data: requests = [], isLoading: loading, isFetching: refreshing } = useRequests(30_000);
  const error: string | null = null;

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.requests.all });
  }, [queryClient]);

  // Mobile filtering and pagination
  const { filtered, totalPages, safePage, paginatedRequests } = useMemo(() => {
    const f = requests.filter((request) => {
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

    const pages = Math.max(1, Math.ceil(f.length / itemsPerPage));
    const safe = Math.min(currentPageIndex, pages);
    const start = (safe - 1) * itemsPerPage;
    return {
      filtered: f,
      totalPages: pages,
      safePage: safe,
      paginatedRequests: f.slice(start, start + itemsPerPage),
    };
  }, [requests, searchQuery, currentPageIndex, itemsPerPage]);

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
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    } catch (err) {
      console.error("Bulk withdraw failed:", err);
      alert(err instanceof Error ? err.message : "Failed to cancel requests");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
      <div className="hidden md:flex md:flex-col md:h-full md:overflow-hidden md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-1">Redemption Status</h1>
          <p className="text-base text-muted-foreground">
            See exactly where your rewards are
          </p>
        </div>

        <div className="flex-1 min-h-0">
          <TooltipProvider>
            <RedemptionStatusTable
              requests={requests}
              onViewRequest={openDetails}
              onCancelRequest={openWithdrawModal}
              onBulkCancel={handleBulkWithdraw}
              onRefresh={handleManualRefresh}
              refreshing={refreshing}
              loading={loading}
              error={error}
              fillHeight
            />
          </TooltipProvider>
        </div>
      </div>

      <ViewRedemptionStatusModal
        isOpen={!!selectedRequest && !showWithdrawModal}
        onClose={closeDetails}
        item={selectedRequest?.items[0] || null}
        request={selectedRequest}
        onRequestWithdrawn={() => queryClient.invalidateQueries({ queryKey: queryKeys.requests.all })}
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
    </>
  );
}
