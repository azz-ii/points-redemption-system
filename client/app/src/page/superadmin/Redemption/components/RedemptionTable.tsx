import { useMemo } from "react";
import type { RedemptionItem } from "../modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface RedemptionTableProps {
  redemptions: RedemptionItem[];
  loading: boolean;
  onView: (item: RedemptionItem) => void;
  onMarkAsProcessed: (item: RedemptionItem) => void;
  canMarkProcessed?: (item: RedemptionItem) => boolean;
  onEdit?: (item: RedemptionItem) => void;
  onCancelRequest?: (item: RedemptionItem) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
}

export function RedemptionTable({
  redemptions,
  loading,
  onView,
  onMarkAsProcessed,
  canMarkProcessed = () => true,
  onEdit: _onEdit,
  onCancelRequest: _onCancelRequest,
  onRefresh,
  refreshing,
  onExport,
}: RedemptionTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onViewRedemption: onView,
        onMarkAsProcessed,
        canMarkProcessed,
      }),
    [onView, onMarkAsProcessed, canMarkProcessed]
  );

  return (
    <DataTable
      columns={columns}
      data={redemptions}
      loading={loading}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
      searchPlaceholder="Filter by ID, requested by, requested for, or status..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const s = String(filterValue).toLowerCase()
        return (
          String(row.getValue("id") || "").toLowerCase().includes(s) ||
          String(row.getValue("requested_by_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("requested_for_name") || "").toLowerCase().includes(s) ||
          String(row.getValue("processing_status") || "").toLowerCase().includes(s)
        )
      }}
      loadingMessage="Loading redemption requests..."
      emptyMessage="No redemption requests found"
    />
  );
}
