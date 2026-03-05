import { Eye, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      className="rounded-lg border bg-card border-border overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className="bg-muted text-foreground"
          >
            <tr>
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
                Date
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-muted animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-muted animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-muted animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-muted animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-muted animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-muted animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="flex justify-end"><div className="h-8 w-8 rounded-md bg-muted animate-pulse" /></div></td>
                </tr>
              ))
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
                  className="hover:bg-accent transition-colors"
                >
                  <td className="px-6 py-4 text-sm">
                    {request.team_name || <span className="text-gray-400 italic">No Team</span>}
                  </td>
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
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(request)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          {request.status === "PENDING" && (
                            <>
                              <DropdownMenuItem onClick={() => onApprove(request)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onReject(request)} className="text-destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
