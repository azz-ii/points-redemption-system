import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { redemptionRequestsApi } from "@/lib/api";
import { toast } from "sonner";
import type { HistoryItem } from "./types";
import { HistoryTable, HistoryMobileCards } from "./components";
import { ViewHistoryModal } from "./modals";

function ApproverHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  // Fetch processed requests on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await redemptionRequestsApi.getRequests();
      // Filter to show only PROCESSED requests
      const processedRequests = data.filter(
        (req) => req.processing_status === "PROCESSED"
      );
      setHistoryItems(processedRequests);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const pageSize = 7;
  const filteredItems = historyItems.filter((item) => {
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

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

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
      <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">History</h1>
            <p className="text-sm text-muted-foreground">
              View and manage the complete history of point redemptions.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative flex items-center bg-card border-border">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Name....."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full bg-transparent border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Table */}
        <HistoryTable
          historyItems={paginatedItems}
          loading={loading}
          onView={setSelectedItem}
        />

        {/* Desktop Pagination */}
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
