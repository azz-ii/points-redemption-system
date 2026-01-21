import { Eye } from "lucide-react";
import { useTheme } from "next-themes";
import type { HistoryItem } from "../types.js";

interface HistoryTableProps {
  historyItems: HistoryItem[];
  loading: boolean;
  onView: (item: HistoryItem) => void;
}

export function HistoryTable({
  historyItems,
  loading,
  onView,
}: HistoryTableProps) {
  const { resolvedTheme } = useTheme();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500 text-white";
      case "REJECTED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div
      className={`rounded-lg border ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-gray-700"
          : "bg-white border-gray-200"
      } overflow-hidden`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className={`${
              resolvedTheme === "dark"
                ? "bg-gray-800 text-gray-300"
                : "bg-gray-50 text-gray-700"
            }`}
          >
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Team
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Requested By
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Requested For
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Total Points
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Date Processed
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Processed By
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500">Loading history...</p>
                  </div>
                </td>
              </tr>
            ) : historyItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500">No processed requests found</p>
                </td>
              </tr>
            ) : (
              historyItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:${
                    resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                  } transition-colors`}
                >
                  <td className="px-6 py-4 text-sm">#{item.id}</td>
                  <td className="px-6 py-4 text-sm">
                    {item.team_name || <span className="text-gray-400 italic">No Team</span>}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.requested_by_name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.requested_for_name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.total_points.toLocaleString()} pts
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                        item.status
                      )}`}
                    >
                      {item.status_display}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.date_processed
                      ? new Date(item.date_processed).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {item.processed_by_name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onView(item)}
                        className="px-4 py-2 rounded flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors text-sm"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
