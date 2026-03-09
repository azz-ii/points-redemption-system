import { useState, useMemo, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useMarketingHistory } from "@/hooks/queries/useMarketingRequests";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { RequestItem } from "@/page/marketing/ProcessRequests/modals/types";
import { HistoryTable } from "./components/HistoryTable";
import { HistoryMobileCards } from "./components/HistoryMobileCards";
import { ViewHistoryModal } from "./modals/ViewHistoryModal";
import { ExportModal } from "./modals/ExportModal";
import { exportToCSV, exportToExcel } from "./utils/exportUtils";

export default function MarketingHistory() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<RequestItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const { data: requests = [], isLoading: loading, isFetching: refreshing, error: queryError } = useMarketingHistory(30_000);
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load history") : null;

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.requests.all });
  }, [queryClient]);

  // Handlers
  const handleViewClick = useCallback((request: RequestItem) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  }, []);

  const handleExport = useCallback((selected: RequestItem[]) => {
    setSelectedRequests(selected);
    setShowExportModal(true);
  }, []);

  const handleExportConfirm = async (format: "csv" | "excel") => {
    try {
      setIsExporting(true);
      const itemsToExport = selectedRequests.length > 0 ? selectedRequests : requests;
      
      if (format === "csv") {
        exportToCSV(itemsToExport, `history_export_${new Date().toISOString().split("T")[0]}`);
      } else {
        exportToExcel(itemsToExport, `history_export_${new Date().toISOString().split("T")[0]}`);
      }
      
      toast.success(`Exported ${itemsToExport.length} record(s) successfully`);
      setShowExportModal(false);
      setSelectedRequests([]);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  // Mobile pagination - filter and paginate for mobile cards only
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

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col flex-1 p-4 pb-20">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-1">History</h1>
          <p className="text-xs text-muted-foreground">
            View your processed redemption requests
          </p>
        </div>

        {/* Mobile Search Bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border bg-background border-border">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-transparent outline-none border-none text-foreground placeholder-muted-foreground p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <HistoryMobileCards
          requests={paginatedRequests}
          loading={loading}
          onView={handleViewClick}
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
          <h1 className="text-4xl font-bold mb-1">History</h1>
          <p className="text-base text-muted-foreground">
            View your processed redemption requests
          </p>
        </div>

        <div className="flex-1 min-h-0">
          {error ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              {error}
            </div>
          ) : (
            <HistoryTable
              requests={requests}
              loading={loading}
              onView={handleViewClick}
              onExport={handleExport}
              onRefresh={handleManualRefresh}
              refreshing={refreshing}
              fillHeight
            />
          )}
        </div>
      </div>

      <ViewHistoryModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setSelectedRequests([]);
        }}
        onConfirm={handleExportConfirm}
        selectedItems={selectedRequests.length > 0 ? selectedRequests : requests}
        isExporting={isExporting}
      />
    </>
  );
}
