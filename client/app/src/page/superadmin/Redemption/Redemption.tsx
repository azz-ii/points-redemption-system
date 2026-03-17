import { useState, useMemo, useCallback } from "react";
import { handlerRequestsApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useHandlerRequests } from "@/hooks/queries/useMarketingRequests";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  ViewRedemptionModal,
  MarkAsProcessedModal,
  CancelRequestModal,
  ExportModal,
  type RedemptionItem,
  type MyProcessingStatus,
  type ProcessItemData,
} from "./modals";
import { RedemptionTable, RedemptionMobileCards } from "./components";
import { toast } from "sonner";

function Redemption() {  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: rawRequests, isLoading: loading, isFetching: refreshing, error: queryError } = useHandlerRequests(30_000);
  const requests = (rawRequests ?? []) as unknown as RedemptionItem[];
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load requests") : null;

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RedemptionItem | null>(
    null,
  );
  const [myProcessingStatus, setMyProcessingStatus] =
    useState<MyProcessingStatus | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelRequest, setSelectedCancelRequest] = useState<RedemptionItem | null>(null);

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.requests.all });
  }, [queryClient]);

  const fetchMyProcessingStatus = useCallback(async (requestId: number) => {
    try {
      const status =
        await handlerRequestsApi.getMyProcessingStatus(requestId);
      setMyProcessingStatus(status);
      return status;
    } catch (err) {
      console.error("Error fetching processing status:", err);
      toast.error("Failed to load processing status");
      return null;
    }
  }, []);

  const pageSize = 7;
  const { filteredRequests, totalPages, safePage, paginatedRequests } = useMemo(() => {
    const filtered = requests.filter((request) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        request.id.toString().includes(query) ||
        request.requested_by_name.toLowerCase().includes(query) ||
        request.requested_for_name.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query)
      );
    });

    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safe = Math.min(currentPage, pages);
    const start = (safe - 1) * pageSize;
    return {
      filteredRequests: filtered,
      totalPages: pages,
      safePage: safe,
      paginatedRequests: filtered.slice(start, start + pageSize),
    };
  }, [requests, searchQuery, currentPage, pageSize]);

  const handleViewClick = useCallback(
    async (request: RedemptionItem) => {
      setSelectedRequest(request);
      await fetchMyProcessingStatus(request.id);
      setShowViewModal(true);
    },
    [fetchMyProcessingStatus],
  );

  const handleMarkProcessedClick = useCallback(
    async (request: RedemptionItem) => {
      setSelectedRequest(request);
      const status = await fetchMyProcessingStatus(request.id);
      if (status && status.pending_items > 0) {
        setShowProcessModal(true);
      } else {
        toast.info("All your items have already been processed");
      }
    },
    [fetchMyProcessingStatus],
  );

  const handleMarkProcessedConfirm = async (items: ProcessItemData[], photo?: File) => {
    if (!selectedRequest) return;

    try {
      await handlerRequestsApi.markItemsProcessed(selectedRequest.id, items);
      // Upload processing photo if provided
      if (photo) {
        try {
          await handlerRequestsApi.uploadProcessingPhoto(selectedRequest.id, photo);
        } catch (photoErr) {
          console.error("Error uploading processing photo:", photoErr);
          toast.warning("Items processed, but photo upload failed. You can try again later.");
        }
      }
      toast.success("Items marked as processed successfully");
      setShowProcessModal(false);
      setSelectedRequest(null);
      setMyProcessingStatus(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    } catch (err) {
      console.error("Error marking items as processed:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to mark items as processed",
      );
    }
  };

  const handleCancelConfirm = async (reason: string, remarks: string) => {
    if (!selectedCancelRequest) return;
    try {
      await handlerRequestsApi.cancelRequest(selectedCancelRequest.id, reason, remarks || undefined);
      toast.success("Request cancelled successfully");
      setShowCancelModal(false);
      setSelectedCancelRequest(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    } catch (err) {
      console.error("Error cancelling request:", err);
      toast.error(err instanceof Error ? err.message : "Failed to cancel request");
    }
  };

  // Check if the current user can mark this request's items as processed
  const canMarkProcessed = useCallback((request: RedemptionItem): boolean => {
    // Only approved requests that aren't cancelled can be processed
    return (
      request.status === "APPROVED" &&
      request.processing_status !== "CANCELLED" &&
      request.processing_status !== "PROCESSED"
    );
  }, []);

  return (
    <>


        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:h-full md:overflow-hidden md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold">Process Requests</h1>
              <p
                className="text-sm text-muted-foreground"
              >
                View and process approved redemption requests for your assigned
                items
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className={`p-2 rounded-lg bg-card hover:bg-accent transition-colors ${refreshing ? "opacity-50" : ""}`}
                title="Refresh"
              >
                <RefreshCw
                  className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {error ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              {error}
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <RedemptionTable
                redemptions={filteredRequests}
                loading={loading}
                onView={handleViewClick}
                onMarkAsProcessed={handleMarkProcessedClick}
                canMarkProcessed={canMarkProcessed}
                onCancelRequest={(item) => {
                  setSelectedCancelRequest(item);
                  setShowCancelModal(true);
                }}
                onRefresh={handleManualRefresh}
                refreshing={refreshing}
                onExport={() => setShowExportModal(true)}
                fillHeight
              />
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto pb-20">
          <div className="p-4">
            {/* Header */}
            <h1 className="text-xl font-semibold mb-1">Process Requests</h1>
            <p className="text-xs text-muted-foreground mb-4">
              Process approved redemption requests
            </p>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <RedemptionMobileCards
              paginatedItems={paginatedRequests}
              filteredItems={filteredRequests}
              loading={loading}
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onView={handleViewClick}
              onMarkProcessed={handleMarkProcessedClick}
              canMarkProcessed={canMarkProcessed}
              onCancelRequest={(item) => {
                setSelectedCancelRequest(item);
                setShowCancelModal(true);
              }}
            />

            {/* Mobile Pagination */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              <span className="text-xs font-medium">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, safePage + 1))
                }
                disabled={safePage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      <ViewRedemptionModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRequest(null);
          setMyProcessingStatus(null);
        }}
        item={selectedRequest}
        myItems={myProcessingStatus?.items}
        onMarkItemProcessed={() => {
          setShowViewModal(false);
          if (myProcessingStatus && myProcessingStatus.pending_items > 0) {
            setShowProcessModal(true);
          } else {
            toast.info("All your items have already been processed");
            setSelectedRequest(null);
            setMyProcessingStatus(null);
          }
        }}
        onCancelRequest={() => {
          setShowViewModal(false);
          setSelectedCancelRequest(selectedRequest);
          setSelectedRequest(null);
          setMyProcessingStatus(null);
          setShowCancelModal(true);
        }}
      />

      <MarkAsProcessedModal
        isOpen={showProcessModal}
        onClose={() => {
          setShowProcessModal(false);
          setSelectedRequest(null);
          setMyProcessingStatus(null);
        }}
        item={selectedRequest}
        myItems={myProcessingStatus?.items || []}
        pendingCount={myProcessingStatus?.pending_items || 0}
        onConfirm={handleMarkProcessedConfirm}
      />

      <CancelRequestModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedCancelRequest(null);
        }}
        item={selectedCancelRequest}
        onConfirm={handleCancelConfirm}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        redemptions={requests}
      />
    </>
  );
}

export default Redemption;
