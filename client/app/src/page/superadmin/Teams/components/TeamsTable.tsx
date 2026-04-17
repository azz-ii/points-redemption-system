import { DataTable } from "@/components/shared/data-table";
import { createColumns, type Team } from "./columns";

interface TeamsTableProps {
  teams: Team[];
  loading: boolean;
  onView: (team: Team) => void;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onAnalytics: (team: Team) => void;
  onDeleteSelected?: (teams: Team[]) => void;
  onExport?: () => void;
  onCreateNew?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  fillHeight?: boolean;
}

export function TeamsTable({
  teams,
  loading,
  onView,
  onEdit,
  onDelete,
  onAnalytics,
  onDeleteSelected,
  onExport,
  onCreateNew,
  onRefresh,
  refreshing,
  fillHeight,
}: TeamsTableProps) {
  const columns = createColumns({
    onView,
    onEdit,
    onDelete,
    onAnalytics,
  });

  return (
    <DataTable
      columns={columns}
      data={teams}
      loading={loading}
      onDeleteSelected={onDeleteSelected}
      onExport={onExport}
      onCreateNew={onCreateNew}
      createButtonLabel="Create Team"
      createButtonIcon="user"
      onRefresh={onRefresh}
      refreshing={refreshing}
      searchPlaceholder="Filter by name, approver, marketing admin..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const s = String(filterValue).toLowerCase()
        const approverDetails = row.getValue("approver_details") as { full_name?: string; email?: string } | undefined
        const marketingAdminDetails = row.getValue("marketing_admin_details") as { full_name?: string; email?: string } | undefined
        return (
          String(row.getValue("name") || "").toLowerCase().includes(s) ||
          String(row.getValue("id") || "").toLowerCase().includes(s) ||
          String(approverDetails?.full_name || "").toLowerCase().includes(s) ||
          String(approverDetails?.email || "").toLowerCase().includes(s) ||
          String(marketingAdminDetails?.full_name || "").toLowerCase().includes(s) ||
          String(marketingAdminDetails?.email || "").toLowerCase().includes(s)
        )
      }}
      loadingMessage="Loading teams..."
      emptyMessage="No teams found"
      pageSizeOptions={[15, 50, 100]}
      initialSorting={[{ id: "name", desc: false }]}
      fillHeight={fillHeight}
      enableRowSelection={true}
    />
  );
}
