import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useTheme } from "next-themes";
import type { RequestItem } from "../modals/types";

interface RequestsTableProps {
  requests: RequestItem[];
  loading: boolean;
  onView: (request: RequestItem) => void;
  onApprove: (request: RequestItem) => void;
  onReject: (request: RequestItem) => void;
}

export function RequestsTable({
  requests,
  loading,
  onView,
  onApprove,
  onReject,
}: RequestsTableProps) {
  const { resolvedTheme } = useTheme();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-400 text-black";
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
                Date
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500">Loading requests...</p>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-sm text-gray-500">No requests found</p>
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr
                  key={request.id}
                  className={`hover:${
                    resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                  } transition-colors`}
                >
                  <td className="px-6 py-4 text-sm">#{request.id}</td>
                  <td className="px-6 py-4 text-sm">
                    {request.requested_by_name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {request.requested_for_name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {request.total_points.toLocaleString()} pts
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                        request.status
                      )}`}
                    >
                      {request.status_display}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(request.date_requested).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onView(request)}
                        className="px-4 py-2 rounded flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors text-sm"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {request.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => onApprove(request)}
                            className="px-4 py-2 rounded flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors text-sm"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onReject(request)}
                            className="px-4 py-2 rounded flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors text-sm"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
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
