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
import type { EntityAnalytics } from "../utils/analyticsApi";

interface EntityAnalyticsChartProps {
  distributors: EntityAnalytics[];
  customers: EntityAnalytics[];
  loading: boolean;
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

export function EntityAnalyticsChart({
  distributors,
  customers,
  loading,
}: EntityAnalyticsChartProps) {
  const [tab, setTab] = useState<"distributor" | "customer">("distributor");
  const data = tab === "distributor" ? distributors : customers;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="flex gap-1">
          <div className="h-7 w-24 rounded-md bg-muted" />
          <div className="h-7 w-20 rounded-md bg-muted" />
        </div>
        <div className="space-y-2.5 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-28 rounded bg-muted flex-shrink-0" />
              <div className="h-6 rounded bg-muted" style={{ width: `${75 - i * 12}%` }} />
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

  return (
    <div className="space-y-4">
      {/* Tab toggle */}
      <div className="inline-flex items-center rounded-lg border border-border bg-muted p-1 gap-0.5">
        <button
          onClick={() => setTab("distributor")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            tab === "distributor"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Distributors
        </button>
        <button
          onClick={() => setTab("customer")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            tab === "customer"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Customers
        </button>
      </div>

      {!data.length ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No {tab} data available for this period
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={Math.max(220, data.length * 35)}>
            <BarChart
              data={data.map((e) => ({
                ...e,
                shortName:
                  e.entity_name.length > 25
                    ? e.entity_name.slice(0, 25) + "…"
                    : e.entity_name,
              }))}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis
                type="category"
                dataKey="shortName"
                tick={{ fontSize: 11 }}
                width={160}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                formatter={(value: number | undefined) => [value != null ? value.toLocaleString() : "0", "Points"]}
              />
              <Bar dataKey="total_points" name="Points" radius={[0, 4, 4, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Detail table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Name</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Requests</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Points</th>
                  <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Processed</th>
                </tr>
              </thead>
              <tbody>
                {data.map((e, i) => (
                  <tr key={e.entity_id} className="border-b border-border/50">
                    <td className="py-1.5 px-2 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <span className="truncate max-w-[200px]">{e.entity_name}</span>
                    </td>
                    <td className="py-1.5 px-2 text-right">{e.request_count}</td>
                    <td className="py-1.5 px-2 text-right font-medium">{e.total_points.toLocaleString()}</td>
                    <td className="py-1.5 px-2 text-right">{e.processed_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
