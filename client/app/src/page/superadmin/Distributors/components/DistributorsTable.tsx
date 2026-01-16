import type { Distributor } from "../modals/types";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface DistributorsTableProps {
  distributors: Distributor[];
  loading: boolean;
  onView: (distributor: Distributor) => void;
  onEdit: (distributor: Distributor) => void;
  onDelete: (distributor: Distributor) => void;
  onDeleteSelected?: (distributors: Distributor[]) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onBulkUpload?: () => void;
}

export function DistributorsTable({
  distributors,
  loading,
  onView,
  onEdit,
  onDelete,
  onDeleteSelected,
  onCreateNew,
  onRefresh,
  refreshing,
  onBulkUpload,
}: DistributorsTableProps) {
  const columns = createColumns({
    onView,
    onEdit,
    onDelete,
  });

  return (
    <DataTable
      columns={columns}
      data={distributors}
      loading={loading}
      onDeleteSelected={onDeleteSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add Distributor"
      onRefresh={onRefresh}
      refreshing={refreshing}
      onBulkUpload={onBulkUpload}
    />
  );
}
