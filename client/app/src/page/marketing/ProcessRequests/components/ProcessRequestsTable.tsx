import { useMemo } from "react";
import type { FlattenedRequestItem } from "../modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface ProcessRequestsTableProps {
  items: FlattenedRequestItem[];
  loading: boolean;
  onViewRequest: (item: FlattenedRequestItem) => void;
  onMarkItemProcessed: (item: FlattenedRequestItem) => void;
  onBulkMarkProcessed?: (items: FlattenedRequestItem[]) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function ProcessRequestsTable({
  items,
  loading,
  onViewRequest,
  onMarkItemProcessed,
  onBulkMarkProcessed,
  onRefresh,
  refreshing = false,
}: ProcessRequestsTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onViewRequest,
        onMarkItemProcessed,
      }),
    [onViewRequest, onMarkItemProcessed]
  );

  // Custom global filter function that searches across multiple fields
  const globalFilterFn = (row: any, columnId: string, filterValue: string) => {
    const item = row.original as FlattenedRequestItem;
    const searchLower = String(filterValue).toLowerCase();
    
    // Search in: request ID, product code, product name, customer, category
    const searchableFields = [
      String(item.requestId),
      item.product_code?.toLowerCase() || '',
      item.product_name?.toLowerCase() || '',
      item.requested_for_name?.toLowerCase() || '',
      item.requested_by_name?.toLowerCase() || '',
      item.category?.toLowerCase() || '',
      item.request_status_display?.toLowerCase() || '',
      item.request_processing_status_display?.toLowerCase() || '',
    ];
    
    return searchableFields.some(field => field.includes(searchLower));
  };

  return (
    <div className="hidden md:block">
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        onDeleteSelected={onBulkMarkProcessed}
        deleteSelectedLabel="Process"
        onRefresh={onRefresh}
        refreshing={refreshing}
        searchPlaceholder="Search by Request ID, Item, Customer..."
        globalFilterFn={globalFilterFn}
        showSearch={true}
        showPagination={true}
        showColumnVisibility={true}
        pageSize={15}
        initialSorting={[{ id: "date_requested", desc: true }]}
        loadingMessage="Loading items..."
        emptyMessage="No items found"
        pageSizeOptions={[15, 50, 100]}
      />
    </div>
  );
}
