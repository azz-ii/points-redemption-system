import { useState } from "react";
import {
  Package, FileText, CheckCircle2, Ban, Clock
} from "lucide-react";
import { StatCard } from "./StatCard";
import { StatGrid } from "./StatGrid";
import type { MarketingStatsData, MarketingActivity } from "@/page/superadmin/Dashboard/utils/analyticsApi";

interface MarketingStatsProps {
  stats: MarketingStatsData;
  recentActivity: MarketingActivity[];
}

const PROC_BADGE: Record<string, string> = {
  PROCESSED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CANCELLED: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  NOT_PROCESSED: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
};

type Filter = "all" | "PROCESSED" | "CANCELLED";

function formatDate(iso: string | null) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MarketingStats({ stats, recentActivity }: MarketingStatsProps) {
  const [activeFilter, setActiveFilter] = useState<Filter | null>(null);

  const toggle = (f: Filter) => setActiveFilter((prev) => (prev === f ? null : f));
  const filtered = activeFilter
    ? activeFilter === "all" ? recentActivity : recentActivity.filter((r) => r.processing_status === activeFilter)
    : [];

  return (
    <div className="space-y-4">
      <StatGrid columns={5}>
        <StatCard label="Items Processed" value={stats.total_items_processed} icon={<Package className="h-3.5 w-3.5" />} onClick={() => toggle("all")} active={activeFilter === "all"} />
        <StatCard label="Requests Touched" value={stats.total_requests_touched} icon={<FileText className="h-3.5 w-3.5" />} color="text-blue-500" onClick={() => toggle("all")} active={activeFilter === "all"} />
        <StatCard label="Fully Processed" value={stats.processed_count} icon={<CheckCircle2 className="h-3.5 w-3.5" />} color="text-green-500" onClick={() => toggle("PROCESSED")} active={activeFilter === "PROCESSED"} />
        <StatCard label="Cancelled" value={stats.cancelled_count} icon={<Ban className="h-3.5 w-3.5" />} color="text-orange-500" onClick={() => toggle("CANCELLED")} active={activeFilter === "CANCELLED"} />
        <StatCard
          label="Avg. Processing"
          value={stats.avg_processing_hours != null ? `${stats.avg_processing_hours}h` : "\u2014"}
          icon={<Clock className="h-3.5 w-3.5" />}
          color="text-indigo-500"
        />
      </StatGrid>

      {/* Filtered Items Table \u2014 shown when a stat card is clicked */}
      {activeFilter && filtered.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {activeFilter === "all" ? "All Items" : `${activeFilter} Items`}
              <span className="ml-1.5 text-foreground">({filtered.length})</span>
            </h4>
            <button onClick={() => setActiveFilter(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Clear</button>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0">
                  <tr className="bg-muted/80 text-left">
                    <th className="px-3 py-2 font-medium text-muted-foreground">Request</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Item</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground text-right">Qty</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground text-right">Points</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Processed</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">By</th>
                    <th className="px-3 py-2 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r, i) => (
                    <tr key={`${r.request_id}-${i}`} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 font-mono text-xs">#{r.request_id}</td>
                      <td className="px-3 py-2 text-xs truncate max-w-[150px]">{r.item_name ?? "\u2014"}</td>
                      <td className="px-3 py-2 text-xs text-right">{r.quantity}</td>
                      <td className="px-3 py-2 text-xs text-right font-semibold">{r.total_points.toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs">{formatDate(r.processed_at)}</td>
                      <td className="px-3 py-2 text-xs truncate max-w-[100px]">{r.requested_by ?? "\u2014"}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PROC_BADGE[r.processing_status] ?? "bg-muted text-foreground"}`}>
                          {r.processing_status}
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
        <p className="text-sm text-muted-foreground text-center py-4">No {activeFilter === "all" ? "" : activeFilter.toLowerCase() + " "}items found.</p>
      )}
    </div>
  );
}
