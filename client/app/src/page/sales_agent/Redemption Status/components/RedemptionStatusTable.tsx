import type { RedemptionRequestItem, RedemptionRequest } from "../modals/types";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

type ExtendedItem = RedemptionRequestItem & {
  requestId: number;
  status: string;
  status_display: string;
  processing_status: string;
  date_requested: string;
  request: RedemptionRequest;
};

interface RedemptionStatusTableProps {
  items: ExtendedItem[];
  onViewItem: (item: RedemptionRequestItem & { request: RedemptionRequest }) => void;
  onWithdrawItem?: (item: RedemptionRequestItem & { request: RedemptionRequest }) => void;
  isDark: boolean;
  loading: boolean;
  error: string | null;
}

export function RedemptionStatusTable({
  items,
  onViewItem,
  onWithdrawItem,
  isDark,
  loading,
  error,
}: RedemptionStatusTableProps) {
  const columns = createColumns({
    onViewItem,
    onWithdrawItem,
    isDark,
  });

  return (
    <DataTable
      columns={columns}
      data={items}
      loading={loading}
      error={error}
      isDark={isDark}
    />
  );
}
