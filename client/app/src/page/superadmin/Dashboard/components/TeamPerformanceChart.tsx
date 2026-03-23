import { useState } from "react";
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
import { X } from "lucide-react";
import type { TeamPerformance } from "../utils/analyticsApi";

interface TeamPerformanceChartProps {
  data: TeamPerformance[];
  loading: boolean;
}

export function TeamPerformanceChart({ data, loading }: TeamPerformanceChartProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const chartData = data.slice(0, 5);
  const displayData = data.slice(0, 5);

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="shrink-0 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
      </div>

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
            {displayData.map((t) => (
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

      {data.length > 5 && (
        <div className="flex justify-center mt-2 border-t border-border pt-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All {data.length} Teams
          </button>
        </div>
      )}

      {/* ── View All Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-background/80">
          <div className="bg-card w-full max-w-4xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">All Team Performance</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card z-10 shadow-sm">
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Team</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Total</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Approved</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Rejected</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Rate</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((t) => (
                    <tr key={t.team_id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-foreground">{t.team_name}</td>
                      <td className="py-2.5 px-3 text-right">{t.total_requests}</td>
                      <td className="py-2.5 px-3 text-right">{t.approved_count}</td>
                      <td className="py-2.5 px-3 text-right">{t.rejected_count}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-medium px-2 py-1 rounded-md ${
                            t.approval_rate >= 75
                              ? "bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300 dark:bg-green-900/30 dark:text-green-400"
                              : t.approval_rate >= 50
                                ? "bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-800/50 dark:text-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-900/40 dark:border-rose-800/50 dark:text-rose-300 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {t.approval_rate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">{t.total_points.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
