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
import { FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const chartData = data.slice(0, 5).map((a) => ({
    ...a,
    shortName:
      a.agent_name.length > 15
        ? a.agent_name.slice(0, 15) + "…"
        : a.agent_name,
  }));

  const displayData = data.slice(0, 5);

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="shrink-0 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
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
      </div>

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
            {displayData.map((a) => {
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

      {data.length > 5 && (
        <div className="flex justify-center mt-2 border-t border-border pt-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View All {data.length} Agents
          </button>
        </div>
      )}

      {/* ── View All Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-background/80">
          <div className="bg-card w-full max-w-5xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">All Agent Performance</h2>
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
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Agent</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Team</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Total</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Approved</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Rate</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Points</th>
                    {detailItems && detailItems.length > 0 && (
                      <th className="text-center py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Export</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((a) => {
                    const detail = detailItems?.find((d) => d.id === a.agent_id);
                    const isFetching = fetchingId === a.agent_id;
                    return (
                      <tr key={a.agent_id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-foreground">{a.agent_name}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{a.team_name || "-"}</td>
                        <td className="py-2.5 px-3 text-right">{a.total_requests}</td>
                        <td className="py-2.5 px-3 text-right">{a.approved_count}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`font-medium px-2 py-1 rounded-md ${
                              a.approval_rate >= 75
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : a.approval_rate >= 50
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {a.approval_rate}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">{a.total_points.toLocaleString()}</td>
                        {detail && (
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1">
                              {isFetching ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleExport(detail, "excel")}
                                    title={`Export ${a.agent_name} as Excel`}
                                    className="p-1.5 rounded-md border border-border hover:bg-background transition-colors"
                                  >
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                                  </button>
                                  <button
                                    onClick={() => handleExport(detail, "pdf")}
                                    title={`Export ${a.agent_name} as PDF`}
                                    className="p-1.5 rounded-md border border-border hover:bg-background transition-colors"
                                  >
                                    <FileText className="h-4 w-4 text-rose-500" />
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
        </div>
      )}
    </div>
  );
}
