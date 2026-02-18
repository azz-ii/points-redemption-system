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
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import type { AgentPerformance } from "../utils/analyticsApi";
import type { DetailExportItem } from "./ChartExportButton";
import { exportDataAsExcel, exportDataAsPdf } from "./ChartExportButton";

interface AgentPerformanceChartProps {
  data: AgentPerformance[];
  loading: boolean;
  detailItems?: DetailExportItem[];
}

export function AgentPerformanceChart({ data, loading, detailItems }: AgentPerformanceChartProps) {
  const [fetchingId, setFetchingId] = useState<string | number | null>(null);

  const handleExport = async (item: DetailExportItem, format: "excel" | "pdf") => {
    try {
      setFetchingId(item.id);
      const rows = await item.fetcher();
      if (!rows.length) return;
      const safeName = item.label.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-").toLowerCase();
      if (format === "excel") {
        exportDataAsExcel(rows, safeName);
      } else {
        exportDataAsPdf(rows, safeName, item.label);
      }
    } catch (err) {
      console.error(`[ChartExport] Detail export error for "${item.label}":`, err);
    } finally {
      setFetchingId(null);
    }
  };
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-[300px] rounded-lg bg-muted flex items-end justify-around gap-2 p-4 pt-8">
          {[70, 55, 80, 45, 65, 50].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col gap-0.5 items-stretch">
              <div className="rounded-t bg-muted-foreground/10" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-8 rounded bg-muted ml-auto" />
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
        No agent data available for this period
      </div>
    );
  }

  const chartData = data.map((a) => ({
    ...a,
    shortName:
      a.agent_name.length > 15
        ? a.agent_name.slice(0, 15) + "…"
        : a.agent_name,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="shortName"
            tick={{ fontSize: 10 }}
            className="fill-muted-foreground"
            angle={-25}
            textAnchor="end"
            height={50}
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
          <Bar dataKey="approved_count" name="Approved" stackId="a" fill="hsl(142, 71%, 45%)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="rejected_count" name="Rejected" stackId="a" fill="hsl(0, 72%, 51%)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="withdrawn_count" name="Withdrawn" stackId="a" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Detail table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Agent</th>
              <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Team</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Total</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Approved</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Rate</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Points</th>
              {detailItems && detailItems.length > 0 && (
                <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Export</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((a) => {
              const detail = detailItems?.find((d) => d.id === a.agent_id);
              const isFetching = fetchingId === a.agent_id;
              return (
                <tr key={a.agent_id} className="border-b border-border/50">
                  <td className="py-1.5 px-2 font-medium">{a.agent_name}</td>
                  <td className="py-1.5 px-2 text-muted-foreground">{a.team_name || "-"}</td>
                  <td className="py-1.5 px-2 text-right">{a.total_requests}</td>
                  <td className="py-1.5 px-2 text-right">{a.approved_count}</td>
                  <td className="py-1.5 px-2 text-right">
                    <span
                      className={`font-medium ${
                        a.approval_rate >= 75
                          ? "text-green-600 dark:text-green-400"
                          : a.approval_rate >= 50
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {a.approval_rate}%
                    </span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-medium">{a.total_points.toLocaleString()}</td>
                  {detail && (
                    <td className="py-1.5 px-2">
                      <div className="flex items-center justify-center gap-0.5">
                        {isFetching ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleExport(detail, "excel")}
                              title={`Export ${a.agent_name} as Excel`}
                              className="p-1 rounded hover:bg-accent transition-colors"
                            >
                              <FileSpreadsheet className="h-3.5 w-3.5 text-green-500" />
                            </button>
                            <button
                              onClick={() => handleExport(detail, "pdf")}
                              title={`Export ${a.agent_name} as PDF`}
                              className="p-1 rounded hover:bg-accent transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
