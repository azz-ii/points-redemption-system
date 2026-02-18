import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  RotateCcw,
  X,
  AlertCircle,
  RefreshCw,
  FileDown,
  BarChart3,
} from "lucide-react";
import {
  dashboardApi,
  type RedemptionRequest as APIRedemptionRequest,
} from "@/lib/distributors-api";
import { redemptionRequestsApi } from "@/lib/api";
import { RedemptionTable } from "../Redemption/components";
import {
  ViewRedemptionModal,
  EditRedemptionModal,
  MarkAsProcessedModal,
  CancelRequestModal,
  type RedemptionItem,
} from "../Redemption/modals";
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
} from "./components";

function Dashboard() {
  const navigate = useNavigate();

  // ── Existing state ──
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [pointAmount, setPointAmount] = useState("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [password, setPassword] = useState("");
  const [isResettingPoints, setIsResettingPoints] = useState(false);

  // Redemption requests (pending table)
  const [requests, setRequests] = useState<APIRedemptionRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<RedemptionItem | null>(null);
  const [editRequest, setEditRequest] = useState<RedemptionItem | null>(null);
  const [processRequest, setProcessRequest] = useState<RedemptionItem | null>(null);
  const [cancelRequest, setCancelRequest] = useState<RedemptionItem | null>(null);

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

  // ── Fetch pending requests (same as before) ──
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        const response = await dashboardApi.getRedemptionRequests(100, 0);
        const filteredRequests = (response.results as APIRedemptionRequest[]).filter(
          (req) => req.status === "APPROVED" && req.processing_status === "NOT_PROCESSED",
        );
        setRequests(filteredRequests);
      } catch (error) {
        console.error("[Dashboard] Error fetching requests:", error);
        toast.error("Failed to load redemption requests");
      } finally {
        setRequestsLoading(false);
      }
    };
    fetchRequests();
  }, []);

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

  // ── Modal handlers (unchanged) ──
  const handleViewRequest = (item: RedemptionItem) => setSelectedRequest(item);
  const handleEditRequest = (item: RedemptionItem) => setEditRequest(item);
  const handleMarkAsProcessed = (item: RedemptionItem) => setProcessRequest(item);
  const handleCancelRequest = (item: RedemptionItem) => setCancelRequest(item);

  const refetchRequests = async () => {
    const response = await dashboardApi.getRedemptionRequests(100, 0);
    const filtered = (response.results as APIRedemptionRequest[]).filter(
      (req) => req.status === "APPROVED" && req.processing_status === "NOT_PROCESSED",
    );
    setRequests(filtered);
  };

  const confirmMarkAsProcessed = async (remarks?: string) => {
    if (!processRequest) return;
    try {
      setProcessRequest(null);
      await redemptionRequestsApi.markAsProcessed(processRequest.id, remarks);
      toast.success("Request marked as processed successfully");
      await refetchRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark request as processed");
    }
  };

  const confirmCancelRequest = async (reason: string, remarks: string) => {
    if (!cancelRequest) return;
    try {
      setCancelRequest(null);
      await redemptionRequestsApi.cancelRequest(cancelRequest.id, reason, remarks);
      toast.success("Request cancelled successfully");
      await refetchRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel request");
    }
  };

  const handleRefreshRequests = async () => {
    try {
      setIsRefreshing(true);
      await refetchRequests();
      toast.success("Requests refreshed successfully");
    } catch (error) {
      console.error("[Dashboard] Error refreshing:", error);
      toast.error("Failed to refresh requests");
    } finally {
      setIsRefreshing(false);
    }
  };

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

  // Convert API response to RedemptionItem for table
  const tableRequests = requests.map(
    (req) =>
      ({
        id: req.id,
        requested_by: req.requested_by,
        requested_by_name: req.requested_by_name,
        requested_for: req.requested_for,
        requested_for_name: req.requested_for_name,
        status: req.status,
        processing_status: req.processing_status,
        total_points: req.total_points,
        date_requested: req.date_requested,
        reviewed_by: req.reviewed_by,
        reviewed_by_name: req.reviewed_by_name,
        date_reviewed: req.date_reviewed,
        processed_by: req.processed_by,
        processed_by_name: req.processed_by_name,
        date_processed: req.date_processed,
        cancelled_by: req.cancelled_by,
        cancelled_by_name: req.cancelled_by_name,
        date_cancelled: req.date_cancelled,
        remarks: req.remarks,
        rejection_reason: req.rejection_reason,
        items: req.items,
      }) as RedemptionItem,
  );

  // ── Chart card wrapper ──
  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-lg border bg-card border-border p-5">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
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
        {/* Time Series — full width */}
        <div className="lg:col-span-2">
          <ChartCard title="Request Trends">
            <TimeSeriesChart data={timeSeries} loading={timeSeriesLoading} />
          </ChartCard>
        </div>

        {/* Item Popularity */}
        <ChartCard title="Top Redeemed Items">
          <ItemPopularityChart data={items} loading={itemsLoading} />
        </ChartCard>

        {/* Agent Performance */}
        <ChartCard title="Agent Performance">
          <AgentPerformanceChart data={agents} loading={agentsLoading} />
        </ChartCard>

        {/* Team Performance */}
        <ChartCard title="Team Performance">
          <TeamPerformanceChart data={teams} loading={teamsLoading} />
        </ChartCard>

        {/* Turnaround Time */}
        <ChartCard title="Turnaround Time">
          <TurnaroundChart data={turnaround} loading={turnaroundLoading} />
        </ChartCard>

        {/* Entity Analytics — full width */}
        <div className="lg:col-span-2">
          <ChartCard title="Distributor & Customer Analytics">
            <EntityAnalyticsChart
              distributors={distributors}
              customers={customers}
              loading={entitiesLoading}
            />
          </ChartCard>
        </div>
      </div>

      {/* ── Pending Requests Section ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Pending Redemption Requests</h3>
          <button
            onClick={handleRefreshRequests}
            disabled={isRefreshing}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
              isRefreshing
                ? "opacity-50 cursor-not-allowed"
                : "bg-card border-border text-foreground hover:bg-accent"
            }`}
            title="Refresh requests"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {requestsLoading ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Loading requests...</p></div>
          ) : tableRequests.length === 0 ? (
            <div className="text-center py-8"><p className="text-muted-foreground">No pending requests</p></div>
          ) : (
            <div className="space-y-3">
              {tableRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="p-4 rounded-lg border bg-card border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm">#{request.id}</p>
                      <p className="text-xs text-muted-foreground">{request.requested_by_name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      request.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : request.status === "APPROVED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm mb-1">For: {request.requested_for_name}</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {request.total_points} points · {new Date(request.date_requested).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="w-full py-2 rounded bg-primary text-white hover:bg-primary/90 text-sm font-semibold transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
              {tableRequests.length > 5 && (
                <button
                  onClick={() => navigate("/admin/redemption")}
                  className="w-full py-2.5 rounded border text-sm font-semibold transition-colors"
                >
                  View All ({tableRequests.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <RedemptionTable
            redemptions={tableRequests}
            loading={requestsLoading}
            onView={handleViewRequest}
            onEdit={handleEditRequest}
            onMarkAsProcessed={handleMarkAsProcessed}
            onCancelRequest={handleCancelRequest}
          />
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

      {/* ── Redemption Modals ── */}
      {selectedRequest && (
        <ViewRedemptionModal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} item={selectedRequest} />
      )}
      {editRequest && (
        <EditRedemptionModal
          isOpen={!!editRequest}
          onClose={() => setEditRequest(null)}
          item={editRequest}
          onSave={() => { setEditRequest(null); refetchRequests(); }}
        />
      )}
      {processRequest && (
        <MarkAsProcessedModal isOpen={!!processRequest} onClose={() => setProcessRequest(null)} item={processRequest} onConfirm={confirmMarkAsProcessed} />
      )}
      {cancelRequest && (
        <CancelRequestModal isOpen={!!cancelRequest} onClose={() => setCancelRequest(null)} item={cancelRequest} onConfirm={confirmCancelRequest} />
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
