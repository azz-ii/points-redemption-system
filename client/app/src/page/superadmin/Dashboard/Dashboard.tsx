import { useState, cloneElement, isValidElement } from "react";
import type { ReactElement } from "react";
import { Input } from "@/components/ui/input";
import {
  RotateCcw,
  X,
  AlertCircle,
  FileDown,
  BarChart3,
  Maximize2
} from "lucide-react";
import { dashboardApi } from "@/lib/distributors-api";
import { toast } from "sonner";
import {
  analyticsApi,
  type DateRange,
} from "./utils/analyticsApi";
import { useSuperadminDashboard } from "@/hooks/queries/useSuperadminDashboard";
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
  const [activeTab, setActiveTab] = useState<"trends" | "performance" | "items">("trends");

  const {
    overview,
    timeSeries,
    items,
    agents,
    teams,
    turnaround,
    distributors,
    customers,
    invalidateAll,
  } = useSuperadminDashboard(dateRange);

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
        invalidateAll();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset points.");
    } finally {
      setIsResettingPoints(false);
    }
  };

  // ── Chart card wrapper ──
  const ChartCard = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Pass the isExpanded prop to the child component if it accepts props
    const expandedChild = isValidElement(children) 
      ? cloneElement(children as ReactElement<{ isExpanded?: boolean }>, { isExpanded: true })
      : children;

    return (
      <>
        <div className="rounded-lg flex flex-col h-[calc(100vh-21rem)] min-h-[300px] border bg-card border-border p-5">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {action}
              <button
                onClick={() => setIsExpanded(true)}
                className="p-1.5 rounded-md border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="View Full Screen"
                type="button"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </div>

        {/* Full Screen Modal Wrapper */}
        {isExpanded && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-background/90"
            onClick={() => setIsExpanded(false)}
          >
            <div 
              className="bg-card w-full max-w-6xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">{title}</h2>
                <div className="flex items-center gap-2">
                  {action}
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                {expandedChild}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 h-[calc(100vh-4rem)] flex flex-col space-y-6">
      {/* ── Header row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of system activity and analytics.
          </p>
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
      <div className="shrink-0">
        <OverviewCards data={overview.data ?? null} loading={overview.isLoading} />
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center space-x-1 border-b border-border shrink-0">
        <button
          onClick={() => setActiveTab("trends")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === "trends"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Activity Trends
        </button>
        <button
          onClick={() => setActiveTab("performance")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === "performance"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Personnel Performance
        </button>
        <button
          onClick={() => setActiveTab("items")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
            activeTab === "items"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          Item Highlights
        </button>
      </div>

      {/* ── Charts Grid ── */}
      <div className="flex-1 w-full min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* TAB 1: Activity Trends */}
          {activeTab === "trends" && (
            <>
              {/* Time Series */}
              <ChartCard
                title="Request Trends"
                action={
                  <ChartExportButton
                    filename="request-trends"
                    disabled={timeSeries.isLoading}
                    data={(timeSeries.data ?? []).map((e) => ({
                      Date: e.date,
                      Requests: e.request_count,
                      "Points Redeemed": e.points_redeemed,
                      Approved: e.approved_count,
                      Rejected: e.rejected_count,
                    }))}
                  />
                }
              >
                <TimeSeriesChart data={timeSeries.data ?? []} loading={timeSeries.isLoading} />
              </ChartCard>

              {/* Entity Analytics */}
              <ChartCard
                title="Distributor & Customer Analytics"
                action={
                  <ChartExportButton
                    filename="entity-analytics"
                    disabled={distributors.isLoading || customers.isLoading}
                    data={[...(distributors.data ?? []), ...(customers.data ?? [])].map((e) => ({
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
                  distributors={distributors.data ?? []}
                  customers={customers.data ?? []}
                  loading={distributors.isLoading || customers.isLoading}
                />
              </ChartCard>
            </>
          )}

          {/* TAB 2: Performance */}
          {activeTab === "performance" && (
            <>
              {/* Agent Performance */}
              <ChartCard
                title="Agent Performance"
                action={
                  <ChartExportButton
                    filename="agent-performance"
                    disabled={agents.isLoading}
                    data={(agents.data ?? []).map((e) => ({
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
                  data={agents.data ?? []}
                  loading={agents.isLoading}
                  detailItems={(agents.data ?? []).map((agent) => ({
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
                    disabled={teams.isLoading}
                    data={(teams.data ?? []).map((e) => ({
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
                <TeamPerformanceChart data={teams.data ?? []} loading={teams.isLoading} />
              </ChartCard>
            </>
          )}

          {/* TAB 3: Item Highlights */}
          {activeTab === "items" && (
            <>
              {/* Turnaround Time */}
              <ChartCard
                title="Turnaround Time"
                action={
                  <ChartExportButton
                    filename="turnaround-time"
                    disabled={turnaround.isLoading}
                    data={turnaround.data?.trend.map((e) => ({
                      Month: e.month,
                      "Avg Hours": e.avg_total_hours ?? "N/A",
                      Count: e.count,
                    })) ?? []}
                  />
                }
              >
                <TurnaroundChart data={turnaround.data ?? null} loading={turnaround.isLoading} />
              </ChartCard>

              {/* Item Popularity */}
              <ChartCard
                title="Top Redeemed Items"
                action={
                  <ChartExportButton
                    filename="item-popularity"
                    disabled={items.isLoading}
                    data={(items.data ?? []).map((e) => ({
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
                  data={items.data ?? []}
                  loading={items.isLoading}
                  detailItems={(items.data ?? []).map((item) => ({
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
            </>
          )}
        </div>
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
          overview: overview.data ?? null,
          timeSeries: timeSeries.data ?? [],
          items: items.data ?? [],
          agents: agents.data ?? [],
          teams: teams.data ?? [],
          turnaround: turnaround.data ?? null,
          distributors: distributors.data ?? [],
          customers: customers.data ?? [],
        }}
      />
    </div>
  );
}

export default Dashboard;
