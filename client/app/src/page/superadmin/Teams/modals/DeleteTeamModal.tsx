import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();

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
      distributorCount: team.distributor_count,
    });
    onConfirm(team.id);
  };

  const hasMembersOrDistributors =
    (team.member_count && team.member_count > 0) ||
    (team.distributor_count && team.distributor_count > 0);

  console.log("DEBUG DeleteTeamModal: Rendering", {
    isOpen,
    teamId: team?.id,
    teamName: team?.name,
    memberCount: team?.member_count,
    distributorCount: team?.distributor_count,
    hasMembersOrDistributors,
    loading,
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-md w-full border ${
          resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold">Delete Team</h2>
            <p className="text-xs text-gray-500 mt-1">
              This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p>
            Are you sure you want to delete{" "}
            <strong>{team.name}</strong>?
          </p>

          {/* Warning if team has members or distributors */}
          {hasMembersOrDistributors && (
            <div
              className={`flex items-start gap-3 p-3 rounded border ${
                resolvedTheme === "dark"
                  ? "bg-yellow-500 bg-opacity-10 border-yellow-500"
                  : "bg-yellow-50 border-yellow-400"
              }`}
            >
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-500">
                  Warning: This team has active associations
                </p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-400 mt-2 space-y-1">
                  {team.member_count && team.member_count > 0 && (
                    <li>
                      • {team.member_count} team member
                      {team.member_count === 1 ? "" : "s"}
                    </li>
                  )}
                  {team.distributor_count && team.distributor_count > 0 && (
                    <li>
                      • {team.distributor_count} assigned distributor
                      {team.distributor_count === 1 ? "" : "s"}
                    </li>
                  )}
                </ul>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                  The backend will prevent deletion if members or distributors
                  exist. Remove them first.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-2">
          <button
            onClick={handleClose}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-white hover:bg-gray-100 text-gray-900"
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                : "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            }`}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
