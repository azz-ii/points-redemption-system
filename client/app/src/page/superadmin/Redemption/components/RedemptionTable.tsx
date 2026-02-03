import { useMemo } from "react";
import type { RedemptionItem } from "../modals/types";
import { DataTable } from "./data-table";
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
    />
  );
}
