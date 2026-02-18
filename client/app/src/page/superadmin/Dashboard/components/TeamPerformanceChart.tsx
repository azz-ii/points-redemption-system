import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { TeamPerformance } from "../utils/analyticsApi";

interface TeamPerformanceChartProps {
  data: TeamPerformance[];
  loading: boolean;
}

export function TeamPerformanceChart({ data, loading }: TeamPerformanceChartProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-[300px] rounded-lg bg-muted flex items-end justify-around gap-3 p-4 pt-8">
          {[[70, 30, 55], [60, 40, 50], [80, 25, 60], [50, 35, 45]].map((bars, i) => (
            <div key={i} className="flex-1 flex gap-1 items-end">
              <div className="flex-1 rounded-t bg-muted-foreground/10" style={{ height: `${bars[0]}%` }} />
              <div className="flex-1 rounded-t bg-muted-foreground/10" style={{ height: `${bars[1]}%` }} />
              <div className="flex-1 rounded-t bg-muted-foreground/10" style={{ height: `${bars[2]}%` }} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-3 w-8 rounded bg-muted ml-auto" />
              <div className="h-3 w-8 rounded bg-muted" />
              <div className="h-3 w-8 rounded bg-muted" />
              <div className="h-3 w-10 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No team data available for this period
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="team_name"
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
          />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="approved_count" name="Approved" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="rejected_count" name="Rejected" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="processed_count" name="Processed" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Detail table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Team</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Total</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Approved</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Rejected</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Rate</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Points</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.team_id} className="border-b border-border/50">
                <td className="py-1.5 px-2 font-medium">{t.team_name}</td>
                <td className="py-1.5 px-2 text-right">{t.total_requests}</td>
                <td className="py-1.5 px-2 text-right">{t.approved_count}</td>
                <td className="py-1.5 px-2 text-right">{t.rejected_count}</td>
                <td className="py-1.5 px-2 text-right">
                  <span
                    className={`font-medium ${
                      t.approval_rate >= 75
                        ? "text-green-600 dark:text-green-400"
                        : t.approval_rate >= 50
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {t.approval_rate}%
                  </span>
                </td>
                <td className="py-1.5 px-2 text-right font-medium">{t.total_points.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
