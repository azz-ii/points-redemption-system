import { useMemo } from "react";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";
import type { RequestItem } from "../modals/types";

interface RequestsTableProps {
  requests: RequestItem[];
  loading: boolean;
  onView: (request: RequestItem) => void;
  onApprove: (request: RequestItem) => void;
  onReject: (request: RequestItem) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  fillHeight?: boolean;
}

export function RequestsTable({
  requests,
  loading,
  onView,
  onApprove,
  onReject,
  onRefresh,
  refreshing,
  fillHeight,
}: RequestsTableProps) {
  const columns = useMemo(
    () => createColumns({ onView, onApprove, onReject }),
    [onView, onApprove, onReject]
  );

  return (
    <DataTable
      columns={columns}
      data={requests}
      loading={loading}
      onRefresh={onRefresh}
      refreshing={refreshing}
      searchPlaceholder="Search by ID, Requested By, Requested For..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const s = String(filterValue).toLowerCase();
        return (
          String(row.getValue("requested_by_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("requested_for_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("team_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("status") || "").toLowerCase().includes(s) ||
          String(row.original.id || "").includes(s)
        );
      }}
      initialSorting={[{ id: "date_requested", desc: true }]}
      pageSize={15}
      loadingMessage="Loading requests..."
      emptyMessage="No requests found"
      pageSizeOptions={[15, 50, 100]}
      fillHeight={fillHeight}
    />
  );
}
