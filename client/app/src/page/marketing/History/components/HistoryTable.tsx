import { useMemo } from "react";
import type { RequestItem } from "../../ProcessRequests/modals/types";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface HistoryTableProps {
  requests: RequestItem[];
  loading: boolean;
  onView: (request: RequestItem) => void;
}

export function HistoryTable({
  requests,
  loading,
  onView,
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
    />
  );
}
