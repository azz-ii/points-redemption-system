import { useMemo } from "react";
import type { RequestItem } from "../../ProcessRequests/modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface HistoryTableProps {
  requests: RequestItem[];
  loading: boolean;
  onView: (request: RequestItem) => void;
  onExport?: (selected: RequestItem[]) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function HistoryTable({
  requests,
  loading,
  onView,
  onExport,
  onRefresh,
  refreshing,
}: HistoryTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onView,
      }),
    [onView]
  );

  return (
    <DataTable
      columns={columns}
      data={requests}
      loading={loading}
      onExport={onExport}
      onRefresh={onRefresh}
      refreshing={refreshing}
      searchPlaceholder="Filter by ID, requested by, or requested for..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const s = String(filterValue).toLowerCase();
        return (
          String(row.getValue("id") || "").toLowerCase().includes(s) ||
          String(row.getValue("requested_by_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("requested_for_name") || "").toLowerCase().includes(s)
        );
      }}
      enableRowSelection={true}
      initialSorting={[{ id: "date_processed", desc: true }]}
      pageSize={15}
      loadingMessage="Loading history..."
      emptyMessage="No history records found"
    />
  );
}
