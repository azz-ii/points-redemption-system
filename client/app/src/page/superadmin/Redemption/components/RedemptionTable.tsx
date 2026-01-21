import { useMemo } from "react";
import type { RedemptionItem } from "../modals/types";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface RedemptionTableProps {
  redemptions: RedemptionItem[];
  loading: boolean;
  onView: (item: RedemptionItem) => void;
  onMarkAsProcessed: (item: RedemptionItem) => void;
  canMarkProcessed: (item: RedemptionItem) => boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function RedemptionTable({
  redemptions,
  loading,
  onView,
  onMarkAsProcessed,
  canMarkProcessed,
  onRefresh,
  refreshing,
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
    />
  );
}
