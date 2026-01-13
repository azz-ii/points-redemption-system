import type { RedemptionItem } from "../modals/types";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface RedemptionTableProps {
  redemptions: RedemptionItem[];
  loading: boolean;
  onView: (item: RedemptionItem) => void;
  onEdit: (item: RedemptionItem) => void;
  onMarkAsProcessed?: (item: RedemptionItem) => void;
  onCancelRequest?: (item: RedemptionItem) => void;
  onDeleteSelected?: (items: RedemptionItem[]) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function RedemptionTable({
  redemptions,
  loading,
  onView,
  onEdit,
  onMarkAsProcessed,
  onCancelRequest,
  onDeleteSelected,
  onCreateNew,
  onRefresh,
  refreshing,
}: RedemptionTableProps) {
  const columns = createColumns({
    onViewRedemption: onView,
    onEditRedemption: onEdit,
    onMarkAsProcessed: onMarkAsProcessed || (() => {}),
    onCancelRequest: onCancelRequest || (() => {}),
  });

  return (
    <DataTable
      columns={columns}
      data={redemptions}
      loading={loading}
      onDeleteSelected={onDeleteSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="New Request"
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
}
