import type { Distributor } from "../modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface DistributorsTableProps {
  distributors: Distributor[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onView: (distributor: Distributor) => void;
  onEdit: (distributor: Distributor) => void;
  onArchive: (distributor: Distributor) => void;
  onUnarchive: (distributor: Distributor) => void;
  onArchiveSelected?: (distributors: Distributor[]) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
  onSetPoints?: () => void;
  onViewPointsHistory?: (distributor: Distributor) => void;
  manualPagination?: boolean;
  pageCount?: number;
  totalResults?: number;
  currentPage?: number;
  onPageChange?: (pageIndex: number) => void;
  onSearch?: (query: string) => void;
}

export function DistributorsTable({
  distributors,
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
}: DistributorsTableProps) {
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
      data={distributors}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onDeleteSelected={onArchiveSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add Distributor"
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
      loadingMessage="Loading distributors..."
      emptyMessage="No distributors found"
      manualPagination={manualPagination}
      pageCount={pageCount}
      totalResults={totalResults}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onSearch={onSearch}
    />
  );
}
