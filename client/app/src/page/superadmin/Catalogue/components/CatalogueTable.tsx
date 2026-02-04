import type { Product } from "../modals/types";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface CatalogueTableProps {
  products: Product[];
  loading: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onDeleteSelected?: (products: Product[]) => void;
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
  onDelete,
  onDeleteSelected,
  onCreateNew,
  onRefresh,
  refreshing,
  onExport,
}: CatalogueTableProps) {
  const columns = createColumns({
    onView,
    onEdit,
    onDelete,
  });

  return (
    <DataTable
      columns={columns}
      data={products}
      loading={loading}
      onDeleteSelected={onDeleteSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add Product"
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
    />
  );
}
