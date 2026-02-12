import { useMemo } from "react";
import type { Row } from "@tanstack/react-table";
import type { FlattenedRequestItem } from "../../ProcessRequests/modals/types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface DashboardTableProps {
  items: FlattenedRequestItem[];
  loading: boolean;
  onViewRequest: (item: FlattenedRequestItem) => void;
  onMarkItemProcessed: (item: FlattenedRequestItem) => void;
  onBulkMarkProcessed?: (items: FlattenedRequestItem[]) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function DashboardTable({
  items,
  loading,
  onViewRequest,
  onMarkItemProcessed,
  onBulkMarkProcessed,
  onRefresh,
  refreshing = false,
}: DashboardTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onViewRequest,
        onMarkItemProcessed,
      }),
    [onViewRequest, onMarkItemProcessed]
  );

  const globalFilterFn = (row: Row<FlattenedRequestItem>, _columnId: string, filterValue: string) => {
    const item = row.original as FlattenedRequestItem;
    const searchLower = String(filterValue).toLowerCase();

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
        emptyMessage="No items to process"
      />
    </div>
  );
}
