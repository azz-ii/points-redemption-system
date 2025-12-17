import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarApprover } from "@/components/sidebar";
import { MobileBottomNavApprover } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  Search,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  redemptionRequestsApi,
  type RedemptionRequestResponse,
} from "@/lib/api";
import { toast } from "sonner";

interface RequestsProps {
  onNavigate?: (page: "dashboard" | "approver-requests" | "history") => void;
  onLogout?: () => void;
}

function ApproverRequests({ onNavigate, onLogout }: RequestsProps) {
  const { resolvedTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState<RedemptionRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<RedemptionRequestResponse | null>(null);
  const [approveRemarks, setApproveRemarks] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [processing, setProcessing] = useState(false);

  // Fetch requests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await redemptionRequestsApi.getRequests();
      setRequests(data);
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

  const handleNavigate = (
    page: "dashboard" | "approver-requests" | "history" | "requests"
  ) => {
    if (page === "history") {
      onNavigate?.("history");
    } else if (page === "approver-requests" || page === "requests") {
      onNavigate?.("approver-requests");
    } else {
      onNavigate?.(page);
    }
  };

  const handleViewClick = (request: RedemptionRequestResponse) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleApproveClick = (request: RedemptionRequestResponse) => {
    setSelectedRequest(request);
    setApproveRemarks("");
    setShowApproveModal(true);
  };

  const handleRejectClick = (request: RedemptionRequestResponse) => {
    setSelectedRequest(request);
    setRejectReason("");
    setRejectRemarks("");
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      await redemptionRequestsApi.approveRequest(
        selectedRequest.id,
        approveRemarks
      );
      toast.success("Request approved successfully");
      setShowApproveModal(false);
      setSelectedRequest(null);
      setApproveRemarks("");
      await fetchRequests(); // Refresh the list
    } catch (err) {
      console.error("Error approving request:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to approve request"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequest) return;

    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    try {
      setProcessing(true);
      await redemptionRequestsApi.rejectRequest(
        selectedRequest.id,
        rejectReason,
        rejectRemarks
      );
      toast.success("Request rejected successfully");
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");
      setRejectRemarks("");
      await fetchRequests(); // Refresh the list
    } catch (err) {
      console.error("Error rejecting request:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to reject request"
      );
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-400 text-black";
      case "APPROVED":
        return "bg-green-500 text-white";
      case "REJECTED":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <SidebarApprover
        currentPage="requests"
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
                resolvedTheme === "dark" ? "bg-blue-600" : "bg-blue-500"
              } flex items-center justify-center`}
            >
              <span className="text-white font-semibold text-xs">A</span>
            </div>
            <span className="font-medium text-sm">Approver Requests</span>
          </div>
          <div className="flex items-center gap-2">
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
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto pb-20">
          <div className="p-4">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 h-12 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <p
                  className={
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }
                >
                  Loading requests...
                </p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <>
                {/* Request Cards */}
                <div className="space-y-3">
                  {paginatedRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`p-4 rounded-lg border ${
                        resolvedTheme === "dark"
                          ? "bg-gray-900 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-sm">
                            Request #{request.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.requested_by_name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                            request.status
                          )}`}
                        >
                          {request.status_display}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-2">
                        For: {request.requested_for_name}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Points: {request.total_points}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewClick(request)}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-colors ${
                            resolvedTheme === "dark"
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                          }`}
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        {request.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApproveClick(request)}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded bg-green-500 text-white hover:bg-green-600 text-xs font-medium"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(request)}
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded bg-red-500 text-white hover:bg-red-600 text-xs font-medium"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Mobile Pagination */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
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
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
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
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Review and approve incoming redemption requests
              </p>
            </div>
            <div className="flex items-center gap-4">
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

          {/* Search */}
          <div className="mb-6">
            <div
              className={`relative flex items-center h-12 rounded-md border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <Search className="absolute left-3 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search by ID, Requested By, Requested For, or Status..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 w-full h-full ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                    : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p
                className={
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }
              >
                Loading requests...
              </p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <>
              <div
                className={`border rounded-lg overflow-hidden ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                } transition-colors`}
              >
                <table className="w-full text-sm">
                  <thead
                    className={`${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Request ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Requested By
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Requested For
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Total Points
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      resolvedTheme === "dark"
                        ? "divide-gray-700"
                        : "divide-gray-200"
                    }`}
                  >
                    {paginatedRequests.map((request) => (
                      <tr
                        key={request.id}
                        className={`hover:${
                          resolvedTheme === "dark"
                            ? "bg-gray-800"
                            : "bg-gray-50"
                        } transition-colors`}
                      >
                        <td className="px-6 py-4 text-sm">#{request.id}</td>
                        <td className="px-6 py-4 text-sm">
                          {request.requested_by_name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {request.requested_for_name}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {request.total_points}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                              request.status
                            )}`}
                          >
                            {request.status_display}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(
                            request.date_requested
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 flex justify-end gap-2">
                          <button
                            onClick={() => handleViewClick(request)}
                            className={`p-2 rounded transition-colors ${
                              resolvedTheme === "dark"
                                ? "bg-gray-700 hover:bg-gray-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                            }`}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {request.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApproveClick(request)}
                                className="p-2 rounded bg-green-500 text-white hover:bg-green-600 transition-colors"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRejectClick(request)}
                                className="p-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Desktop Pagination */}
                <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                    disabled={safePage === 1}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                      resolvedTheme === "dark"
                        ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                        : "bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
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
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                      resolvedTheme === "dark"
                        ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                        : "bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* View Details Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-lg shadow-lg max-w-lg w-full max-h-96 overflow-y-auto ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border border-gray-700"
                : "bg-white"
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Request Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p
                    className={`font-medium ${
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Request ID
                  </p>
                  <p className="font-semibold">#{selectedRequest.id}</p>
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Requested By
                  </p>
                  <p className="font-semibold">
                    {selectedRequest.requested_by_name}
                  </p>
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Requested For
                  </p>
                  <p className="font-semibold">
                    {selectedRequest.requested_for_name}
                  </p>
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Total Points
                  </p>
                  <p className="font-semibold">
                    {selectedRequest.total_points}
                  </p>
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Status
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusBadgeColor(
                      selectedRequest.status
                    )}`}
                  >
                    {selectedRequest.status_display}
                  </span>
                </div>
                <div>
                  <p
                    className={`font-medium ${
                      resolvedTheme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    Date Requested
                  </p>
                  <p className="font-semibold">
                    {new Date(
                      selectedRequest.date_requested
                    ).toLocaleDateString()}
                  </p>
                </div>
                {selectedRequest.items && selectedRequest.items.length > 0 && (
                  <div>
                    <p
                      className={`font-medium mb-2 ${
                        resolvedTheme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      Items
                    </p>
                    <ul className="space-y-1 text-xs">
                      {selectedRequest.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>{item.catalogue_item_name}</span>
                          <span className="font-semibold">
                            {item.quantity} x {item.points_per_item}pts
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-lg shadow-lg max-w-sm w-full ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border border-gray-700"
                : "bg-white"
            }`}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Approve Request</h2>
              <p className="text-sm mb-4">
                Are you sure you want to approve this request for{" "}
                <strong>{selectedRequest.requested_for_name}</strong>?
              </p>

              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Remarks (Optional)
                </label>
                <textarea
                  value={approveRemarks}
                  onChange={(e) => setApproveRemarks(e.target.value)}
                  placeholder="Add any remarks..."
                  className={`w-full px-3 py-2 rounded border text-sm resize-none ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  }`}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setApproveRemarks("");
                  }}
                  className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveConfirm()}
                  className="flex-1 px-4 py-2 rounded bg-green-500 text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? "Approving..." : "Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`rounded-lg shadow-lg max-w-sm w-full ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border border-gray-700"
                : "bg-white"
            }`}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Reject Request</h2>
              <p className="text-sm mb-4">
                Are you sure you want to reject this request for{" "}
                <strong>{selectedRequest.requested_for_name}</strong>?
              </p>

              <div className="mb-4">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className={`w-full px-3 py-2 rounded border text-sm resize-none ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  }`}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                    resolvedTheme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectConfirm()}
                  className="flex-1 px-4 py-2 rounded bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  disabled={processing || !rejectReason.trim()}
                >
                  {processing ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavApprover
        currentPage="requests"
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />
    </div>
  );
}

export default ApproverRequests;
