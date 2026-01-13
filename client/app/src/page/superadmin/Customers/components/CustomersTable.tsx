import type { Customer } from "../modals/types";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onDeleteSelected?: (customers: Customer[]) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function CustomersTable({
  customers,
  loading,
  onView,
  onEdit,
  onDelete,
  onDeleteSelected,
  onCreateNew,
  onRefresh,
  refreshing,
}: CustomersTableProps) {
  const columns = createColumns({
    onView,
    onEdit,
    onDelete,
  });

  return (
    <DataTable
      columns={columns}
      data={customers}
      loading={loading}
      onDeleteSelected={onDeleteSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add Customer"
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
}
