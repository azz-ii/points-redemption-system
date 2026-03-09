import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useRequests } from "@/hooks/queries/useRequests";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { HistoryItem } from "./types";
import { HistoryTable, HistoryMobileCards } from "./components";
import { ViewHistoryModal } from "./modals";

function ApproverHistory() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const { data: historyItems = [], isLoading: loading, isFetching: refreshing } = useRequests({
    refetchInterval: 30_000,
    processed: true,
  });

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.requests.all });
  }, [queryClient]);

  // Mobile filtering, sorting, and pagination
  const pageSize = 15;
  const { sortedItems, totalPages, safePage, paginatedItems } = useMemo(() => {
    const filtered = historyItems.filter((item) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.id.toString().includes(query) ||
        item.requested_by_name.toLowerCase().includes(query) ||
        item.requested_for_name.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query) ||
        item.processing_status.toLowerCase().includes(query)
      );
    });

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date_requested).getTime() - new Date(a.date_requested).getTime()
    );
    const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safe = Math.min(currentPage, pages);
    const start = (safe - 1) * pageSize;
    return {
      sortedItems: sorted,
      totalPages: pages,
      safePage: safe,
      paginatedItems: sorted.slice(start, start + pageSize),
    };
  }, [historyItems, searchQuery, currentPage, pageSize]);

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Name....."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* History Cards */}
          <HistoryMobileCards
            historyItems={paginatedItems}
            loading={loading}
            onView={setSelectedItem}
          />

          {/* Mobile Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
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

      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:h-full md:overflow-hidden md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">History</h1>
            <p className="text-sm text-muted-foreground">
              View and manage the complete history of point redemptions.
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <HistoryTable
            historyItems={historyItems}
            loading={loading}
            onView={setSelectedItem}
            onRefresh={handleManualRefresh}
            refreshing={refreshing}
            fillHeight
          />
        </div>
      </div>

      {/* View History Modal */}
      <ViewHistoryModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />
    </>
  );
}

export default ApproverHistory;
