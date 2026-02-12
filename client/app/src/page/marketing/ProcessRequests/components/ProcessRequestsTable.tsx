import { useMemo } from "react";
import type { RequestItem } from "../modals/types";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface ProcessRequestsTableProps {
  requests: RequestItem[];
  loading: boolean;
  onView: (request: RequestItem) => void;
  onMarkProcessed: (request: RequestItem) => void;
  canMarkProcessed: (request: RequestItem) => boolean;
}

export function ProcessRequestsTable({
  requests,
  loading,
  onView,
  onMarkProcessed,
  canMarkProcessed,
}: ProcessRequestsTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onView,
        onMarkProcessed,
        canMarkProcessed,
      }),
    [onView, onMarkProcessed, canMarkProcessed]
  );

  return (
    <DataTable
      columns={columns}
      data={requests}
      loading={loading}
    />
  );
}
