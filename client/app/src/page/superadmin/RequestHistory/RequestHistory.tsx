import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useRequestHistory } from "@/hooks/queries/useRequestHistory";
import {
  ViewRequestModal,
  ExportModal,
  type RequestHistoryItem,
} from "./modals";
import { RequestHistoryTable, RequestHistoryMobileCards } from "./components";

function RequestHistory() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rawRequests, isLoading: loading, isFetching: refreshing, error: queryError } = useRequestHistory(30_000);
  const requests = (rawRequests ?? []) as unknown as RequestHistoryItem[];
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load processed requests") : null;

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestHistoryItem | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.requests.all });
  }, [queryClient]);

  const pageSize = 7;
  const { filteredRequests, totalPages, safePage, paginatedRequests } = useMemo(() => {
    const filtered = requests.filter((request) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        request.id.toString().includes(query) ||
        request.requested_by_name.toLowerCase().includes(query) ||
        request.requested_for_name.toLowerCase().includes(query)
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

  const handleViewClick = useCallback((request: RequestHistoryItem) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  }, []);

  return (
    <>


        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:h-full md:overflow-hidden md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold">Request History</h1>
              <p
                className="text-sm text-muted-foreground"
              >
                View all processed redemption requests
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
              <RequestHistoryTable
                requests={filteredRequests}
                loading={loading}
                onView={handleViewClick}
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
            <h1 className="text-xl font-semibold mb-1">Request History</h1>
            <p className="text-xs text-muted-foreground mb-4">
              View processed redemption requests
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
        requests={filteredRequests}
      />
    </>
  );
}

export default RequestHistory;
