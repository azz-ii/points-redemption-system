import { useMemo } from "react";
import type { MarketingUser } from "./types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface MarketingUsersTableProps {
  users: MarketingUser[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onViewAccount: (user: MarketingUser) => void;
  onEditAccount: (user: MarketingUser) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
  manualPagination?: boolean;
  pageCount?: number;
  totalResults?: number;
  currentPage?: number;
  onPageChange?: (pageIndex: number) => void;
  onSearch?: (query: string) => void;
}

export function MarketingUsersTable({
  users,
  loading,
  error,
  onRetry,
  onViewAccount,
  onEditAccount,
  onRefresh,
  refreshing,
  onExport,
  manualPagination,
  pageCount,
  totalResults,
  currentPage,
  onPageChange,
  onSearch,
}: MarketingUsersTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onViewAccount,
        onEditAccount,
      }),
    [onViewAccount, onEditAccount]
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
      searchPlaceholder="Filter by username, email, or full name..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const s = String(filterValue).toLowerCase()
        return (
          (String(row.getValue("username") || "")).toLowerCase().includes(s) ||
          (String(row.getValue("email") || "")).toLowerCase().includes(s) ||
          (String(row.getValue("full_name") || "")).toLowerCase().includes(s)
        )
      }}
      loadingMessage="Loading users..."
      emptyMessage="No marketing users found"
      manualPagination={manualPagination}
      pageCount={pageCount}
      totalResults={totalResults}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onSearch={onSearch}
    />
  );
}
