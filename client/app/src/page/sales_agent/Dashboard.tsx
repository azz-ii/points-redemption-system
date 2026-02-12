import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import {
  agentDashboardApi,
  type AgentDashboardStats,
} from "@/lib/distributors-api";
import { redemptionRequestsApi } from "@/lib/api";
import { toast } from "sonner";
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

  // Stats
  const [stats, setStats] = useState<AgentDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Requests
  const [requests, setRequests] = useState<RedemptionItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div
              className="p-4 rounded-lg border bg-card border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400"
                />
                <p className="text-xs font-semibold">Pending</p>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "-" : stats?.pending_count || 0}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border bg-card border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"
                />
                <p className="text-xs font-semibold">Processed</p>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "-" : stats?.processed_count || 0}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border bg-card border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"
                />
                <p className="text-xs font-semibold">Approved</p>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "-" : stats?.approved_count || 0}
              </p>
            </div>

            <div
              className="p-4 rounded-lg border bg-card border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400"
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
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 5).map((request) => (
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
                      onClick={() => navigate("/sales/redemption-status")}
                      className="w-full py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
                {requests.length > 5 && (
                  <button
                    onClick={() => navigate("/sales/redemption-status")}
                    className="w-full py-2.5 rounded border text-sm font-semibold transition-colors border-border hover:bg-accent"
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
              className="text-sm text-muted-foreground"
            >
              Manage your points and track pending redemption requests
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8 lg:grid-cols-4">
          {/* Pending Requests */}
          <div
            className="p-6 rounded-lg border bg-card border-border transition-colors"
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400"
              />
              <p className="font-semibold text-sm">Pending</p>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? "-" : stats?.pending_count || 0}
            </p>
          </div>

          {/* Approved Requests */}
          <div
            className="p-6 rounded-lg border bg-card border-border transition-colors"
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400"
              />
              <p className="font-semibold text-sm">Approved</p>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? "-" : stats?.approved_count || 0}
            </p>
          </div>

          {/* Processed Requests */}
          <div
            className="p-6 rounded-lg border bg-card border-border transition-colors"
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400"
              />
              <p className="font-semibold text-sm">Processed</p>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? "-" : stats?.processed_count || 0}
            </p>
          </div>

          {/* Points Balance */}
          <div
            className="p-6 rounded-lg border bg-card border-border transition-colors"
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"
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
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors bg-primary border-primary text-primary-foreground hover:bg-primary/90"
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
          </div>

          {/* Pending Requests Table */}
          <div
            className="rounded-lg border overflow-hidden border-border"
          >
            <Table>
              <TableHeader className="bg-muted">
                <TableRow
                  className="border-b border-border"
                >
                  <TableHead
                    className="font-semibold text-muted-foreground"
                  >
                    Request ID
                  </TableHead>
                  <TableHead
                    className="font-semibold text-muted-foreground"
                  >
                    Requested By
                  </TableHead>
                  <TableHead
                    className="font-semibold text-muted-foreground"
                  >
                    Distributor
                  </TableHead>
                  <TableHead
                    className="font-semibold text-muted-foreground"
                  >
                    Total Points
                  </TableHead>
                  <TableHead
                    className="font-semibold text-muted-foreground"
                  >
                    Date Requested
                  </TableHead>
                  <TableHead
                    className="font-semibold text-muted-foreground"
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
                      className="border-b border-border hover:bg-accent/50 transition-colors cursor-pointer"
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
                        className="text-muted-foreground"
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
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No pending requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
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
  );
}

export default SalesAgentDashboard;
