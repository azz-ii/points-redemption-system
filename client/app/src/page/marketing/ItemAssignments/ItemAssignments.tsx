import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAssignedItemsPage } from "@/hooks/queries/useCatalogue";
import type { Product } from "@/page/superadmin/Catalogue/modals/types";
import { ItemAssignmentTable, ItemAssignmentMobileCards } from "./components";
import { ViewAssignedItemModal } from "./modals";

function ItemAssignments() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state (0-indexed for DataTable compatibility)
  const [tablePage, setTablePage] = useState(0);
  const [pageSize, setPageSize] = useState(15);

  const { data: assignedData, isLoading: loading, isFetching: refreshing, error: queryError, refetch } = useAssignedItemsPage(
    tablePage + 1, pageSize, searchQuery, 10000,
  );
  const items = assignedData?.results ?? [];
  const totalCount = assignedData?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const error = queryError ? "Failed to load assigned items. Please try again." : null;

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.catalogue.all });
  }, [queryClient]);

  const handlePageChange = useCallback((pageIndex: number) => {
    setTablePage(pageIndex);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setTablePage(0);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setTablePage(0);
  }, []);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTarget, setViewTarget] = useState<Product | null>(null);

  const handleViewClick = (item: Product) => {
    setViewTarget(item);
    setShowViewModal(true);
  };

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:h-full md:overflow-hidden md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Item Assignments</h1>
            <p className="text-sm text-muted-foreground">
              View items assigned to you for processing.
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0">
          <ItemAssignmentTable
            products={items}
            loading={loading}
            error={error}
            onRetry={() => refetch()}
            onView={handleViewClick}
            onRefresh={handleManualRefresh}
            refreshing={refreshing}
            manualPagination
            pageCount={pageCount}
            totalResults={totalCount}
            currentPage={tablePage}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            pageSize={pageSize}
            pageSizeOptions={[15, 50, 100]}
            onPageSizeChange={handlePageSizeChange}
            fillHeight
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24">
        <h2 className="text-2xl font-semibold mb-2">Item Assignments</h2>
        <p className="text-xs mb-4 text-muted-foreground">
          Items assigned to you for processing
        </p>

        {/* Mobile Search */}
        <div className="mb-4">
          <div className="relative flex items-center rounded-lg border bg-card border-border">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setTablePage(0);
              }}
              className="pl-10 w-full text-sm bg-transparent border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Mobile Cards */}
        <ItemAssignmentMobileCards
          products={items}
          loading={loading}
          error={error}
          onView={handleViewClick}
          onRetry={() => refetch()}
          searchQuery={searchQuery}
        />

        {items.length > 0 && !loading && !error && (
          <div className="flex items-center justify-center gap-2 mt-4 pb-2">
            <button
              onClick={() => setTablePage((p) => Math.max(0, p - 1))}
              disabled={tablePage === 0}
              className="p-1.5 rounded transition-colors hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium px-2">
              Page {tablePage + 1} of {pageCount}
            </span>
            <button
              onClick={() => setTablePage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={tablePage >= pageCount - 1}
              className="p-1.5 rounded transition-colors hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <ViewAssignedItemModal
        isOpen={showViewModal && !!viewTarget}
        onClose={() => {
          setShowViewModal(false);
          setViewTarget(null);
        }}
        product={viewTarget}
      />
    </>
  );
}

export default ItemAssignments;
