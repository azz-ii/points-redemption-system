import type { Product } from "../modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface CatalogueTableProps {
  products: Product[];
  loading: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onArchive: (product: Product) => void;
  onUnarchive: (product: Product) => void;
  onArchiveSelected?: (products: Product[]) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
}

export function CatalogueTable({
  products,
  loading,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
  onArchiveSelected,
  onCreateNew,
  onRefresh,
  refreshing,
  onExport,
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
      onDeleteSelected={onArchiveSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add Product"
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
      searchPlaceholder="Filter by item code, name, or category..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const s = String(filterValue).toLowerCase()
        return (
          String(row.getValue("item_code") || "").toLowerCase().includes(s) ||
          String(row.getValue("item_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("category") || "").toLowerCase().includes(s)
        )
      }}
      loadingMessage="Loading catalogue items..."
      emptyMessage="No catalogue items found"
    />
  );
}
