import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  RotateCcw,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  dashboardApi,
  type DashboardStats,
  type RedemptionRequest as APIRedemptionRequest,
} from "@/lib/distributors-api";
import { redemptionRequestsApi } from "@/lib/api";
import { RedemptionTable } from "./Redemption/components";
import {
  ViewRedemptionModal,
  EditRedemptionModal,
  MarkAsProcessedModal,
  CancelRequestModal,
  type RedemptionItem,
} from "./Redemption/modals";
import { toast } from "sonner";

function Dashboard() {
  const navigate = useNavigate();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [pointAmount, setPointAmount] = useState<string>("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [isResettingPoints, setIsResettingPoints] = useState(false);

  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Redemption requests
  const [requests, setRequests] = useState<APIRedemptionRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<RedemptionItem | null>(
    null,
  );
  const [editRequest, setEditRequest] = useState<RedemptionItem | null>(null);
  const [processRequest, setProcessRequest] = useState<RedemptionItem | null>(
    null,
  );
  const [cancelRequest, setCancelRequest] = useState<RedemptionItem | null>(
    null,
  );

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch redemption requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        const response = await dashboardApi.getRedemptionRequests(100, 0);
        // Filter to show only approved and not processed requests
        const filteredRequests = (
          response.results as APIRedemptionRequest[]
        ).filter(
          (req) =>
            req.status === "APPROVED" &&
            req.processing_status === "NOT_PROCESSED",
        );
        setRequests(filteredRequests);
        setTotalCount(filteredRequests.length);
      } catch (error) {
        console.error("Error fetching redemption requests:", error);
        toast.error("Failed to load redemption requests");
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Modal handlers
  const handleViewRequest = (item: RedemptionItem) => {
    setSelectedRequest(item);
  };

  const handleEditRequest = (item: RedemptionItem) => {
    setEditRequest(item);
  };

  const handleMarkAsProcessed = (item: RedemptionItem) => {
    setProcessRequest(item);
  };

  const handleCancelRequest = (item: RedemptionItem) => {
    setCancelRequest(item);
  };

  const confirmMarkAsProcessed = async (remarks?: string) => {
    if (!processRequest) return;

    try {
      setProcessRequest(null);
      await redemptionRequestsApi.markAsProcessed(processRequest.id, remarks);
      toast.success("Request marked as processed successfully");
      // Refetch requests
      const response = await dashboardApi.getRedemptionRequests(100, 0);
      const filteredRequests = (
        response.results as APIRedemptionRequest[]
      ).filter(
        (req) =>
          req.status === "APPROVED" &&
          req.processing_status === "NOT_PROCESSED",
      );
      setRequests(filteredRequests);
      setTotalCount(filteredRequests.length);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark request as processed",
      );
    }
  };

  const confirmCancelRequest = async (reason: string, remarks: string) => {
    if (!cancelRequest) return;

    try {
      setCancelRequest(null);
      await redemptionRequestsApi.cancelRequest(
        cancelRequest.id,
        reason,
        remarks,
      );
      toast.success("Request cancelled successfully");
      // Refetch requests
      const response = await dashboardApi.getRedemptionRequests(100, 0);
      const filteredRequests = (
        response.results as APIRedemptionRequest[]
      ).filter(
        (req) =>
          req.status === "APPROVED" &&
          req.processing_status === "NOT_PROCESSED",
      );
      setRequests(filteredRequests);
      setTotalCount(filteredRequests.length);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel request",
      );
    }
  };

  const handleRefreshRequests = async () => {
    try {
      setIsRefreshing(true);
      const response = await dashboardApi.getRedemptionRequests(100, 0);
      const filteredRequests = (
        response.results as APIRedemptionRequest[]
      ).filter(
        (req) =>
          req.status === "APPROVED" &&
          req.processing_status === "NOT_PROCESSED",
      );
      setRequests(filteredRequests);
      setTotalCount(filteredRequests.length);
      toast.success("Requests refreshed successfully");
    } catch (error) {
      console.error("Error refreshing requests:", error);
      toast.error("Failed to refresh requests");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetAllPointsConfirm = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

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

        // Refresh dashboard stats
        const stats = await dashboardApi.getStats();
        setStats(stats);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to reset points. Please check your password.",
      );
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mobile Layout */}
        <div className="md:hidden pb-20">
          <div className="p-4">
            {/* Stats Cards */}
            <div className="space-y-3 mb-6">
              <div className="p-4 rounded-lg border bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <p className="text-sm font-semibold">Pending Requests</p>
                </div>
                <p className="text-3xl font-bold">
                  {requestsLoading ? "-" : totalCount}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <p className="text-sm font-semibold">Approved Requests</p>
                </div>
                <p className="text-3xl font-bold">
                  {statsLoading ? "-" : stats?.approved_count || 0}
                </p>
              </div>

              <div className="p-4 rounded-lg border bg-card border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <p className="text-sm font-semibold">On-board</p>
                </div>
                <p className="text-3xl font-bold">
                  {statsLoading ? "-" : stats?.on_board_count || 0}
                </p>
              </div>
            </div>

            {/* Pending Requests Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pending Requests</h3>
                <button
                  onClick={handleRefreshRequests}
                  disabled={isRefreshing}
                  className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {requestsLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading requests...</p>
                </div>
              ) : tableRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tableRequests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="p-4 rounded-lg border bg-card border-border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">#{request.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {request.requested_by_name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            request.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : request.status === "APPROVED"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm mb-1">
                        For: {request.requested_for_name}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {request.total_points} points ·{" "}
                        {new Date(request.date_requested).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                        }}
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
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-lg border bg-card border-border transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <p className="font-semibold">Pending Requests</p>
              </div>
              <p className="text-4xl font-bold">
                {requestsLoading ? "-" : totalCount}
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card border-border transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-success" />
                <p className="font-semibold">Approved Requests</p>
              </div>
              <p className="text-4xl font-bold">
                {statsLoading ? "-" : stats?.approved_count || 0}
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card border-border transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="font-semibold">On-board</p>
              </div>
              <p className="text-4xl font-bold">
                {statsLoading ? "-" : stats?.on_board_count || 0}
              </p>
            </div>
          </div>

          {/* Redemption Table Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Pending Redemption Requests
              </h3>
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
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
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

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!showPasswordStep) setIsResetModalOpen(false);
            }}
          />
          <div
            className="relative w-full max-w-md rounded-xl border shadow-2xl p-6 space-y-4 bg-card border-border text-foreground"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Reset Points</h2>
              </div>
              <button
                onClick={() => {
                  if (!showPasswordStep) {
                    setIsResetModalOpen(false);
                  } else {
                    setShowPasswordStep(false);
                    setPassword("");
                  }
                }}
                className="p-2 rounded-lg hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!showPasswordStep ? (
              <>
                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Select Client
                  </label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm transition-colors bg-card border-border text-foreground focus:border-muted-foreground focus:ring-0"
                  >
                    <option value="">Choose a client</option>
                  </select>

                  <label className="block text-sm font-medium">
                    Points to reset
                  </label>
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
                <div
                  className="p-3 rounded-lg flex items-start gap-3 bg-destructive/10 border border-destructive/30"
                >
                  <AlertCircle
                    className="h-5 w-5 flex-shrink-0 mt-0.5 text-destructive"
                  />
                  <p className="text-sm">
                    This will reset <strong>all points to zero</strong> for both
                    agents and distributors. This action cannot be undone.
                    Please enter your password to confirm.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium">
                    Enter Your Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isResettingPoints}
                    className="w-full rounded-lg border px-3 py-2 text-sm transition-colors bg-card border-border text-foreground placeholder-muted-foreground focus:border-muted-foreground focus:ring-0"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleResetAllPointsConfirm()
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-colors bg-card border-border text-foreground hover:bg-accent disabled:opacity-50"
                    onClick={() => {
                      setShowPasswordStep(false);
                      setPassword("");
                    }}
                    disabled={isResettingPoints}
                  >
                    Back
                  </button>
                  <button
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      !password || isResettingPoints
                        ? "opacity-50 cursor-not-allowed"
                        : ""
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

      {/* Redemption Modals */}
      {selectedRequest && (
        <ViewRedemptionModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          item={selectedRequest}
        />
      )}

      {editRequest && (
        <EditRedemptionModal
          isOpen={!!editRequest}
          onClose={() => setEditRequest(null)}
          item={editRequest}
          onSave={() => {
            setEditRequest(null);
            // Refetch requests with filter
            dashboardApi.getRedemptionRequests(100, 0).then((response) => {
              const filteredRequests = (
                response.results as APIRedemptionRequest[]
              ).filter(
                (req) =>
                  req.status === "APPROVED" &&
                  req.processing_status === "NOT_PROCESSED",
              );
              setRequests(filteredRequests);
              setTotalCount(filteredRequests.length);
            });
          }}
        />
      )}

      {processRequest && (
        <MarkAsProcessedModal
          isOpen={!!processRequest}
          onClose={() => setProcessRequest(null)}
          item={processRequest}
          onConfirm={confirmMarkAsProcessed}
        />
      )}

      {cancelRequest && (
        <CancelRequestModal
          isOpen={!!cancelRequest}
          onClose={() => setCancelRequest(null)}
          item={cancelRequest}
          onConfirm={confirmCancelRequest}
        />
      )}

    </div>
  );
}

export default Dashboard;
