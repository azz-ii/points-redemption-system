import { Eye, CheckCircle, XCircle, Info } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  const badgeTone = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 ring-1 ring-amber-300 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30";
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 ring-1 ring-rose-300 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30";
      default:
        return "bg-slate-100 text-slate-700 ring-1 ring-slate-300 dark:bg-slate-500/10 dark:text-slate-200 dark:ring-slate-500/30";
    }
  };

  const processingBadgeTone = (status: string) => {
    const statusUpper = status?.toUpperCase() || "";
    switch (statusUpper) {
      case "PROCESSED":
        return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 ring-1 ring-rose-300 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30";
      case "NOT_PROCESSED":
      default:
        return "bg-amber-100 text-amber-800 ring-1 ring-amber-300 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/30";
    }
  };

  const cardBg =
    resolvedTheme === "dark"
      ? "bg-neutral-900/80 border-neutral-800"
      : "bg-white border-gray-200 shadow-sm";

  return (
    <div className={`rounded-xl border ${cardBg} overflow-hidden`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Review and act on incoming redemption requests</span>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
          {requests.length} total
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/60">
            <TableHead className="min-w-[110px]">Request</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead>Requested For</TableHead>
            <TableHead className="min-w-[120px]">Points</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Processing</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Processed</TableHead>
            <TableHead className="text-right min-w-[160px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="py-10 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading requests...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : requests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="py-10 text-center text-muted-foreground"
              >
                No requests found
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id} className="hover:bg-muted/40">
                <TableCell className="font-semibold">#{request.id}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {request.team_name || (
                    <span className="italic text-muted-foreground/70">
                      No Team
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {request.requested_by_name}
                </TableCell>
                <TableCell className="text-sm">
                  {request.requested_for_name}
                </TableCell>
                <TableCell className="text-sm font-semibold">
                  {request.total_points.toLocaleString()} pts
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badgeTone(
                      request.status
                    )}`}
                  >
                    {request.status_display}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${processingBadgeTone(
                      request.processing_status
                    )}`}
                  >
                    {request.processing_status_display || "Not Processed"}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(request.date_requested).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {request.date_processed
                    ? new Date(request.date_processed).toLocaleDateString()
                    : <span className="italic">N/A</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onView(request)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      title="View"
                    >
                      <Eye className="h-4 w-4" /> View
                    </button>
                    {request.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => onApprove(request)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() => onReject(request)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
