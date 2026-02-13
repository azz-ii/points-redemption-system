import type { Product } from "../modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface CatalogueTableProps {
  products: Product[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
  onUnarchive: (product: Product) => void;
  onArchiveSelected?: (products: Product[]) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
  manualPagination?: boolean;
  pageCount?: number;
  totalResults?: number;
  currentPage?: number;
  onPageChange?: (pageIndex: number) => void;
  onSearch?: (query: string) => void;
}

export function CatalogueTable({
  products,
  loading,
  error,
  onRetry,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
  onArchiveSelected,
  onCreateNew,
  onRefresh,
  refreshing,
  onExport,
  manualPagination,
  pageCount,
  totalResults,
  currentPage,
  onPageChange,
  onSearch,
}: CatalogueTableProps) {
  const columns = createColumns({
    onView,
    onEdit,
    onArchive,
    onUnarchive,
  });

  return (
    <DataTable
      columns={columns}
      data={products}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onDeleteSelected={onArchiveSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add Product"
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
      searchPlaceholder="Filter by item code, name, or category..."
      loadingMessage="Loading catalogue items..."
      emptyMessage="No catalogue items found"
      manualPagination={manualPagination}
      pageCount={pageCount}
      totalResults={totalResults}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onSearch={onSearch}
    />
  );
}
