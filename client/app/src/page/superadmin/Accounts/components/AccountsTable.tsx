import { useMemo } from "react";
import type { Account } from "../modals";
import { DataTable } from "@/components/shared/data-table";
import { createColumns } from "./columns";

interface AccountsTableProps {
  accounts: Account[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onViewAccount: (account: Account) => void;
  onEditAccount: (account: Account) => void;
  onBanAccount: (account: Account) => void;
  onArchiveAccount: (account: Account) => void;
  onUnarchiveAccount: (account: Account) => void;
  onArchiveSelected?: (accounts: Account[]) => void;
  onBanSelected?: (accounts: Account[]) => void;
  onCreateNew?: () => void;
  onSetPoints?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExport?: (selectedRows: Account[]) => void;
  onViewPointsHistory?: (account: Account) => void;
  editingRowId?: number | null;
  editedData?: Record<string, any>;
  onToggleInlineEdit?: (account: Account) => void;
  onSaveInlineEdit?: (accountId: number) => void;
  onCancelInlineEdit?: () => void;
  onFieldChange?: (field: string, value: any) => void;
  fieldErrors?: Record<string, string>;
  manualPagination?: boolean;
  pageCount?: number;
  totalResults?: number;
  currentPage?: number;
  onPageChange?: (pageIndex: number) => void;
  onSearch?: (query: string) => void;
}

export function AccountsTable({
  accounts,
  loading,
  error,
  onRetry,
  onViewAccount,
  onEditAccount,
  onBanAccount,
  onArchiveAccount,
  onUnarchiveAccount,
  onArchiveSelected,
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
  manualPagination,
  pageCount,
  totalResults,
  currentPage,
  onPageChange,
  onSearch,
}: AccountsTableProps) {
  const columns = useMemo(
    () =>
      createColumns({
        onViewAccount,
        onEditAccount,
        onBanAccount,
        onArchiveAccount,
        onUnarchiveAccount,
        onViewPointsHistory,
        onToggleInlineEdit,
        onSaveInlineEdit,
        onCancelInlineEdit,
      }),
    [
      onViewAccount,
      onEditAccount,
      onBanAccount,
      onArchiveAccount,
      onUnarchiveAccount,
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
      error={error}
      onRetry={onRetry}
      onDeleteSelected={onArchiveSelected}
      onBanSelected={onBanSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Add User"
      createButtonIcon="user"
      onSetPoints={onSetPoints}
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
      initialSorting={[{ id: "id", desc: false }]}
      loadingMessage="Loading accounts..."
      emptyMessage="No accounts found"
      editingRowId={editingRowId}
      editedData={editedData}
      onFieldChange={onFieldChange}
      fieldErrors={fieldErrors}
      manualPagination={manualPagination}
      pageCount={pageCount}
      totalResults={totalResults}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onSearch={onSearch}
    />
  );
}
