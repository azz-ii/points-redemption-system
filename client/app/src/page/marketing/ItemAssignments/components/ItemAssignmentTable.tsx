import type { Product } from "@/page/superadmin/Catalogue/modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface ItemAssignmentTableProps {
  products: Product[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onView: (product: Product) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  manualPagination?: boolean;
  pageCount?: number;
  totalResults?: number;
  currentPage?: number;
  onPageChange?: (pageIndex: number) => void;
  onSearch?: (query: string) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  fillHeight?: boolean;
}

export function ItemAssignmentTable({
  products,
  loading,
  error,
  onRetry,
  onView,
  onRefresh,
  refreshing,
  manualPagination,
  pageCount,
  totalResults,
  currentPage,
  onPageChange,
  onSearch,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  fillHeight,
}: ItemAssignmentTableProps) {
  const columns = createColumns({ onView });

  return (
    <DataTable
      columns={columns}
      data={products}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onRefresh={onRefresh}
      refreshing={refreshing}
      searchPlaceholder="Filter by item code, name, or category..."
      loadingMessage="Loading assigned items..."
      emptyMessage="No items assigned to you"
      manualPagination={manualPagination}
      initialSorting={[{ id: "item_code", desc: false }]}
      pageCount={pageCount}
      totalResults={totalResults}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onSearch={onSearch}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      onPageSizeChange={onPageSizeChange}
      fillHeight={fillHeight}
    />
  );
}
