import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  redemptionRequestsApi,
  type RedemptionRequestResponse,
} from "@/lib/api";
import { toast } from "sonner";
import { ViewRequestModal, ApproveRequestModal, RejectRequestModal, type RequestItem } from "./modals";
import { RequestsTable, RequestsMobileCards } from "./components";

// Using the API response type directly
type RequestItemAPI = RedemptionRequestResponse;

function ApproverRequests() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState<RequestItemAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<RequestItem | null>(null);

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await redemptionRequestsApi.getRequests();
      // Filter to show only NOT_PROCESSED requests (pending processing)
      const nonProcessedRequests = data.filter(
        (req) => req.processing_status === "NOT_PROCESSED" || !req.processing_status
      );
      setRequests(nonProcessedRequests);
    } catch (err) {
      console.error("Error fetching redemption requests:", err);
      setError(err instanceof Error ? err.message : "Failed to load requests");
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const pageSize = 7;
  const filteredRequests = requests.filter((request) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.id.toString().includes(query) ||
      request.requested_by_name.toLowerCase().includes(query) ||
      request.requested_for_name.toLowerCase().includes(query) ||
      request.status.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

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

    // Close modal and reset form immediately
    setShowApproveModal(false);
    setSelectedRequest(null);

    // Show optimistic success message
    toast.success("Request approved successfully");

    // Execute API call in background without blocking
    redemptionRequestsApi.approveRequest(
      selectedRequest.id,
      remarks
    )
      .then(() => {
        // Silently succeed - user already sees success toast
        // Refresh the list in background
        fetchRequests();
      })
      .catch((err) => {
        console.error("Error approving request:", err);
        // Show error toast if approval failed
        toast.error(
          err instanceof Error ? err.message : "Failed to approve request"
        );
        // Refresh to show current state
        fetchRequests();
      });
  };

  const handleRejectConfirm = async (reason: string, remarks: string) => {
    if (!selectedRequest) return;

    // Close modal and reset form immediately
    setShowRejectModal(false);
    setSelectedRequest(null);

    // Show optimistic success message
    toast.success("Request rejected successfully");

    // Execute API call in background without blocking
    redemptionRequestsApi.rejectRequest(
      selectedRequest.id,
      reason,
      remarks
    )
      .then(() => {
        // Silently succeed - user already sees success toast
        // Refresh the list in background
        fetchRequests();
      })
      .catch((err) => {
        console.error("Error rejecting request:", err);
        // Show error toast if rejection failed
        toast.error(
          err instanceof Error ? err.message : "Failed to reject request"
        );
        // Refresh to show current state
        fetchRequests();
      });
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 overflow-y-auto pb-20">
        <div className="p-4">
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
      <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Redemption Requests</h1>
            <p className="text-sm text-muted-foreground">
              Review and approve incoming redemption requests
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative flex items-center h-12 rounded-md border bg-card border-border">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by ID, Requested By, Requested For, or Status..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full h-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <RequestsTable
          requests={paginatedRequests as RequestItem[]}
          loading={loading}
          onView={handleViewClick}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
        />

        {/* Desktop Pagination */}
        {!loading && !error && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <span className="text-sm font-medium">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, safePage + 1))
              }
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 bg-card border border-border hover:bg-accent"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

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
  );
}

export default ApproverRequests;
