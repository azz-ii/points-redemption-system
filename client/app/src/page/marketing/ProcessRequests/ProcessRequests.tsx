import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useHandlerRequests } from "@/hooks/queries/useMarketingRequests";
import { useMarkItemsProcessed, useHandlerCancelRequest } from "@/hooks/mutations/useMarketingMutations";
import {
  ViewRequestModal,
  MarkItemsProcessedModal,
  CancelRequestModal,
  type RequestItem,
  type MyProcessingStatus,
  type FlattenedRequestItem,
  type ProcessItemData,
} from "./modals";
import { ProcessRequestsTable, ProcessRequestsMobileCards } from "./components";
import { handlerRequestsApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

function ProcessRequests() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FlattenedRequestItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [myProcessingStatus, setMyProcessingStatus] = useState<MyProcessingStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelRequest, setSelectedCancelRequest] = useState<RequestItem | null>(null);

  const { data: requests = [], isLoading: loading, isFetching: refreshing, error: queryError } = useHandlerRequests(30_000);
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load requests") : null;

  const markItemsMutation = useMarkItemsProcessed();
  const cancelMutation = useHandlerCancelRequest();

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.requests.all });
  }, [queryClient]);

  const fetchMyProcessingStatus = async (requestId: number) => {
    try {
      const status = await handlerRequestsApi.getMyProcessingStatus(requestId);
      setMyProcessingStatus(status);
      return status;
    } catch (err) {
      console.error("Error fetching processing status:", err);
      toast.error("Failed to load processing status");
      return null;
    }
  };

  // Flatten requests to items for table display
  const flattenedItems: FlattenedRequestItem[] = useMemo(() => requests.flatMap((request) =>
    request.items.map((item) => ({
      ...item,
      requestId: request.id,
      requested_by_name: request.requested_by_name,
      requested_for_name: request.requested_for_name,
      request_status: request.status,
      request_status_display: request.status_display,
      request_processing_status: request.processing_status,
      request_processing_status_display: request.processing_status_display,
      date_requested: request.date_requested,
      request: request,
    }))
  ), [requests]);

  // Mobile filtering and pagination
  const pageSize = 7;
  const { filtered, totalPages, safePage, paginatedItems } = useMemo(() => {
    const f = flattenedItems.filter((item) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.requestId.toString().includes(query) ||
        item.product_code.toLowerCase().includes(query) ||
        item.product_name.toLowerCase().includes(query) ||
        item.requested_for_name.toLowerCase().includes(query) ||
        item.requested_by_name.toLowerCase().includes(query) ||
        (item.category && item.category.toLowerCase().includes(query))
      );
    });

    const pages = Math.max(1, Math.ceil(f.length / pageSize));
    const safe = Math.min(currentPage, pages);
    const start = (safe - 1) * pageSize;
    return {
      filtered: f,
      totalPages: pages,
      safePage: safe,
      paginatedItems: f.slice(start, start + pageSize),
    };
  }, [flattenedItems, searchQuery, currentPage, pageSize]);

  const handleViewClick = async (item: FlattenedRequestItem) => {
    setSelectedItem(item);
    setSelectedRequest(item.request);
    await fetchMyProcessingStatus(item.requestId);
    setShowViewModal(true);
  };

  const handleMarkItemProcessedClick = async (item: FlattenedRequestItem) => {
    setSelectedItem(item);
    setSelectedRequest(item.request);
    const status = await fetchMyProcessingStatus(item.requestId);
    if (status && status.pending_items > 0) {
      setShowProcessModal(true);
    } else {
      toast.info("All your items have already been processed");
    }
  };

  const handleMarkProcessedConfirm = async (items: ProcessItemData[], photo?: File) => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      await handlerRequestsApi.markItemsProcessed(selectedRequest.id, items);
      // Upload processing photo if provided (separate call, non-blocking on success)
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
      setSelectedItem(null);
      setSelectedRequest(null);
      setMyProcessingStatus(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    } catch (err) {
      console.error("Error marking items as processed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to mark items as processed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = (item: FlattenedRequestItem) => {
    setSelectedCancelRequest(item.request);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!selectedCancelRequest) return;

    try {
      await handlerRequestsApi.cancelRequest(selectedCancelRequest.id, reason);
      toast.success("Request cancelled successfully");
      setShowCancelModal(false);
      setSelectedCancelRequest(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.all });
    } catch (err) {
      console.error("Error cancelling request:", err);
      toast.error(err instanceof Error ? err.message : "Failed to cancel request");
    }
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col flex-1 p-4 pb-20">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold mb-1">Process Requests</h1>
          <p className="text-xs text-muted-foreground">
            View and process approved redemption requests for your assigned items
          </p>
        </div>

        {/* Mobile Search Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border bg-background border-border">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-transparent outline-none border-none text-foreground placeholder-muted-foreground p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <ProcessRequestsMobileCards
          items={paginatedItems}
          loading={loading}
          onViewRequest={handleViewClick}
          onMarkItemProcessed={handleMarkItemProcessedClick}
          onCancelRequest={handleCancelClick}
        />

        {/* Mobile Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="text-xs font-medium text-foreground">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent text-foreground"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:h-full md:overflow-hidden md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Process Requests</h1>
          <p className="text-sm text-muted-foreground">
            View and process approved redemption requests for your assigned items
          </p>
        </div>

        <div className="flex-1 min-h-0">
          {error ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              {error}
            </div>
          ) : (
            <ProcessRequestsTable
              items={flattenedItems}
              loading={loading}
              onViewRequest={handleViewClick}
              onMarkItemProcessed={handleMarkItemProcessedClick}
              onCancelRequest={handleCancelClick}
              onRefresh={handleManualRefresh}
              refreshing={refreshing}
              fillHeight
            />
          )}
        </div>
      </div>

      <ViewRequestModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedItem(null);
          setSelectedRequest(null);
          setMyProcessingStatus(null);
        }}
        request={selectedRequest}
        myItems={myProcessingStatus?.items}
        onMarkItemProcessed={() => {
          setShowViewModal(false);
          if (myProcessingStatus && myProcessingStatus.pending_items > 0) {
            setShowProcessModal(true);
          } else {
            toast.info("All your items have already been processed");
            setSelectedItem(null);
            setSelectedRequest(null);
            setMyProcessingStatus(null);
          }
        }}
        onCancelRequest={() => {
          setShowViewModal(false);
          setSelectedCancelRequest(selectedRequest);
          setSelectedItem(null);
          setMyProcessingStatus(null);
          setSelectedRequest(null);
          setShowCancelModal(true);
        }}
      />

      <MarkItemsProcessedModal
        isOpen={showProcessModal}
        onClose={() => {
          setShowProcessModal(false);
          setSelectedItem(null);
          setSelectedRequest(null);
          setMyProcessingStatus(null);
        }}
        request={selectedRequest}
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
    </>
  );
}

export default ProcessRequests;
