import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { useLogout } from "@/context/AuthContext";
import {
  Bell,
  RotateCcw,
  Warehouse,
  LogOut,
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
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [pointAmount, setPointAmount] = useState<string>("");
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [isResettingPoints, setIsResettingPoints] = useState(false);

  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Redemption requests
  const [requests, setRequests] = useState<APIRedemptionRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<RedemptionItem | null>(
    null
  );
  const [editRequest, setEditRequest] = useState<RedemptionItem | null>(null);
  const [processRequest, setProcessRequest] = useState<RedemptionItem | null>(
    null
  );
  const [cancelRequest, setCancelRequest] = useState<RedemptionItem | null>(
    null
  );

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
        setStatsError(
          error instanceof Error
            ? error.message
            : "Unable to load stats right now."
        );
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
        setRequestsError(null);
        const response = await dashboardApi.getRedemptionRequests(100, 0);
        // Filter to show only approved and not processed requests
        const filteredRequests = (
          response.results as APIRedemptionRequest[]
        ).filter(
          (req) =>
            req.status === "APPROVED" &&
            req.processing_status === "NOT_PROCESSED"
        );
        setRequests(filteredRequests);
        setTotalCount(filteredRequests.length);
      } catch (error) {
        console.error("Error fetching redemption requests:", error);
        toast.error("Failed to load redemption requests");
        setRequestsError(
          error instanceof Error
            ? error.message
            : "Unable to load redemption requests"
        );
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

  const confirmMarkAsProcessed = async (remarks: string) => {
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
          req.status === "APPROVED" && req.processing_status === "NOT_PROCESSED"
      );
      setRequests(filteredRequests);
      setTotalCount(filteredRequests.length);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to mark request as processed"
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
        remarks
      );
      toast.success("Request cancelled successfully");
      // Refetch requests
      const response = await dashboardApi.getRedemptionRequests(100, 0);
      const filteredRequests = (
        response.results as APIRedemptionRequest[]
      ).filter(
        (req) =>
          req.status === "APPROVED" && req.processing_status === "NOT_PROCESSED"
      );
      setRequests(filteredRequests);
      setTotalCount(filteredRequests.length);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel request"
      );
    }
  };

  const handleRefreshRequests = async () => {
    try {
      setIsRefreshing(true);
      setRequestsError(null);
      const response = await dashboardApi.getRedemptionRequests(100, 0);
      const filteredRequests = (
        response.results as APIRedemptionRequest[]
      ).filter(
        (req) =>
          req.status === "APPROVED" && req.processing_status === "NOT_PROCESSED"
      );
      setRequests(filteredRequests);
      setTotalCount(filteredRequests.length);
      toast.success("Requests refreshed successfully");
    } catch (error) {
      console.error("Error refreshing requests:", error);
      toast.error("Failed to refresh requests");
      setRequestsError(
        error instanceof Error
          ? error.message
          : "Unable to refresh redemption requests"
      );
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
          : "Failed to reset points. Please check your password."
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
      } as RedemptionItem)
  );

  return (
    <div
      className={`flex flex-col h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto pb-[env(safe-area-inset-bottom,16px)]">
        {/* Mobile Header */}
        <div
          className={`md:hidden sticky top-0 z-40 p-4 flex justify-between items-center border-b ${
            resolvedTheme === "dark"
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full ${
                resolvedTheme === "dark" ? "bg-green-600" : "bg-green-500"
              } flex items-center justify-center`}
            >
              <span className="text-white font-semibold text-xs">D</span>
            </div>
            <span className="font-medium text-sm">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsResetModalOpen(true)}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
              title="Reset Points"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsNotificationOpen(true)}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/admin/inventory")}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 hover:bg-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
            >
              <Warehouse className="h-5 w-5" />
            </button>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile KPI strip */}
        <div className="md:hidden px-4 py-3 space-y-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950/60 backdrop-blur">
          {statsError && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 px-3 py-2 text-xs font-semibold">
              {statsError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Pending", value: totalCount, accent: "bg-amber-500" },
              {
                label: "Approved",
                value: stats?.approved_count || 0,
                accent: "bg-emerald-500",
              },
              {
                label: "On-board",
                value: stats?.on_board_count || 0,
                accent: "bg-sky-500",
              },
            ].map((card, idx) => (
              <div
                key={card.label}
                className={`rounded-xl border px-3 py-3 shadow-soft ${
                  idx === 0 ? "col-span-2" : ""
                } ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900/70 border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {card.label}
                  </span>
                  <span className={`h-2 w-2 rounded-full ${card.accent}`} />
                </div>
                <p className="text-2xl font-bold mt-2">
                  {statsLoading ? "—" : card.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Dashboard</h1>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Manage points, track redemptions and redeem items
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsResetModalOpen(true)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                    : "bg-white border-gray-200 text-gray-900 hover:bg-gray-100"
                }`}
                title="Reset Points"
              >
                <RotateCcw className="h-5 w-5" />
                Reset Points
              </button>
              <button
                onClick={() => setIsNotificationOpen(true)}
                className={`p-2 rounded-lg ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 hover:bg-gray-800"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-colors`}
              >
                <Bell className="h-5 w-5" />
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4 mb-8">
            {statsError && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 px-4 py-3 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{statsError}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6">
              {[
                {
                  label: "Pending Requests",
                  color: "bg-amber-500",
                  value: totalCount,
                  loading: requestsLoading,
                },
                {
                  label: "Approved Requests",
                  color: "bg-emerald-500",
                  value: stats?.approved_count || 0,
                  loading: statsLoading,
                },
                {
                  label: "On-board",
                  color: "bg-sky-500",
                  value: stats?.on_board_count || 0,
                  loading: statsLoading,
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className={`p-6 rounded-xl border shadow-soft ${
                    resolvedTheme === "dark"
                      ? "bg-gray-900 border-gray-700"
                      : "bg-white border-gray-200"
                  } transition-colors`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${card.color}`} />
                      <p className="font-semibold text-sm">{card.label}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-soft text-brand font-semibold">
                      Live
                    </span>
                  </div>
                  <p className="text-4xl font-bold tracking-tight">
                    {card.loading ? (
                      <span className="block h-8 w-16 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Redemption Table Section + Controls */}
          <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 items-start">
            <div
              className={`rounded-xl border shadow-soft ${
                resolvedTheme === "dark"
                  ? "bg-gray-950/70 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-gray-800 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Pending Redemption Requests
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Only showing approved but not processed entries.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {requestsError && (
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                      {requestsError}
                    </span>
                  )}
                  <button
                    onClick={handleRefreshRequests}
                    disabled={isRefreshing}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      isRefreshing
                        ? "opacity-50 cursor-not-allowed"
                        : resolvedTheme === "dark"
                        ? "bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                        : "bg-white border-gray-200 text-gray-900 hover:bg-gray-100"
                    }`}
                    title="Refresh requests"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>

              {!requestsLoading && tableRequests.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  <p className="font-semibold mb-2">You are all caught up</p>
                  <p className="mb-4">
                    No pending redemption requests to process.
                  </p>
                  <button
                    onClick={handleRefreshRequests}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white shadow-soft hover:shadow-strong transition-shadow"
                  >
                    <RefreshCw className="h-4 w-4" /> Check again
                  </button>
                </div>
              ) : (
                <RedemptionTable
                  redemptions={tableRequests}
                  loading={requestsLoading}
                  onView={handleViewRequest}
                  onEdit={handleEditRequest}
                  onMarkAsProcessed={handleMarkAsProcessed}
                  onCancelRequest={handleCancelRequest}
                />
              )}
            </div>

            {/* Side controls / danger zone */}
            <div className="space-y-4">
              <div
                className={`rounded-xl border shadow-soft p-5 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-950/70 border-red-900/60"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm font-semibold">Danger zone</p>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Resetting points sets every user to zero. Double-check before
                  you continue.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white font-semibold shadow-strong hover:bg-red-700 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset all points
                  </button>
                  <button
                    onClick={() => navigate("/admin/inventory")}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                      resolvedTheme === "dark"
                        ? "border-gray-700 text-white hover:bg-gray-800"
                        : "border-gray-200 text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    View inventory
                  </button>
                </div>
              </div>

              <div
                className={`rounded-xl border shadow-soft p-5 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-950/70 border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <p className="text-sm font-semibold mb-2">Live pulse</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {requestsLoading
                    ? "Syncing latest requests..."
                    : `${totalCount} pending • ${
                        stats?.approved_count ?? 0
                      } approved today`}
                </p>
              </div>
            </div>
          </div>
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
            className={`relative w-full max-w-md rounded-xl border shadow-2xl p-6 space-y-4 ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
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
                className={`p-2 rounded-lg ${
                  resolvedTheme === "dark"
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-100"
                }`}
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
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white focus:border-gray-500 focus:ring-0"
                        : "bg-white border-gray-300 text-gray-900 focus:border-gray-500 focus:ring-0"
                    }`}
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
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-colors ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                        : "bg-white border-gray-200 text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => setShowPasswordStep(true)}
                  >
                    Reset All Points
                  </button>
                  <button
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      resolvedTheme === "dark"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    onClick={() => setIsResetModalOpen(false)}
                  >
                    Apply
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    resolvedTheme === "dark"
                      ? "bg-red-900/20 border border-red-800"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <AlertCircle
                    className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      resolvedTheme === "dark" ? "text-red-400" : "text-red-600"
                    }`}
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
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-gray-500 focus:ring-0"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:ring-0"
                    }`}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleResetAllPointsConfirm()
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-colors ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50"
                        : "bg-white border-gray-200 text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                    }`}
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
                    } ${
                      resolvedTheme === "dark"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
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
                  req.processing_status === "NOT_PROCESSED"
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

      <MobileBottomNav />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}

export default Dashboard;
