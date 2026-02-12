import { X, AlertTriangle } from "lucide-react";
import type { Team, ModalBaseProps } from "./types";

interface DeleteTeamModalProps extends ModalBaseProps {
  team: Team | null;
  loading: boolean;
  onConfirm: (id: number) => void;
}

export function DeleteTeamModal({
  isOpen,
  onClose,
  team,
  loading,
  onConfirm,
}: DeleteTeamModalProps) {
  if (!isOpen || !team) return null;

  const handleClose = () => {
    console.log("DEBUG DeleteTeamModal: Closing modal");
    onClose();
  };

  const handleConfirm = () => {
    console.log("DEBUG DeleteTeamModal: Delete confirmed", {
      teamId: team.id,
      teamName: team.name,
      memberCount: team.member_count,
    });
    onConfirm(team.id);
  };

  const hasMembers = team.member_count && team.member_count > 0;

  console.log("DEBUG DeleteTeamModal: Rendering", {
    isOpen,
    teamId: team?.id,
    teamName: team?.name,
    memberCount: team?.member_count,
    hasMembers,
    loading,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-team-title"
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 id="delete-team-title" className="text-lg font-semibold">
              Delete Team
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p>
            Are you sure you want to delete <strong>{team.name}</strong>?
          </p>

          {/* Warning if team has members */}
          {hasMembers && (
            <div
              className="flex items-start gap-2 p-3 rounded border bg-warning bg-opacity-10 border-yellow-500"
            >
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">
                  Warning: This team has active members
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-400 mt-2 space-y-1">
                  <li>
                    • {team.member_count} team member
                    {team.member_count === 1 ? "" : "s"}
                  </li>
                </ul>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                  The backend will prevent deletion if members exist. Remove
                  them first.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground border border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
