import { getStatusClasses } from "@/components/ui/status-badge";
import { useState } from "react";
import {
  CheckCircle2, XCircle, TrendingUp, Clock, FileText, ShieldCheck
} from "lucide-react";
import { StatCard } from "./StatCard";
import { StatGrid } from "./StatGrid";
import type { ApproverStatsData, ApproverActivity } from "@/page/superadmin/Dashboard/utils/analyticsApi";

interface ApproverStatsProps {
  stats: ApproverStatsData;
  recentActivity: ApproverActivity[];
}

const STATUS_BADGE: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

type Filter = "all" | "APPROVED" | "REJECTED";

function formatDate(iso: string | null) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ApproverStats({ stats, recentActivity }: ApproverStatsProps) {
  const [activeFilter, setActiveFilter] = useState<Filter | null>(null);

  const toggle = (f: Filter) => setActiveFilter((prev) => (prev === f ? null : f));
  const filtered = activeFilter
    ? activeFilter === "all" ? recentActivity : recentActivity.filter((r) => r.status === activeFilter)
    : [];

  return (
    <div className="space-y-4">
      <StatGrid columns={5}>
        <StatCard label="Total Reviewed" value={stats.total_reviewed} icon={<FileText className="h-3.5 w-3.5" />} onClick={() => toggle("all")} active={activeFilter === "all"} />
        <StatCard label="Approved" value={stats.approved_count} icon={<CheckCircle2 className="h-3.5 w-3.5" />} color="text-green-500" onClick={() => toggle("APPROVED")} active={activeFilter === "APPROVED"} />
        <StatCard label="Rejected" value={stats.rejected_count} icon={<XCircle className="h-3.5 w-3.5" />} color="text-red-500" onClick={() => toggle("REJECTED")} active={activeFilter === "REJECTED"} />
        <StatCard label="Approval Rate" value={`${stats.approval_rate}%`} icon={<TrendingUp className="h-3.5 w-3.5" />} color="text-blue-500" />
        <StatCard
          label="Avg. Review Time"
          value={stats.avg_review_hours != null ? `${stats.avg_review_hours}h` : "\u2014"}
          icon={<Clock className="h-3.5 w-3.5" />}
          color="text-indigo-500"
        />
      </StatGrid>

      {/* Sales Approval Track */}
      {stats.sales_approvals_total > 0 && (
        <>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sales Approval Track</h4>
          <StatGrid columns={3}>
            <StatCard label="Sales Approvals" value={stats.sales_approvals_total} icon={<ShieldCheck className="h-3.5 w-3.5" />} color="text-teal-500" />
            <StatCard label="Sales Approved" value={stats.sales_approved_count} icon={<CheckCircle2 className="h-3.5 w-3.5" />} color="text-green-500" />
            <StatCard label="Sales Rejected" value={stats.sales_rejected_count} icon={<XCircle className="h-3.5 w-3.5" />} color="text-red-500" />
          </StatGrid>
        </>
      )}

      {/* Filtered Reviews Table \u2014 shown when a stat card is clicked */}
      {activeFilter && filtered.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {activeFilter === "all" ? "All Reviews" : `${activeFilter} Reviews`}
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
                    <th className="px-3 py-2 font-medium text-muted-foreground">Date Reviewed</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Requested By</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">For</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground text-right">Points</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr key={r.request_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 font-mono text-xs">#{r.request_id}</td>
                      <td className="px-3 py-2 text-xs">{formatDate(r.date_reviewed)}</td>
                      <td className="px-3 py-2 text-xs truncate max-w-[120px]">{r.requested_by ?? "\u2014"}</td>
                      <td className="px-3 py-2 text-xs truncate max-w-[120px]">{r.requested_for ?? "\u2014"}</td>
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
        <p className="text-sm text-muted-foreground text-center py-4">No {activeFilter === "all" ? "" : activeFilter.toLowerCase() + " "}reviews found.</p>
      )}
    </div>
  );
}
