import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  ViewRequestModal,
  MarkItemsProcessedModal,
  type RequestItem,
  type MyProcessingStatus,
} from "./modals";
import { ProcessRequestsTable, ProcessRequestsMobileCards } from "./components";
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
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [myProcessingStatus, setMyProcessingStatus] = useState<MyProcessingStatus | null>(null);

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

  const pageSize = 7;
  const filteredRequests = requests.filter((request) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.id.toString().includes(query) ||
      request.requested_by_name.toLowerCase().includes(query) ||
      request.requested_for_name.toLowerCase().includes(query) ||
      request.status.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handleViewClick = async (request: RequestItem) => {
    setSelectedRequest(request);
    await fetchMyProcessingStatus(request.id);
    setShowViewModal(true);
  };

  const handleMarkProcessedClick = async (request: RequestItem) => {
    setSelectedRequest(request);
    const status = await fetchMyProcessingStatus(request.id);
    if (status && status.pending_items > 0) {
      setShowProcessModal(true);
    } else {
      toast.info("All your items have already been processed");
    }
  };

  const handleMarkProcessedConfirm = async () => {
    if (!selectedRequest) return;

    try {
      await marketingRequestsApi.markItemsProcessed(selectedRequest.id);
      toast.success("Items marked as processed successfully");
      setShowProcessModal(false);
      setSelectedRequest(null);
      setMyProcessingStatus(null);
      fetchRequests(true);
    } catch (err) {
      console.error("Error marking items as processed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to mark items as processed");
    }
  };

  // Check if the current user can mark this request's items as processed
  const canMarkProcessed = (request: RequestItem): boolean => {
    // Only approved requests that aren't cancelled can be processed
    return (
      request.status === "APPROVED" &&
      request.processing_status !== "CANCELLED" &&
      request.processing_status !== "PROCESSED"
    );
  };

  return (
    <>
    <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div
          className="md:hidden sticky top-0 z-40 p-4 flex justify-between items-center border-b bg-card border-border"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"
            >
              <span className="text-white font-semibold text-xs">M</span>
            </div>
            <span className="font-medium text-sm">Process Requests</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRequests(true)}
              disabled={refreshing}
              className={`p-2 rounded-lg bg-muted hover:bg-accent transition-colors ${refreshing ? "opacity-50" : ""}`}
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto">
          <div className="p-4">
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
                className="pl-10 h-12"
              />
            </div>

            <ProcessRequestsMobileCards
              requests={paginatedRequests}
              loading={loading}
              onView={handleViewClick}
              onMarkProcessed={handleMarkProcessedClick}
              canMarkProcessed={canMarkProcessed}
            />

            {/* Mobile Pagination */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent`}
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
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Process Requests</h1>
              <p className="text-sm text-muted-foreground">
                View and process approved redemption requests for your assigned items
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchRequests(true)}
                disabled={refreshing}
                className={`p-2 rounded-lg bg-muted hover:bg-accent transition-colors ${refreshing ? "opacity-50" : ""}`}
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          

          {error ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              {error}
            </div>
          ) : (
            <ProcessRequestsTable
              requests={paginatedRequests}
              loading={loading}
              onView={handleViewClick}
              onMarkProcessed={handleMarkProcessedClick}
              canMarkProcessed={canMarkProcessed}
            />
          )}

          {/* Desktop Pagination */}
          {!loading && !error && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent`}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm font-medium">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, safePage + 1))
                }
                disabled={safePage === totalPages}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent`}
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <ViewRequestModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
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
          setSelectedRequest(null);
          setMyProcessingStatus(null);
        }}
        request={selectedRequest}
        myItems={myProcessingStatus?.items || []}
        pendingCount={myProcessingStatus?.pending_items || 0}
        onConfirm={handleMarkProcessedConfirm}
      />
    </>
  );
}

export default ProcessRequests;
