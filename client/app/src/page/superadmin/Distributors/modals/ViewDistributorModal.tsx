import { X } from "lucide-react";
import { useTheme } from "next-themes";
import type { ModalBaseProps, Distributor } from "./types";

interface ViewDistributorModalProps extends ModalBaseProps {
  distributor: Distributor | null;
}

export function ViewDistributorModal({
  isOpen,
  onClose,
  distributor,
}: ViewDistributorModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !distributor) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-2xl w-full border ${
          resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold">Distributor Details</h2>
            <p
              className={`text-sm ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              View distributor information
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">ID</p>
              <p className="font-semibold">{distributor.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="font-semibold">{distributor.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-semibold">{distributor.contact_email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <p className="font-semibold">{distributor.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="font-semibold">{distributor.location}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Region</p>
              <p className="font-semibold">{distributor.region}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Points</p>
              <p className="font-semibold">{distributor.points}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Team</p>
              <p className="font-semibold">{distributor.team_name || "No team"}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg border transition-colors ${
              resolvedTheme === "dark"
                ? "border-gray-600 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
