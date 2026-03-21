import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
import type { ItemPopularity } from "../utils/analyticsApi";
import type { DetailExportItem } from "./ChartExportButton";
import { exportDataAsExcel, exportDataAsPdf } from "./ChartExportButton";

interface ItemPopularityChartProps {
  data: ItemPopularity[];
  loading: boolean;
  detailItems?: DetailExportItem[];
}

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(262, 83%, 58%)",
  "hsl(190, 90%, 50%)",
  "hsl(320, 70%, 50%)",
  "hsl(44, 94%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(280, 60%, 55%)",
];

export function ItemPopularityChart({ data, loading, detailItems }: ItemPopularityChartProps) {
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
        <div className="space-y-2.5 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-24 rounded bg-muted flex-shrink-0" />
              <div className="h-6 rounded bg-muted" style={{ width: `${80 - i * 12}%` }} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted" />
              <div className="h-3 flex-1 rounded bg-muted" />
              <div className="h-3 w-10 rounded bg-muted" />
              <div className="h-3 w-10 rounded bg-muted" />
              <div className="h-3 w-10 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No item data available for this period
      </div>
    );
  }

  const chartData = data.slice(0, 5).map((item) => ({
    ...item,
    shortName:
      item.item_name.length > 20
        ? item.item_name.slice(0, 20) + "…"
        : item.item_name,
  }));

  const displayData = data.slice(0, 5);

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="shrink-0 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <YAxis
            type="category"
            dataKey="shortName"
            tick={{ fontSize: 11 }}
            width={150}
            className="fill-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 12,
            }}
            formatter={(value: number | undefined, name: string | undefined) => [
              value != null ? value.toLocaleString() : "0",
              name === "total_quantity" ? "Quantity" : "Points",
            ]}
          />
          <Bar dataKey="total_quantity" name="Quantity" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Item</th>
              <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Code</th>
              <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Category</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Qty</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Points</th>
              <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Requests</th>
              {detailItems && detailItems.length > 0 && (
                <th className="text-center py-2 px-2 font-semibold text-muted-foreground">Export</th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, i) => {
              const detail = detailItems?.find((d) => d.id === item.product_id);
              const isFetching = fetchingId === item.product_id;
              return (
                <tr key={item.product_id} className="border-b border-border/50">
                  <td className="py-1.5 px-2 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="truncate max-w-[160px]">{item.item_name}</span>
                  </td>
                  <td className="py-1.5 px-2 text-muted-foreground">{item.item_code}</td>
                  <td className="py-1.5 px-2 text-muted-foreground">{item.legend}</td>
                  <td className="py-1.5 px-2 text-right font-medium">{item.total_quantity}</td>
                  <td className="py-1.5 px-2 text-right font-medium">{item.total_points.toLocaleString()}</td>
                  <td className="py-1.5 px-2 text-right font-medium">{item.request_count}</td>
                  {detail && (
                    <td className="py-1.5 px-2">
                      <div className="flex items-center justify-center gap-0.5">
                        {isFetching ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                        ) : (
                          <>
                            <button
                              onClick={() => handleExport(detail, "excel")}
                              title={`Export ${item.item_name} as Excel`}
                              className="p-1 rounded hover:bg-accent transition-colors"
                            >
                              <FileSpreadsheet className="h-3.5 w-3.5 text-green-500" />
                            </button>
                            <button
                              onClick={() => handleExport(detail, "pdf")}
                              title={`Export ${item.item_name} as PDF`}
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
            View All {data.length} Items
          </button>
        </div>
      )}

      {/* ── View All Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-background/80">
          <div className="bg-card w-full max-w-5xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">All Redeemed Items</h2>
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
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Item</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Code</th>
                    <th className="text-left py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Category</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Qty</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Points</th>
                    <th className="text-right py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Requests</th>
                    {detailItems && detailItems.length > 0 && (
                      <th className="text-center py-3 px-3 font-semibold text-muted-foreground whitespace-nowrap">Export Details</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, i) => {
                    const detail = detailItems?.find((d) => d.id === item.product_id);
                    const isFetching = fetchingId === item.product_id;
                    return (
                      <tr key={item.product_id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-2.5 px-3 flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="font-medium text-foreground">{item.item_name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">{item.item_code}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-accent text-[11px] font-medium">
                            {item.legend}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">{item.total_quantity}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{item.total_points.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{item.request_count}</td>
                        {detail && (
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1">
                              {isFetching ? (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleExport(detail, "excel")}
                                    title={`Export ${item.item_name} as Excel`}
                                    className="p-1.5 rounded-md border border-border hover:bg-background transition-colors"
                                  >
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                                  </button>
                                  <button
                                    onClick={() => handleExport(detail, "pdf")}
                                    title={`Export ${item.item_name} as PDF`}
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
