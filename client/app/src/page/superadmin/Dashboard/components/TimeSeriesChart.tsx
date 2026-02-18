import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { TimeSeriesEntry } from "../utils/analyticsApi";

interface TimeSeriesChartProps {
  data: TimeSeriesEntry[];
  loading: boolean;
}

function fmtLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export function TimeSeriesChart({ data, loading }: TimeSeriesChartProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-[300px] rounded-lg bg-muted flex items-end gap-1 p-4 pt-8">
          {[65, 45, 70, 50, 80, 55, 75, 40, 60, 85, 50, 70].map((h, i) => (
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

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No trend data available for this period
      </div>
    );
  }

  const chartData = data.map((e) => ({
    ...e,
    label: fmtLabel(e.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="gradRequests" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
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
        <Area
          type="monotone"
          dataKey="request_count"
          name="Requests"
          stroke="hsl(221, 83%, 53%)"
          fill="url(#gradRequests)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="approved_count"
          name="Approved"
          stroke="hsl(142, 71%, 45%)"
          fill="url(#gradApproved)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="rejected_count"
          name="Rejected"
          stroke="hsl(0, 72%, 51%)"
          fill="url(#gradRejected)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
