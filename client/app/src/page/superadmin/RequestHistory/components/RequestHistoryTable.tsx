import { useMemo } from "react";
import type { RequestHistoryItem } from "../modals/types";
import { DataTable } from "./data-table";
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
    />
  );
}
