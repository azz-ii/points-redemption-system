import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { analyticsApi, type UserAnalyticsResponse } from "@/page/superadmin/Dashboard/utils/analyticsApi";
import { SalesAgentStats } from "./SalesAgentStats";
import { ApproverStats } from "./ApproverStats";
import { MarketingStats } from "./MarketingStats";

interface AccountAnalyticsProps {
  accountId: number;
  position: string;
}

const SUPPORTED_POSITIONS = ["Sales Agent", "Approver", "Handler"];

export function AccountAnalytics({ accountId, position }: AccountAnalyticsProps) {
  const [data, setData] = useState<UserAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!SUPPORTED_POSITIONS.includes(position)) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    analyticsApi
      .getUserStats(accountId)
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
  }, [accountId, position]);

  // Positions without analytics
  if (!SUPPORTED_POSITIONS.includes(position)) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Performance Analytics
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Performance Analytics
        </h3>
      </div>

      {data.position === "Sales Agent" && (
        <SalesAgentStats stats={data.stats} recentActivity={data.recent_activity} />
      )}
      {data.position === "Approver" && (
        <ApproverStats stats={data.stats} recentActivity={data.recent_activity} />
      )}
      {data.position === "Handler" && (
        <MarketingStats stats={data.stats} recentActivity={data.recent_activity} />
      )}
    </div>
  );
}
