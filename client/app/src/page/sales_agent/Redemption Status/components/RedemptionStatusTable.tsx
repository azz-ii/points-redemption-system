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
  onCancelRequest: (item: RedemptionRequestItem & { request: RedemptionRequest }) => void;
  loading: boolean;
  error: string | null;
}

export function RedemptionStatusTable({
  items,
  onViewItem,
  onCancelRequest,
  loading,
  error,
}: RedemptionStatusTableProps) {
  const columns = createColumns({
    onViewItem,
    onCancelRequest,
  });

  return (
    <DataTable
      columns={columns}
      data={items}
      loading={loading}
      error={error}
    />
  );
}
