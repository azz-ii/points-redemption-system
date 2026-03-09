import { useMemo } from "react";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";
import type { HistoryItem } from "../types";

interface HistoryTableProps {
  historyItems: HistoryItem[];
  loading: boolean;
  onView: (item: HistoryItem) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  fillHeight?: boolean;
}

export function HistoryTable({
  historyItems,
  loading,
  onView,
  onRefresh,
  refreshing,
  fillHeight,
}: HistoryTableProps) {
  const columns = useMemo(
    () => createColumns({ onView }),
    [onView]
  );

  return (
    <DataTable
      columns={columns}
      data={historyItems}
      loading={loading}
      onRefresh={onRefresh}
      refreshing={refreshing}
      searchPlaceholder="Search by ID, Name, Status..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const s = String(filterValue).toLowerCase();
        return (
          String(row.getValue("requested_by_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("requested_for_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("team_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("status") || "").toLowerCase().includes(s) ||
          String(row.getValue("processed_by_name") || "").toLowerCase().includes(s) ||
          String(row.original.id || "").includes(s)
        );
      }}
      initialSorting={[{ id: "date_processed", desc: true }]}
      pageSize={15}
      loadingMessage="Loading history..."
      emptyMessage="No processed requests found"
      pageSizeOptions={[15, 50, 100]}
      fillHeight={fillHeight}
    />
  );
}
