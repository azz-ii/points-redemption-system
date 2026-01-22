import { useMemo } from "react";
import type { MarketingUser } from "./types";
import { DataTable } from "./data-table";
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
    />
  );
}
