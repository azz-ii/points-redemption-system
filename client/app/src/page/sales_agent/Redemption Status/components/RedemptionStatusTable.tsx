import type { RedemptionRequest } from "../modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface RedemptionStatusTableProps {
  requests: RedemptionRequest[];
  onViewRequest: (request: RedemptionRequest) => void;
  onCancelRequest: (request: RedemptionRequest) => void;
  onBulkCancel?: (requests: RedemptionRequest[]) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading: boolean;
  error: string | null;
}

export function RedemptionStatusTable({
  requests,
  onViewRequest,
  onCancelRequest,
  onBulkCancel,
  onRefresh,
  refreshing = false,
  loading,
  error,
}: RedemptionStatusTableProps) {
  const columns = createColumns({
    onViewRequest,
    onCancelRequest,
  });

  // Custom global filter function that searches across multiple fields
  const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
    const request = row.original as RedemptionRequest;
    const searchLower = String(filterValue).toLowerCase();
    
    // Search in: request ID, customer name, item names, total points, status
    const searchableFields = [
      String(request.id),
      request.requested_for_name?.toLowerCase() || '',
      request.status_display?.toLowerCase() || '',
      String(request.total_points),
      ...(request.items?.map(item => item.product_name.toLowerCase()) || []),
      ...(request.items?.map(item => item.product_code.toLowerCase()) || []),
    ];
    
    return searchableFields.some(field => field.includes(searchLower));
  };

  return (
    <div className="hidden md:block">
      <DataTable
        columns={columns}
        data={requests}
        loading={loading}
        error={error}
        onDeleteSelected={onBulkCancel}
        onRefresh={onRefresh}
        refreshing={refreshing}
        searchPlaceholder="Search by Request ID, Customer, Item..."
        globalFilterFn={globalFilterFn}
        showSearch={true}
        showPagination={true}
        showColumnVisibility={true}
        pageSize={15}
        initialSorting={[{ id: "date_requested", desc: true }]}
        loadingMessage="Loading requests..."
        emptyMessage="No redemption requests found"
      />
    </div>
  );
}
