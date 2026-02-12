import type { Customer } from "../modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onArchive: (customer: Customer) => void;
  onUnarchive: (customer: Customer) => void;
  onArchiveSelected?: (customers: Customer[]) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
  onSetPoints?: () => void;
  onViewPointsHistory?: (customer: Customer) => void;
}

export function CustomersTable({
  customers,
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
  onSetPoints,
  onViewPointsHistory,
}: CustomersTableProps) {
  const columns = createColumns({
    onView,
    onEdit,
    onArchive,
    onUnarchive,
    onViewPointsHistory,
  });

  return (
    <DataTable
      columns={columns}
      data={customers}
      loading={loading}
      onDeleteSelected={onArchiveSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add Customer"
      createButtonIcon="user"
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
      onSetPoints={onSetPoints}
      searchPlaceholder="Filter by name, email, or location..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const s = String(filterValue).toLowerCase()
        return (
          String(row.getValue("name") || "").toLowerCase().includes(s) ||
          String(row.getValue("contact_email") || "").toLowerCase().includes(s) ||
          String(row.getValue("location") || "").toLowerCase().includes(s)
        )
      }}
      loadingMessage="Loading customers..."
      emptyMessage="No customers found"
    />
  );
}
