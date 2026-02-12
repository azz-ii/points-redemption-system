import { useState, useEffect, useCallback } from "react";
import { requestHistoryApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  ViewRequestModal,
  ExportModal,
  type RequestHistoryItem,
} from "./modals";
import { RequestHistoryTable, RequestHistoryMobileCards } from "./components";
import { toast } from "sonner";

function RequestHistory() {  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState<RequestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestHistoryItem | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchRequests = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await requestHistoryApi.getProcessedRequests();
      setRequests(data as unknown as RequestHistoryItem[]);
    } catch (err) {
      console.error("Error fetching processed requests:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load processed requests",
      );
      toast.error("Failed to load processed requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const pageSize = 7;
  const filteredRequests = requests.filter((request) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.id.toString().includes(query) ||
      request.requested_by_name.toLowerCase().includes(query) ||
      request.requested_for_name.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handleViewClick = useCallback((request: RequestHistoryItem) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  }, []);

  return (
    <>


        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Request History</h1>
              <p
                className="text-sm text-muted-foreground"
              >
                View all processed redemption requests
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fetchRequests(true)}
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
            <RequestHistoryTable
              requests={paginatedRequests}
              loading={loading}
              onView={handleViewClick}
              onRefresh={() => fetchRequests(true)}
              refreshing={refreshing}
              onExport={() => setShowExportModal(true)}
            />
          )}

          {/* Desktop Pagination */}
          {!loading && !error && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto pb-20">
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
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

            <RequestHistoryMobileCards
              paginatedItems={paginatedRequests}
              filteredItems={filteredRequests}
              loading={loading}
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onView={handleViewClick}
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
      <ViewRequestModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRequest(null);
        }}
        item={selectedRequest}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        requests={requests}
      />
    </>
  );
}

export default RequestHistory;
