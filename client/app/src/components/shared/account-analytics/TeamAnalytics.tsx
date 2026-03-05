import { useState, useEffect } from "react";
import { BarChart3, Users } from "lucide-react";
import { analyticsApi, type TeamAnalyticsResponse } from "@/page/superadmin/Dashboard/utils/analyticsApi";
import { TeamOverviewStats } from "./TeamOverviewStats";
import { TeamMemberBreakdown } from "./TeamMemberBreakdown";
import { TeamTopItems } from "./TeamTopItems";
import { StatGrid } from "./StatGrid";
import { StatCard } from "./StatCard";

interface TeamAnalyticsProps {
  teamId: number;
}

export function TeamAnalytics({ teamId }: TeamAnalyticsProps) {
  const [data, setData] = useState<TeamAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    analyticsApi
      .getTeamStats(teamId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load analytics");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Team Analytics
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border bg-card border-border">
              <div className="animate-pulse space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-6 w-10 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-32 rounded-lg border border-border bg-card animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load analytics: {error}</p>
      </div>
    );
  }

  if (!data || !data.stats) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Team Analytics
        </h3>
      </div>

      {/* Summary: Members + Avg Processing */}
      <StatGrid columns={2}>
        <StatCard label="Team Members" value={data.stats.member_count} icon={<Users className="h-3.5 w-3.5" />} color="text-teal-500" />
        <StatCard
          label="Avg. Processing"
          value={data.stats.avg_processing_hours != null ? `${data.stats.avg_processing_hours}h` : "\u2014"}
          icon={<BarChart3 className="h-3.5 w-3.5" />}
          color="text-indigo-500"
        />
      </StatGrid>

      {/* Overview stat cards + click-to-toggle table */}
      <TeamOverviewStats stats={data.stats} recentActivity={data.recent_activity} />

      {/* Member Breakdown table */}
      <TeamMemberBreakdown members={data.member_breakdown} />

      {/* Top Redeemed Items */}
      <TeamTopItems items={data.stats.top_items} />
    </div>
  );
}
