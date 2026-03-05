import { getStatusClasses } from "@/components/ui/status-badge";
import { useState } from "react";
import {
  FileText, CheckCircle2, XCircle, Clock, TrendingUp,
  Undo2, Zap, Package, Ban,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { StatGrid } from "./StatGrid";
import type { TeamStatsData, TeamActivity } from "@/page/superadmin/Dashboard/utils/analyticsApi";

interface TeamOverviewStatsProps {
  stats: TeamStatsData;
  recentActivity: TeamActivity[];
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  WITHDRAWN: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
  PROCESSED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CANCELLED: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

type Filter = "all" | "APPROVED" | "REJECTED" | "WITHDRAWN" | "PENDING" | "PROCESSED" | "CANCELLED";

function formatDate(iso: string | null) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function filterRows(rows: TeamActivity[], filter: Filter): TeamActivity[] {
  if (filter === "all") return rows;
  if (filter === "PROCESSED" || filter === "CANCELLED") return rows.filter((r) => r.processing_status === filter);
  return rows.filter((r) => r.status === filter);
}

export function TeamOverviewStats({ stats, recentActivity }: TeamOverviewStatsProps) {
  const [activeFilter, setActiveFilter] = useState<Filter | null>(null);

  const toggle = (f: Filter) => setActiveFilter((prev) => (prev === f ? null : f));
  const filtered = activeFilter ? filterRows(recentActivity, activeFilter) : [];

  return (
    <div className="space-y-4">
      <StatGrid columns={5}>
        <StatCard label="Total Requests" value={stats.total_requests} icon={<FileText className="h-3.5 w-3.5" />} onClick={() => toggle("all")} active={activeFilter === "all"} />
        <StatCard label="Approved" value={stats.approved_count} icon={<CheckCircle2 className="h-3.5 w-3.5" />} color="text-green-500" onClick={() => toggle("APPROVED")} active={activeFilter === "APPROVED"} />
        <StatCard label="Rejected" value={stats.rejected_count} icon={<XCircle className="h-3.5 w-3.5" />} color="text-red-500" onClick={() => toggle("REJECTED")} active={activeFilter === "REJECTED"} />
        <StatCard label="Withdrawn" value={stats.withdrawn_count} icon={<Undo2 className="h-3.5 w-3.5" />} color="text-muted-foreground" onClick={() => toggle("WITHDRAWN")} active={activeFilter === "WITHDRAWN"} />
        <StatCard label="Pending" value={stats.pending_count} icon={<Clock className="h-3.5 w-3.5" />} color="text-yellow-500" onClick={() => toggle("PENDING")} active={activeFilter === "PENDING"} />
      </StatGrid>

      <StatGrid columns={5}>
        <StatCard label="Approval Rate" value={`${stats.approval_rate}%`} icon={<TrendingUp className="h-3.5 w-3.5" />} color="text-blue-500" />
        <StatCard label="Points Redeemed" value={stats.total_points_redeemed} icon={<Zap className="h-3.5 w-3.5" />} color="text-purple-500" />
        <StatCard label="Processed" value={stats.processed_count} icon={<Package className="h-3.5 w-3.5" />} color="text-blue-500" onClick={() => toggle("PROCESSED")} active={activeFilter === "PROCESSED"} />
        <StatCard label="Cancelled" value={stats.cancelled_count} icon={<Ban className="h-3.5 w-3.5" />} color="text-orange-500" onClick={() => toggle("CANCELLED")} active={activeFilter === "CANCELLED"} />
        <StatCard
          label="Avg. Turnaround"
          value={stats.avg_turnaround_hours != null ? `${stats.avg_turnaround_hours}h` : "\u2014"}
          icon={<Clock className="h-3.5 w-3.5" />}
          color="text-indigo-500"
        />
      </StatGrid>

      {/* Filtered Requests Table */}
      {activeFilter && filtered.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {activeFilter === "all" ? "All Requests" : `${activeFilter} Requests`}
              <span className="ml-1.5 text-foreground">({filtered.length})</span>
            </h4>
            <button onClick={() => setActiveFilter(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="bg-muted/80 text-left">
                    <th className="px-3 py-2 font-medium text-muted-foreground">ID</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Date</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">By</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">For</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Items</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground text-right">Points</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr key={r.request_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 font-mono text-xs">#{r.request_id}</td>
                      <td className="px-3 py-2 text-xs">{formatDate(r.date_requested)}</td>
                      <td className="px-3 py-2 text-xs truncate max-w-[100px]">{r.requested_by ?? "\u2014"}</td>
                      <td className="px-3 py-2 text-xs truncate max-w-[100px]">{r.requested_for ?? "\u2014"}</td>
                      <td className="px-3 py-2 text-xs truncate max-w-[160px]" title={r.items}>{r.items || "\u2014"}</td>
                      <td className="px-3 py-2 text-xs text-right font-semibold">{r.total_points.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(r.status) ?? "bg-muted text-foreground"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeFilter && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No {activeFilter === "all" ? "" : activeFilter.toLowerCase() + " "}requests found.</p>
      )}
    </div>
  );
}
