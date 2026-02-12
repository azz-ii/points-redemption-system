import { useMemo } from "react";
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
  onSetPoints?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: () => void;
  onViewPointsHistory?: (account: Account) => void;
  editingRowId?: number | null;
  editedData?: Record<string, any>;
  onToggleInlineEdit?: (account: Account) => void;
  onSaveInlineEdit?: (accountId: number) => void;
  onCancelInlineEdit?: () => void;
  onFieldChange?: (field: string, value: any) => void;
  fieldErrors?: Record<string, string>;
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
  onSetPoints,
  onRefresh,
  refreshing,
  onExport,
  onViewPointsHistory,
  editingRowId,
  editedData,
  onToggleInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,
  onFieldChange,
  fieldErrors,
}: AccountsTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onViewAccount,
        onEditAccount,
        onBanAccount,
        onDeleteAccount,
        onViewPointsHistory,
        onToggleInlineEdit,
        onSaveInlineEdit,
        onCancelInlineEdit,
      }),
    [
      onViewAccount,
      onEditAccount,
      onBanAccount,
      onDeleteAccount,
      onViewPointsHistory,
      onToggleInlineEdit,
      onSaveInlineEdit,
      onCancelInlineEdit,
    ]
  );

  return (
    <DataTable
      columns={columns}
      data={accounts}
      loading={loading}
      onDeleteSelected={onDeleteSelected}
      onBanSelected={onBanSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add User"
      onSetPoints={onSetPoints}
      onRefresh={onRefresh}
      refreshing={refreshing}
      onExport={onExport}
      editingRowId={editingRowId}
      editedData={editedData}
      onFieldChange={onFieldChange}
      fieldErrors={fieldErrors}
    />
  );
}
