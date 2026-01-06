import { DataTable } from "./data-table";
import { createColumns, type Team } from "./columns";

interface TeamsTableProps {
  teams: Team[];
  loading: boolean;
  onView: (team: Team) => void;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onDeleteSelected?: (teams: Team[]) => void;
  onCreateNew?: () => void;
}

export function TeamsTable({
  teams,
  loading,
  onView,
  onEdit,
  onDelete,
  onDeleteSelected,
  onCreateNew,
}: TeamsTableProps) {
  const columns = createColumns({
    onView,
    onEdit,
    onDelete,
  });

  return (
    <DataTable
      columns={columns}
      data={teams}
      loading={loading}
      onDeleteSelected={onDeleteSelected}
      onCreateNew={onCreateNew}
      createButtonLabel="Create Team"
    />
  );
}
