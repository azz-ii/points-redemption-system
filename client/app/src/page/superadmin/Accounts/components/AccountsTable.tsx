import type { Account } from "../modals";
import { DataTable } from "./data-table";
import { createColumns } from "./columns";

interface AccountsTableProps {
  accounts: Account[];
  loading: boolean;
  onViewAccount: (account: Account) => void;
  onEditAccount: (account: Account) => void;
  onBanAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
  onDeleteSelected?: (accounts: Account[]) => void;
  onBanSelected?: (accounts: Account[]) => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function AccountsTable({
  accounts,
  loading,
  onViewAccount,
  onEditAccount,
  onBanAccount,
  onDeleteAccount,
  onDeleteSelected,
  onBanSelected,
  onCreateNew,
  onRefresh,
  refreshing,
}: AccountsTableProps) {
  const columns = createColumns({
    onViewAccount,
    onEditAccount,
    onBanAccount,
    onDeleteAccount,
  });

  return (
    <DataTable
      columns={columns}
      data={accounts}
      loading={loading}
      onDeleteSelected={onDeleteSelected}
      onBanSelected={onBanSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add User"
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
}
