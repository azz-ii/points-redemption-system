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
import type { AgentPerformance } from "../utils/analyticsApi";

interface AgentPerformanceChartProps {
  data: AgentPerformance[];
  loading: boolean;
}

export function AgentPerformanceChart({ data, loading }: AgentPerformanceChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading agent data...
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
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
