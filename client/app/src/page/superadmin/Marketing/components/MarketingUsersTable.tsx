import { useMemo } from "react";
import type { MarketingUser } from "./types";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface MarketingUsersTableProps {
  users: MarketingUser[];
  loading: boolean;
  onViewAccount: (user: MarketingUser) => void;
  onEditAccount: (user: MarketingUser) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
}

export function MarketingUsersTable({
  users,
  loading,
  onViewAccount,
  onEditAccount,
  onRefresh,
  refreshing,
  onExport,
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
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
      searchPlaceholder="Filter by username, email, or full name..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const s = String(filterValue).toLowerCase()
        return (
          String(row.getValue("username") || "").toLowerCase().includes(s) ||
          String(row.getValue("email") || "").toLowerCase().includes(s) ||
          String(row.getValue("full_name") || "").toLowerCase().includes(s)
        )
      }}
      loadingMessage="Loading users..."
      emptyMessage="No marketing users found"
    />
  );
}
