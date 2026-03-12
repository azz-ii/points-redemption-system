import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useApproverDashboardStats } from "@/hooks/queries/useDashboard";
import { useRequests } from "@/hooks/queries/useRequests";
import { useApproveRequest, useRejectRequest } from "@/hooks/mutations/useRequestMutations";
import { toast } from "sonner";
import { ViewRequestModal, ApproveRequestModal, RejectRequestModal, type RequestItem } from "../Requests/modals";
import { RequestsTable, RequestsMobileCards } from "../Requests/components";

function ApproverDashboard() {
  const navigate = useNavigate();

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);

  const { data: stats, isLoading: statsLoading } = useApproverDashboardStats(5000);
  const { data: allRequests = [], isLoading: requestsLoading, isFetching: isRefreshing, refetch } = useRequests(5000);

  const requests = useMemo(
    () => allRequests.filter(
      (req) =>
        req.status === "PENDING" &&
        (req.processing_status === "NOT_PROCESSED" || !req.processing_status),
    ),
    [allRequests],
  );

  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const handleRefresh = () => { refetch(); };

  const handleViewClick = (request: RequestItem) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleApproveClick = (request: RequestItem) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleRejectClick = (request: RequestItem) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async (remarks: string) => {
    if (!selectedRequest) return;

    setShowApproveModal(false);
    setSelectedRequest(null);
    toast.success("Request approved successfully");

    approveMutation.mutate(
      { id: selectedRequest.id, remarks },
      {
        onError: (err) => {
          console.error("Error approving request:", err);
          toast.error(
            err instanceof Error ? err.message : "Failed to approve request",
          );
        },
      },
    );
  };

  const handleRejectConfirm = async (reason: string, remarks: string) => {
    if (!selectedRequest) return;

    setShowRejectModal(false);
    setSelectedRequest(null);
    toast.success("Request rejected successfully");

    rejectMutation.mutate(
      { id: selectedRequest.id, reason, remarks },
      {
        onError: (err) => {
          console.error("Error rejecting request:", err);
          toast.error(
            err instanceof Error ? err.message : "Failed to reject request",
          );
        },
      },
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {/* Header */}
          <h1 className="text-xl font-semibold mb-1">Dashboard</h1>
          <p className="text-xs text-muted-foreground mb-4">
            Review and approve redemption requests
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-lg border bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400" />
                <p className="text-xs font-semibold">Pending</p>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "-" : stats?.pending_count ?? 0}
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                <p className="text-xs font-semibold">Approved</p>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "-" : stats?.approved_count ?? 0}
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400" />
                <p className="text-xs font-semibold">Rejected</p>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "-" : stats?.rejected_count ?? 0}
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                <p className="text-xs font-semibold">Processed</p>
              </div>
              <p className="text-2xl font-bold">
                {statsLoading ? "-" : stats?.processed_count ?? 0}
              </p>
            </div>
          </div>

          {/* Pending Requests - Mobile Cards */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pending Requests</h3>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <RequestsMobileCards
              requests={[...(requests as unknown as RequestItem[])].sort(
                (a, b) => new Date(b.date_requested).getTime() - new Date(a.date_requested).getTime()
              )}
              loading={requestsLoading}
              onView={handleViewClick}
              onApprove={handleApproveClick}
              onReject={handleRejectClick}
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:flex-1 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {stats?.team_count
                ? `Managing ${stats.team_count} team${stats.team_count > 1 ? "s" : ""}: ${stats.team_names.join(", ")}`
                : "Review and approve redemption requests from your teams"}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8 lg:grid-cols-4">
          <div className="p-6 rounded-lg border bg-card border-border transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-yellow-500 dark:bg-yellow-400" />
              <p className="font-semibold text-sm">Pending</p>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? "-" : stats?.pending_count ?? 0}
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card border-border transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
              <p className="font-semibold text-sm">Approved</p>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? "-" : stats?.approved_count ?? 0}
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card border-border transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400" />
              <p className="font-semibold text-sm">Rejected</p>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? "-" : stats?.rejected_count ?? 0}
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card border-border transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
              <p className="font-semibold text-sm">Processed</p>
            </div>
            <p className="text-4xl font-bold">
              {statsLoading ? "-" : stats?.processed_count ?? 0}
            </p>
          </div>
        </div>

        {/* Pending Requests Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Pending Redemption Requests
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/approver/requests")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors bg-primary border-primary text-primary-foreground hover:bg-primary/90"
              >
                View All Requests
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  isRefreshing
                    ? "opacity-50 cursor-not-allowed"
                    : "bg-card border-border text-foreground hover:bg-accent"
                }`}
                title="Refresh dashboard"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <RequestsTable
            requests={[...(requests as unknown as RequestItem[])].sort(
              (a, b) => new Date(b.date_requested).getTime() - new Date(a.date_requested).getTime()
            )}
            loading={requestsLoading}
            onView={handleViewClick}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
          />
        </div>
      </div>

      {/* Modals */}
      {selectedRequest && (
        <>
          <ViewRequestModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
          />
          <ApproveRequestModal
            isOpen={showApproveModal}
            onClose={() => {
              setShowApproveModal(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onConfirm={handleApproveConfirm}
          />
          <RejectRequestModal
            isOpen={showRejectModal}
            onClose={() => {
              setShowRejectModal(false);
              setSelectedRequest(null);
            }}
            request={selectedRequest}
            onConfirm={handleRejectConfirm}
          />
        </>
      )}
    </div>
  );
}

export default ApproverDashboard;
