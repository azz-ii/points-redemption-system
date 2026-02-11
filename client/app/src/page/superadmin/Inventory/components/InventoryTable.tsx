import { useMemo } from "react";
import type { InventoryItem } from "../modals/types";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface InventoryTableProps {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
  onViewItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onRetry: () => void;
  searchQuery: string;
  onDeleteSelected?: (items: InventoryItem[]) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
  onSetInventory?: () => void;
}

export function InventoryTable({
  items,
  loading,
  error,
  onViewItem,
  onEditItem,
  onRetry,
  searchQuery,
  onDeleteSelected,
  onCreateNew,
  onRefresh,
  refreshing,
  onExport,
  onSetInventory,
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
      searchQuery={searchQuery}
      showSearch={true}
      showPagination={true}
      showColumnVisibility={true}
      onDeleteSelected={onDeleteSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add Item"
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
      onSetInventory={onSetInventory}
    />
  );
}
