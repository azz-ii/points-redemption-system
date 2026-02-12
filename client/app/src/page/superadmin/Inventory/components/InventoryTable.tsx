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
}

export function InventoryTable({
  items,
  loading,
  error,
  onViewItem,
  onEditItem,
  onRetry,
  searchQuery,
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
      showSearch={false}
      showPagination={false}
      showColumnVisibility={false}
    />
  );
}
