import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  ViewRequestModal,
  MarkItemsProcessedModal,
  type RequestItem,
  type MyProcessingStatus,
  type FlattenedRequestItem,
} from "./modals";
import { ProcessRequestsTable, ProcessRequestsMobileCards, BulkMarkProcessedModal } from "./components";
import { marketingRequestsApi } from "@/lib/api";

function ProcessRequests() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showBulkProcessModal, setShowBulkProcessModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FlattenedRequestItem | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [bulkProcessTargets, setBulkProcessTargets] = useState<FlattenedRequestItem[]>([]);
  const [myProcessingStatus, setMyProcessingStatus] = useState<MyProcessingStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await marketingRequestsApi.getRequests();
      setRequests(data as unknown as RequestItem[]);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err instanceof Error ? err.message : "Failed to load requests");
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const fetchMyProcessingStatus = async (requestId: number) => {
    try {
      const status = await marketingRequestsApi.getMyProcessingStatus(requestId);
      setMyProcessingStatus(status);
      return status;
    } catch (err) {
      console.error("Error fetching processing status:", err);
      toast.error("Failed to load processing status");
      return null;
    }
  };

  // Flatten requests to items for table display
  const flattenedItems: FlattenedRequestItem[] = requests.flatMap((request) =>
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
  );

  // Mobile filtering and pagination
  const pageSize = 7;
  const filtered = flattenedItems.filter((item) => {
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filtered.slice(startIndex, endIndex);

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

  const handleMarkProcessedConfirm = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      await marketingRequestsApi.markItemsProcessed(selectedRequest.id);
      toast.success("Items marked as processed successfully");
      setShowProcessModal(false);
      setSelectedItem(null);
      setSelectedRequest(null);
      setMyProcessingStatus(null);
      fetchRequests(true);
    } catch (err) {
      console.error("Error marking items as processed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to mark items as processed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkMarkProcessed = (selectedItems: FlattenedRequestItem[]) => {
    // Filter to only show items that haven't been processed yet
    const processableItems = selectedItems.filter(item => !item.item_processed_by);
    
    if (processableItems.length === 0) {
      toast.info("All selected items have already been processed");
      return;
    }
    
    setBulkProcessTargets(processableItems);
    setShowBulkProcessModal(true);
  };

  const handleBulkMarkProcessedConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Group items by request ID
      const requestGroups = bulkProcessTargets.reduce((acc, item) => {
        if (!acc[item.requestId]) {
          acc[item.requestId] = [];
        }
        acc[item.requestId].push(item);
        return acc;
      }, {} as Record<number, FlattenedRequestItem[]>);

      // Mark items in each request as processed
      const results = await Promise.allSettled(
        Object.keys(requestGroups).map(requestId =>
          marketingRequestsApi.markItemsProcessed(Number(requestId))
        )
      );

      const succeeded = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      if (succeeded > 0) {
        toast.success(`Successfully marked ${succeeded} request(s) as processed${failed > 0 ? `, ${failed} failed` : ""}`);
      } else {
        throw new Error("All processing operations failed");
      }

      setShowBulkProcessModal(false);
      setBulkProcessTargets([]);
      fetchRequests(true);
    } catch (err) {
      console.error("Bulk mark processed failed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to mark items as processed");
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
          <h1 className="text-2xl font-bold mb-1">Process Requests</h1>
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
      <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-1">Process Requests</h1>
          <p className="text-base text-muted-foreground">
            View and process approved redemption requests for your assigned items
          </p>
        </div>

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
            onBulkMarkProcessed={handleBulkMarkProcessed}
            onRefresh={() => fetchRequests(true)}
            refreshing={refreshing}
          />
        )}
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

      {showBulkProcessModal && (
        <BulkMarkProcessedModal
          isOpen={showBulkProcessModal}
          onClose={() => {
            setShowBulkProcessModal(false);
            setBulkProcessTargets([]);
          }}
          onConfirm={handleBulkMarkProcessedConfirm}
          items={bulkProcessTargets}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}

export default ProcessRequests;
