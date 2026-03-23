import { useMemo } from "react";
import type { Row } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { createColumns, type RedemptionItem } from "./columns";

interface DashboardTableProps {
  items: RedemptionItem[];
  loading: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onViewRequest: (item: RedemptionItem) => void;
}

export function DashboardTable({
  items,
  loading,
  onRefresh,
  refreshing = false,
  onViewRequest,
}: DashboardTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onViewRequest,
      }),
    [onViewRequest]
  );

  const globalFilterFn = (
    row: Row<RedemptionItem>,
    _columnId: string,
    filterValue: string
  ) => {
    const item = row.original as RedemptionItem;
    const searchLower = String(filterValue).toLowerCase();

    const searchableFields = [
      String(item.id),
      item.requested_by_name?.toLowerCase() || "",
      item.requested_for_name?.toLowerCase() || "",
      item.status?.toLowerCase() || "",
    ];

    return searchableFields.some((field) => field.includes(searchLower));
  };

  return (
    <div className="hidden md:block">
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        onRefresh={onRefresh}
        refreshing={refreshing}
        searchPlaceholder="Search by ID, Requested By, Distributor..."
        globalFilterFn={globalFilterFn}
        showSearch={true}
        showPagination={true}
        showColumnVisibility={true}
        pageSize={10}
        initialSorting={[{ id: "date_requested", desc: true }]}
        loadingMessage="Loading requests..."
        emptyMessage="No pending requests found"
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
}
