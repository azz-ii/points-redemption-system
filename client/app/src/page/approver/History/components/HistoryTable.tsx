import { Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
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
                  <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-muted animate-pulse" /></td>
                  <td className="px-6 py-4"><div className="flex justify-end"><div className="h-8 w-8 rounded-md bg-muted animate-pulse" /></div></td>
                </tr>
              ))
            ) : historyItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <p className="text-sm text-muted-foreground">No processed requests found</p>
                </td>
              </tr>
            ) : (
              historyItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-accent transition-colors"
                >
                  <td className="px-6 py-4 text-sm">
                    {item.team_name || <span className="text-muted-foreground italic">No Team</span>}
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
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
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
