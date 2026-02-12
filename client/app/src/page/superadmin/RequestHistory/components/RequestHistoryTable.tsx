import { useMemo } from "react";
import type { RequestHistoryItem } from "../modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface RequestHistoryTableProps {
  requests: RequestHistoryItem[];
  loading: boolean;
  onView: (item: RequestHistoryItem) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
}

export function RequestHistoryTable({
  requests,
  loading,
  onView,
  onRefresh,
  refreshing,
  onExport,
}: RequestHistoryTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onViewRequest: onView,
      }),
    [onView]
  );

  return (
    <DataTable
      columns={columns}
      data={requests}
      loading={loading}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
      searchPlaceholder="Filter by ID, requested by, or requested for..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const s = String(filterValue).toLowerCase()
        return (
          String(row.getValue("id") || "").toLowerCase().includes(s) ||
          String(row.getValue("requested_by_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("requested_for_name") || "").toLowerCase().includes(s)
        )
      }}
      loadingMessage="Loading processed requests..."
      emptyMessage="No processed requests found"
    />
  );
}
