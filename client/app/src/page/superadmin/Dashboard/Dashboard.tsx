import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  RotateCcw,
  X,
  AlertCircle,
  FileDown,
  BarChart3,
} from "lucide-react";
import { dashboardApi } from "@/lib/distributors-api";
import { toast } from "sonner";
import {
  analyticsApi,
  type DateRange,
  type AnalyticsOverview,
  type TimeSeriesEntry,
  type ItemPopularity,
  type AgentPerformance,
  type TeamPerformance,
  type TurnaroundData,
  type EntityAnalytics,
} from "./utils/analyticsApi";
import {
  DateRangeSelector,
  OverviewCards,
  TimeSeriesChart,
  ItemPopularityChart,
  AgentPerformanceChart,
  TeamPerformanceChart,
  TurnaroundChart,
  EntityAnalyticsChart,
  ExportAnalyticsModal,
  ChartExportButton,
} from "./components";

function Dashboard() {
  // ── Existing state ──
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [pointAmount, setPointAmount] = useState("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [password, setPassword] = useState("");
  const [isResettingPoints, setIsResettingPoints] = useState(false);

  // ── Analytics state ──
  const [dateRange, setDateRange] = useState<DateRange>("30");
  const [showExportModal, setShowExportModal] = useState(false);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [timeSeries, setTimeSeries] = useState<TimeSeriesEntry[]>([]);
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(true);

  const [items, setItems] = useState<ItemPopularity[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);

  const [teams, setTeams] = useState<TeamPerformance[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const [turnaround, setTurnaround] = useState<TurnaroundData | null>(null);
  const [turnaroundLoading, setTurnaroundLoading] = useState(true);

  const [distributors, setDistributors] = useState<EntityAnalytics[]>([]);
  const [customers, setCustomers] = useState<EntityAnalytics[]>([]);
  const [entitiesLoading, setEntitiesLoading] = useState(true);

  // ── Fetch analytics data when range changes ──
  const fetchAnalytics = useCallback(async (range: DateRange) => {
    console.debug(`[Dashboard] Fetching analytics for range=${range}`);

    // Overview
    setOverviewLoading(true);
    analyticsApi.getOverview(range).then((d) => { setOverview(d); setOverviewLoading(false); }).catch((e) => { console.error("[Dashboard] overview err:", e); setOverviewLoading(false); });

    // Time-series
    setTimeSeriesLoading(true);
    analyticsApi.getTimeSeries(range).then((d) => { setTimeSeries(d); setTimeSeriesLoading(false); }).catch((e) => { console.error("[Dashboard] timeseries err:", e); setTimeSeriesLoading(false); });

    // Items
    setItemsLoading(true);
    analyticsApi.getItems(range).then((d) => { setItems(d); setItemsLoading(false); }).catch((e) => { console.error("[Dashboard] items err:", e); setItemsLoading(false); });

    // Agents
    setAgentsLoading(true);
    analyticsApi.getAgents(range).then((d) => { setAgents(d); setAgentsLoading(false); }).catch((e) => { console.error("[Dashboard] agents err:", e); setAgentsLoading(false); });

    // Teams
    setTeamsLoading(true);
    analyticsApi.getTeams(range).then((d) => { setTeams(d); setTeamsLoading(false); }).catch((e) => { console.error("[Dashboard] teams err:", e); setTeamsLoading(false); });

    // Turnaround
    setTurnaroundLoading(true);
    analyticsApi.getTurnaround(range).then((d) => { setTurnaround(d); setTurnaroundLoading(false); }).catch((e) => { console.error("[Dashboard] turnaround err:", e); setTurnaroundLoading(false); });

    // Entities
    setEntitiesLoading(true);
    Promise.all([
      analyticsApi.getEntities("distributor", range),
      analyticsApi.getEntities("customer", range),
    ]).then(([dist, cust]) => { setDistributors(dist); setCustomers(cust); setEntitiesLoading(false); }).catch((e) => { console.error("[Dashboard] entities err:", e); setEntitiesLoading(false); });
  }, []);

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange, fetchAnalytics]);

  const handleResetAllPointsConfirm = async () => {
    if (!password) { toast.error("Please enter your password"); return; }
    try {
      setIsResettingPoints(true);
      const result = await dashboardApi.resetAllPoints(password);
      if (result.success) {
        toast.success("All points have been reset to zero successfully");
        setIsResetModalOpen(false);
        setShowPasswordStep(false);
        setPassword("");
        setSelectedClient("");
        setPointAmount("");
        fetchAnalytics(dateRange);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset points.");
    } finally {
      setIsResettingPoints(false);
    }
  };

  // ── Chart card wrapper ──
  const ChartCard = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
    <div className="rounded-lg border bg-card border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
      {/* ── Header row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors bg-card border-border text-foreground hover:bg-accent"
          >
            <FileDown className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* ── Overview Cards ── */}
      <OverviewCards data={overview} loading={overviewLoading} />

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series */}
        <ChartCard
          title="Request Trends"
          action={
            <ChartExportButton
              filename="request-trends"
              disabled={timeSeriesLoading}
              data={timeSeries.map((e) => ({
                Date: e.date,
                Requests: e.request_count,
                "Points Redeemed": e.points_redeemed,
                Approved: e.approved_count,
                Rejected: e.rejected_count,
              }))}
            />
          }
        >
          <TimeSeriesChart data={timeSeries} loading={timeSeriesLoading} />
        </ChartCard>

        {/* Turnaround Time */}
        <ChartCard
          title="Turnaround Time"
          action={
            <ChartExportButton
              filename="turnaround-time"
              disabled={turnaroundLoading}
              data={turnaround?.trend.map((e) => ({
                Month: e.month,
                "Avg Hours": e.avg_total_hours ?? "N/A",
                Count: e.count,
              })) ?? []}
            />
          }
        >
          <TurnaroundChart data={turnaround} loading={turnaroundLoading} />
        </ChartCard>

        {/* Item Popularity */}
        <ChartCard
          title="Top Redeemed Items"
          action={
            <ChartExportButton
              filename="item-popularity"
              disabled={itemsLoading}
              data={items.map((e) => ({
                Item: e.item_name,
                Code: e.item_code,
                Category: e.legend,
                Quantity: e.total_quantity,
                Points: e.total_points,
                Requests: e.request_count,
              }))}
            />
          }
        >
          <ItemPopularityChart
            data={items}
            loading={itemsLoading}
            detailItems={items.map((item) => ({
              id: item.product_id,
              label: item.item_name,
              fetcher: async () => {
                const rows = await analyticsApi.getItemRequests(item.product_id, dateRange);
                return rows.map((r) => ({
                  "Request ID": r.request_id,
                  "Date Requested": r.date_requested,
                  "Item": r.item_name,
                  "Item Code": r.item_code,
                  "Quantity": r.quantity,
                  "Points": r.points,
                  "Agent": r.agent,
                  "Team": r.team || "-",
                  "Requested For": r.requested_for,
                  "Type": r.requested_for_type,
                  "Status": r.status,
                  "Processing": r.processing_status,
                  "Reviewed By": r.reviewed_by || "-",
                  "Date Reviewed": r.date_reviewed || "-",
                  "Processed By": r.processed_by || "-",
                  "Date Processed": r.date_processed || "-",
                  "Remarks": r.remarks,
                }));
              },
            }))}
          />
        </ChartCard>

        {/* Agent Performance */}
        <ChartCard
          title="Agent Performance"
          action={
            <ChartExportButton
              filename="agent-performance"
              disabled={agentsLoading}
              data={agents.map((e) => ({
                Agent: e.agent_name,
                Team: e.team_name || "-",
                "Total Requests": e.total_requests,
                Approved: e.approved_count,
                Rejected: e.rejected_count,
                "Approval Rate %": e.approval_rate,
                Points: e.total_points,
              }))}
            />
          }
        >
          <AgentPerformanceChart
            data={agents}
            loading={agentsLoading}
            detailItems={agents.map((agent) => ({
              id: agent.agent_id,
              label: agent.agent_name,
              fetcher: async () => {
                const rows = await analyticsApi.getAgentRequests(agent.agent_id, dateRange);
                return rows.map((r) => ({
                  "Request ID": r.request_id,
                  "Date Requested": r.date_requested,
                  "Requested For": r.requested_for,
                  "Type": r.requested_for_type,
                  "Items": r.items,
                  "Total Points": r.total_points,
                  "Status": r.status,
                  "Processing": r.processing_status,
                  "Reviewed By": r.reviewed_by || "-",
                  "Date Reviewed": r.date_reviewed || "-",
                  "Processed By": r.processed_by || "-",
                  "Date Processed": r.date_processed || "-",
                  "Remarks": r.remarks,
                  "Rejection Reason": r.rejection_reason,
                }));
              },
            }))}
          />
        </ChartCard>

        {/* Team Performance */}
        <ChartCard
          title="Team Performance"
          action={
            <ChartExportButton
              filename="team-performance"
              disabled={teamsLoading}
              data={teams.map((e) => ({
                Team: e.team_name,
                "Total Requests": e.total_requests,
                Approved: e.approved_count,
                Rejected: e.rejected_count,
                "Approval Rate %": e.approval_rate,
                Points: e.total_points,
              }))}
            />
          }
        >
          <TeamPerformanceChart data={teams} loading={teamsLoading} />
        </ChartCard>

        {/* Entity Analytics */}
        <ChartCard
          title="Distributor & Customer Analytics"
          action={
            <ChartExportButton
              filename="entity-analytics"
              disabled={entitiesLoading}
              data={[...distributors, ...customers].map((e) => ({
                Name: e.entity_name,
                Type: e.entity_type,
                Requests: e.request_count,
                Points: e.total_points,
                Processed: e.processed_count,
              }))}
            />
          }
        >
          <EntityAnalyticsChart
            distributors={distributors}
            customers={customers}
            loading={entitiesLoading}
          />
        </ChartCard>
      </div>

      {/* ── Reset Points Modal ── */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { if (!showPasswordStep) setIsResetModalOpen(false); }}
          />
          <div className="relative w-full max-w-md rounded-xl border shadow-2xl p-6 space-y-4 bg-card border-border text-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Reset Points</h2>
              </div>
              <button
                onClick={() => {
                  if (!showPasswordStep) { setIsResetModalOpen(false); } else { setShowPasswordStep(false); setPassword(""); }
                }}
                className="p-2 rounded-lg hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!showPasswordStep ? (
              <>
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Select Client</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm transition-colors bg-card border-border text-foreground focus:border-muted-foreground focus:ring-0"
                  >
                    <option value="">Choose a client</option>
                  </select>
                  <label className="block text-sm font-medium">Points to reset</label>
                  <Input
                    type="number"
                    min="0"
                    value={pointAmount}
                    onChange={(e) => setPointAmount(e.target.value)}
                    placeholder="Enter points"
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-colors bg-card border-border text-foreground hover:bg-accent"
                    onClick={() => setShowPasswordStep(true)}
                  >
                    Reset All Points
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors bg-primary text-white hover:bg-primary/90"
                    onClick={() => setIsResetModalOpen(false)}
                  >
                    Apply
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-lg flex items-start gap-3 bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-destructive" />
                  <p className="text-sm">
                    This will reset <strong>all points to zero</strong> for both agents and distributors. This action cannot be undone.
                    Please enter your password to confirm.
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium">Enter Your Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isResettingPoints}
                    className="w-full rounded-lg border px-3 py-2 text-sm transition-colors bg-card border-border text-foreground placeholder-muted-foreground focus:border-muted-foreground focus:ring-0"
                    onKeyPress={(e) => e.key === "Enter" && handleResetAllPointsConfirm()}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-colors bg-card border-border text-foreground hover:bg-accent disabled:opacity-50"
                    onClick={() => { setShowPasswordStep(false); setPassword(""); }}
                    disabled={isResettingPoints}
                  >
                    Back
                  </button>
                  <button
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      !password || isResettingPoints ? "opacity-50 cursor-not-allowed" : ""
                    } bg-destructive text-white hover:bg-destructive/90`}
                    onClick={handleResetAllPointsConfirm}
                    disabled={!password || isResettingPoints}
                  >
                    {isResettingPoints ? "Resetting..." : "Confirm Reset"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Export Analytics Modal ── */}
      <ExportAnalyticsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={{
          overview,
          timeSeries,
          items,
          agents,
          teams,
          turnaround,
          distributors,
          customers,
        }}
      />
    </div>
  );
}

export default Dashboard;
