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
      showSearch={false}
      showPagination={false}
      showColumnVisibility={false}
      loadingMessage="Loading inventory items..."
      emptyMessage={searchQuery ? "No items match your search" : "No inventory items found"}
    />
  );
}
