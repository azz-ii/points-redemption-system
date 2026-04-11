import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRequests } from "@/hooks/queries/useRequests";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useApproveRequest, useRejectRequest } from "@/hooks/mutations/useRequestMutations";
import { toast } from "sonner";
import { ViewRequestModal, ApproveRequestModal, RejectRequestModal, type RequestItem } from "./modals";
import { RequestsTable, RequestsMobileCards } from "./components";

function ApproverRequests() {
  const queryClient = useQueryClient();
  const { username } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestItem | null>(null);

  // Backend filters to NOT_PROCESSED via ?not_processed=1, so no client-side
  // post-filter is needed. Poll every 30s (same cadence as all other hooks).
  const { data: requests = [], isLoading: loading, isFetching: refreshing } = useRequests({
    refetchInterval: 30_000,
    notProcessed: true,
  });

  const approveMutation = useApproveRequest();
  const rejectMutation = useRejectRequest();

  const handleManualRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.requests.all });
  }, [queryClient]);

  const pageSize = 15;

  // Memoise the filter + pagination so they don't recompute on unrelated renders.
  const { paginatedRequests, totalPages, safePage } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? requests.filter(
          (r) =>
            r.id.toString().includes(q) ||
            r.requested_by_name.toLowerCase().includes(q) ||
            r.requested_for_name.toLowerCase().includes(q) ||
            r.status.toLowerCase().includes(q),
        )
      : requests;
    // Data arrives pre-sorted by -date_requested from the backend; no re-sort needed.
    const total = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safe = Math.min(currentPage, total);
    const start = (safe - 1) * pageSize;
    return {
      paginatedRequests: filtered.slice(start, start + pageSize),
      totalPages: total,
      safePage: safe,
    };
  }, [requests, searchQuery, currentPage, pageSize]);

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

  const handleApproveFromView = (request: RequestItem) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleRejectFromView = (request: RequestItem) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async (remarks: string) => {
    if (!selectedRequest) return;

    // Close modal and reset form immediately
    setShowApproveModal(false);
    setSelectedRequest(null);

    // Show optimistic success message
    toast.success("Request approved successfully");

    approveMutation.mutate(
      { id: selectedRequest.id, remarks },
      {
        onError: (err) => {
          console.error("Error approving request:", err);
          toast.error(
            err instanceof Error ? err.message : "Failed to approve request"
          );
        },
      },
    );
  };

  const handleRejectConfirm = async (reason: string, remarks: string) => {
    if (!selectedRequest) return;

    // Close modal and reset form immediately
    setShowRejectModal(false);
    setSelectedRequest(null);

    // Show optimistic success message
    toast.success("Request rejected successfully");

    rejectMutation.mutate(
      { id: selectedRequest.id, reason, remarks },
      {
        onError: (err) => {
          console.error("Error rejecting request:", err);
          toast.error(
            err instanceof Error ? err.message : "Failed to reject request"
          );
        },
      },
    );
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {/* Header */}
          <h1 className="text-xl font-semibold mb-1">Redemption Requests</h1>
          <p className="text-xs text-muted-foreground mb-4">
            Review and approve incoming requests
          </p>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <RequestsMobileCards
            requests={paginatedRequests as RequestItem[]}
            loading={loading}
            onView={handleViewClick}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
          />

          {/* Mobile Pagination */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>
            <span className="text-xs font-medium">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, safePage + 1))
              }
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col md:h-full md:overflow-hidden md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Redemption Requests</h1>
            <p className="text-sm text-muted-foreground">
              Review and approve incoming redemption requests
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <RequestsTable
            requests={requests as RequestItem[]}
            loading={loading}
            onView={handleViewClick}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
            onRefresh={handleManualRefresh}
            refreshing={refreshing}
            fillHeight
            currentUserUsername={username}
          />
        </div>
      </div>

      <ViewRequestModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onApprove={handleApproveFromView}
        onReject={handleRejectFromView}
        currentUserUsername={username}
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
  );
}

export default ApproverRequests;
