import { useMemo } from "react";
import type { InventoryItem } from "../modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface InventoryTableProps {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  onViewItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onRetry: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
  onSetInventory?: () => void;
  manualPagination?: boolean;
  pageCount?: number;
  totalResults?: number;
  currentPage?: number;
  onPageChange?: (pageIndex: number) => void;
  onSearch?: (query: string) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

export function InventoryTable({
  items,
  loading,
  error,
  onViewItem,
  onEditItem,
  onRetry,
  onRefresh,
  refreshing,
  onExport,
  onSetInventory,
  manualPagination,
  pageCount,
  totalResults,
  currentPage,
  onPageChange,
  onSearch,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
}: InventoryTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onViewItem,
        onEditItem,
      }),
    [onViewItem, onEditItem]
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
      onSetInventory={onSetInventory}
      searchPlaceholder="Filter by name, code, or legend..."
      loadingMessage="Loading inventory items..."
      emptyMessage="No inventory items found"
      manualPagination={manualPagination}
      pageCount={pageCount}
      totalResults={totalResults}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onSearch={onSearch}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      onPageSizeChange={onPageSizeChange}
    />
  );
}
