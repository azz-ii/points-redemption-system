import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Clock } from "lucide-react";
import type { TurnaroundData } from "../utils/analyticsApi";

interface TurnaroundChartProps {
  data: TurnaroundData | null;
  loading: boolean;
}

function fmtMonth(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  } catch {
    return iso;
  }
}

function fmtHours(h: number | null): string {
  if (h == null) return "N/A";
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d ${Math.round(h % 24)}h`;
}

export function TurnaroundChart({ data, loading }: TurnaroundChartProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border border-border space-y-2">
              <div className="h-3 w-20 mx-auto rounded bg-muted" />
              <div className="h-6 w-12 mx-auto rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-[250px] rounded-lg bg-muted flex items-end gap-1 p-4 pt-8">
          {[40, 55, 35, 70, 50, 65, 45, 60].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-muted-foreground/10"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No turnaround data available
      </div>
    );
  }

  const { overall, trend } = data;

  return (
    <div className="space-y-4">
      {/* Overall KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Request → Review", value: overall.avg_request_to_review_hours, color: "text-blue-500" },
          { label: "Review → Process", value: overall.avg_review_to_process_hours, color: "text-green-500" },
          { label: "Total End-to-End", value: overall.avg_total_hours, color: "text-purple-500" },
        ].map((kpi) => (
          <div key={kpi.label} className="p-3 rounded-lg border bg-card border-border text-center">
            <div className={`flex items-center justify-center gap-1 mb-1 ${kpi.color}`}>
              <Clock className="h-3 w-3" />
              <span className="text-xs font-medium">{kpi.label}</span>
            </div>
            <p className="text-lg font-bold">{fmtHours(kpi.value)}</p>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      {trend.length > 0 && (
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart
            data={trend.map((t) => ({ ...t, month_label: fmtMonth(t.month) }))}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month_label" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" label={{ value: "Hours", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value: number | undefined) => [fmtHours(value ?? null), "Avg Duration"]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="count" name="Requests" fill="hsl(221, 83%, 53%)" opacity={0.3} radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="avg_total_hours"
              name="Avg Hours"
              stroke="hsl(262, 83%, 58%)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
