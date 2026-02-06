import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { SidebarSales } from "@/components/sidebar/sidebar";
import { MobileBottomNavSales } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Warehouse, LogOut, RefreshCw } from "lucide-react";
import {
  agentDashboardApi,
  type AgentDashboardStats,
} from "@/lib/distributors-api";
import { redemptionRequestsApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RedemptionItem {
  id: number;
  requested_by: number;
  requested_by_name: string;
  requested_for: number;
  requested_for_name: string;
  status: string;
  processing_status: string;
  total_points: number;
  date_requested: string;
  items: any[];
}

function SalesAgentDashboard() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Stats
  const [stats, setStats] = useState<AgentDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Requests
  const [requests, setRequests] = useState<RedemptionItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notifications
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Fetch agent dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await agentDashboardApi.getStats();
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

  // Fetch agent's pending requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        const response = await redemptionRequestsApi.getRequests();
        const allRequests = response || [];

        // Map to RedemptionItem format and filter for PENDING status only
        const mappedRequests = (allRequests as any[])
          .filter((req) => req.status === "PENDING")
          .map(
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
                items: req.items,
              }) as RedemptionItem,
          );

        setRequests(mappedRequests);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Failed to load requests");
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRefreshRequests = async () => {
    try {
      setIsRefreshing(true);
      const response = await redemptionRequestsApi.getRequests();
      const allRequests = response || [];

      const mappedRequests = (allRequests as any[])
        .filter((req) => req.status === "PENDING")
        .map(
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
              items: req.items,
            }) as RedemptionItem,
        );

      setRequests(mappedRequests);
      toast.success("Requests refreshed successfully");
    } catch (error) {
      console.error("Error refreshing requests:", error);
      toast.error("Failed to refresh requests");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen md:flex-row ${
        isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <SidebarSales />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Mobile Header */}
        <div
          className={`md:hidden sticky top-0 z-40 p-4 flex justify-between items-center border-b ${
            isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full ${
                isDark ? "bg-green-600" : "bg-green-500"
              } flex items-center justify-center`}
            >
              <span className="text-white font-semibold text-xs">
                {stats?.agent_name?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
            <span className="font-medium text-sm">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationOpen(true)}
              className={`p-2 rounded-lg ${
                isDark
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
                isDark
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
                isDark
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto pb-20">
          <div className="p-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isDark ? "bg-yellow-400" : "bg-yellow-500"
                    }`}
                  />
                  <p className="text-xs font-semibold">Pending</p>
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "-" : stats?.pending_count || 0}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isDark ? "bg-blue-400" : "bg-blue-500"
                    }`}
                  />
                  <p className="text-xs font-semibold">Processed</p>
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "-" : stats?.processed_count || 0}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isDark ? "bg-green-400" : "bg-green-500"
                    }`}
                  />
                  <p className="text-xs font-semibold">Approved</p>
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "-" : stats?.approved_count || 0}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isDark ? "bg-red-400" : "bg-red-500"
                    }`}
                  />
                  <p className="text-xs font-semibold">Rejected</p>
                </div>
                <p className="text-2xl font-bold">
                  {statsLoading ? "-" : stats?.rejected_count || 0}
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
                  className={`p-2 rounded-lg ${
                    isDark
                      ? "bg-gray-900 hover:bg-gray-800"
                      : "bg-gray-100 hover:bg-gray-200"
                  } transition-colors disabled:opacity-50`}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>

              {requestsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className={`p-4 rounded-lg border ${
                        isDark
                          ? "bg-gray-900 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-sm">#{request.id}</p>
                          <p className="text-xs text-gray-500">
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
                      <p className="text-xs text-gray-500 mb-3">
                        {request.total_points} points ·{" "}
                        {new Date(request.date_requested).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => navigate("/sales/redemption-status")}
                        className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                  {requests.length > 5 && (
                    <button
                      onClick={() => navigate("/sales/redemption-status")}
                      className={`w-full py-2.5 rounded border text-sm font-semibold transition-colors ${
                        isDark
                          ? "border-gray-700 hover:bg-gray-800"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      View All ({requests.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Dashboard</h1>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Manage your points and track pending redemption requests
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNotificationOpen(true)}
                className={`p-2 rounded-lg ${
                  isDark
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
          <div className="grid grid-cols-2 gap-6 mb-8 lg:grid-cols-4">
            {/* Pending Requests */}
            <div
              className={`p-6 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isDark ? "bg-yellow-400" : "bg-yellow-500"
                  }`}
                />
                <p className="font-semibold text-sm">Pending</p>
              </div>
              <p className="text-4xl font-bold">
                {statsLoading ? "-" : stats?.pending_count || 0}
              </p>
            </div>

            {/* Approved Requests */}
            <div
              className={`p-6 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isDark ? "bg-green-400" : "bg-green-500"
                  }`}
                />
                <p className="font-semibold text-sm">Approved</p>
              </div>
              <p className="text-4xl font-bold">
                {statsLoading ? "-" : stats?.approved_count || 0}
              </p>
            </div>

            {/* Processed Requests */}
            <div
              className={`p-6 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isDark ? "bg-blue-400" : "bg-blue-500"
                  }`}
                />
                <p className="font-semibold text-sm">Processed</p>
              </div>
              <p className="text-4xl font-bold">
                {statsLoading ? "-" : stats?.processed_count || 0}
              </p>
            </div>

            {/* Points Balance */}
            <div
              className={`p-6 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isDark ? "bg-purple-400" : "bg-purple-500"
                  }`}
                />
                <p className="font-semibold text-sm">Points Balance</p>
              </div>
              <p className="text-4xl font-bold">
                {statsLoading
                  ? "-"
                  : (stats?.agent_points || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Pending Requests Table Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Pending Redemption Requests
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/sales/redeem-items")}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    isDark
                      ? "bg-blue-600 border-blue-700 text-white hover:bg-blue-700"
                      : "bg-blue-500 border-blue-600 text-white hover:bg-blue-600"
                  }`}
                  title="Quick redeem"
                >
                  <span>Redeem Items</span>
                </button>
                <button
                  onClick={handleRefreshRequests}
                  disabled={isRefreshing}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    isRefreshing
                      ? "opacity-50 cursor-not-allowed"
                      : isDark
                        ? "bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                        : "bg-white border-gray-200 text-gray-900 hover:bg-gray-100"
                  }`}
                  title="Refresh requests"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Pending Requests Table */}
            <div
              className={`rounded-lg border overflow-hidden ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <Table>
                <TableHeader className={isDark ? "bg-gray-900" : "bg-gray-50"}>
                  <TableRow
                    className={`border-b ${
                      isDark ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <TableHead
                      className={`font-semibold ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Request ID
                    </TableHead>
                    <TableHead
                      className={`font-semibold ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Requested By
                    </TableHead>
                    <TableHead
                      className={`font-semibold ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Distributor
                    </TableHead>
                    <TableHead
                      className={`font-semibold ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Total Points
                    </TableHead>
                    <TableHead
                      className={`font-semibold ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Date Requested
                    </TableHead>
                    <TableHead
                      className={`font-semibold ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!requestsLoading && requests.length > 0 ? (
                    requests.map((request) => (
                      <TableRow
                        key={request.id}
                        className={`border-b ${
                          isDark ? "border-gray-800" : "border-gray-200"
                        } hover:${
                          isDark ? "bg-gray-800/50" : "bg-gray-50"
                        } transition-colors cursor-pointer`}
                        onClick={() => navigate(`/sales/request/${request.id}`)}
                      >
                        <TableCell className="font-medium">
                          #{request.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.requested_by_name}
                        </TableCell>
                        <TableCell>{request.requested_for_name}</TableCell>
                        <TableCell className="font-semibold">
                          {request.total_points.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {new Date(
                            request.date_requested,
                          ).toLocaleDateString()}
                        </TableCell>{" "}
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {request.status}
                          </span>
                        </TableCell>{" "}
                      </TableRow>
                    ))
                  ) : !requestsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className={`text-center py-8 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        No pending requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className={`text-center py-8 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavSales />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}

export default SalesAgentDashboard;
