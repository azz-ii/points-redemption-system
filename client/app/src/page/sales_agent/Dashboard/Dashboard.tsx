import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useAgentDashboardStats } from "@/hooks/queries/useDashboard";
import { useRequests } from "@/hooks/queries/useRequests";
import { toast } from "sonner";
import { DashboardTable, type RedemptionItem } from "./components";
import { ViewRedemptionStatusModal } from "../Redemption Status/modals/ViewRedemptionStatusModal";

function SalesAgentDashboard() {
  const navigate = useNavigate();

  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useAgentDashboardStats(30_000);
  const { data: allRequests = [], isLoading: requestsLoading, isFetching: isRefreshing, refetch } = useRequests(30_000);

  const requests = useMemo(
    () => (allRequests as any[])
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
      ),
    [allRequests],
  );

  const handleRefreshRequests = () => {
    refetch();
    toast.success("Requests refreshed successfully");
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {/* Header */}
          <h1 className="text-xl font-semibold mb-1">Dashboard</h1>
          <p className="text-xs text-muted-foreground mb-4">
            Manage your points and track redemptions
          </p>

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
                            ? "bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-800/50 dark:text-yellow-300"
                            : request.status === "APPROVED"
                              ? "bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300"
                              : "bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-900/40 dark:border-rose-800/50 dark:text-rose-300"
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
            <h1 className="text-2xl font-semibold">Dashboard</h1>
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
          <DashboardTable
            items={requests}
            loading={requestsLoading}
            onRefresh={handleRefreshRequests}
            refreshing={isRefreshing}
            onViewRequest={(item) => {
              const fullRequest = allRequests.find((req: any) => req.id === item.id);
              if (fullRequest) {
                setSelectedRequest(fullRequest);
                setShowViewModal(true);
              }
            }}
          />
        </div>
      </div>
      
      <ViewRedemptionStatusModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRequest(null);
        }}
        item={selectedRequest?.items?.[0] || null}
        request={selectedRequest}
        onRequestWithdrawn={() => refetch()}
      />
    </div>
  );
}

export default SalesAgentDashboard;
