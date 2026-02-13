import type { Customer } from "../modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
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
  manualPagination?: boolean;
  pageCount?: number;
  totalResults?: number;
  currentPage?: number;
  onPageChange?: (pageIndex: number) => void;
  onSearch?: (query: string) => void;
}

export function CustomersTable({
  customers,
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
  onSetPoints,
  onViewPointsHistory,
  manualPagination,
  pageCount,
  totalResults,
  currentPage,
  onPageChange,
  onSearch,
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
      error={error}
      onRetry={onRetry}
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
      manualPagination={manualPagination}
      pageCount={pageCount}
      totalResults={totalResults}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onSearch={onSearch}
    />
  );
}
