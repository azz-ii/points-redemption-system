import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  Search,
  Check,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Warehouse,
  LogOut,
} from "lucide-react";

interface RequestItem {
  id: string;
  agent: string;
  details: string;
  quantity: number;
  status: "Pending" | "Approved" | "Rejected";
}

interface DashboardProps {
  onNavigate?: (
    page:
      | "dashboard"
      | "history"
      | "accounts"
      | "catalogue"
      | "redemption"
      | "inventory"
      | "distributors"
      | "teams"
  ) => void;
  onLogout?: () => void;
}

function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const { resolvedTheme } = useTheme();
  const activePage = "dashboard";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [pointAmount, setPointAmount] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [requests] = useState<RequestItem[]>([
    {
      id: "SA220011",
      agent: "Kim Molina",
      details: "Platinum Polo",
      quantity: 12,
      status: "Pending",
    },
    {
      id: "SA220012",
      agent: "Jerald Napoles",
      details: "Platinum Cap",
      quantity: 4,
      status: "Pending",
    },
    {
      id: "SA220013",
      agent: "Maria Santos",
      details: "Premium Jacket",
      quantity: 8,
      status: "Approved",
    },
    {
      id: "SA220014",
      agent: "Juan Cruz",
      details: "Executive Shirt",
      quantity: 6,
      status: "Pending",
    },
    {
      id: "SA220015",
      agent: "Ana Garcia",
      details: "Corporate Tie",
      quantity: 10,
      status: "Rejected",
    },
    {
      id: "SA220016",
      agent: "Liza Dela Cruz",
      details: "Leather Shoes",
      quantity: 5,
      status: "Approved",
    },
  ]);

  const clientOptions = Array.from(new Set(requests.map((r) => r.agent)));

  const selectedFilter = "All Incoming Submission Request";
  const [searchQuery, setSearchQuery] = useState("");

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const onBoardCount = 20;

  const pageSize = 5;

  const filteredRequests = requests.filter((request) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.id.toLowerCase().includes(query) ||
      request.agent.toLowerCase().includes(query) ||
      request.details.toLowerCase().includes(query) ||
      request.status.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar
        currentPage="dashboard"
        onNavigate={onNavigate || (() => {})}
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
                resolvedTheme === "dark" ? "bg-green-600" : "bg-green-500"
              } flex items-center justify-center`}
            >
              <span className="text-white font-semibold text-xs">I</span>
            </div>
            <span className="font-medium text-sm">Welcome, Izza!</span>
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
              onClick={() => onNavigate?.("inventory")}
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
              onClick={onLogout}
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

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto pb-20">
          <div className="p-4 space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-4 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                } transition-colors`}
              >
                <p className="text-xs text-gray-500 mb-2">Pending Requests</p>
                <p className="text-2xl font-bold">
                  {pendingCount}{" "}
                  <span className="text-xs text-gray-500">
                    / {pendingCount + approvedCount}
                  </span>
                </p>
              </div>
              <div
                className={`p-4 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                } transition-colors`}
              >
                <p className="text-xs text-gray-500 mb-2">Approved Request</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>

            {/* Search */}
            <div
              className={`relative flex items-center rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <Search className="absolute left-3 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search Distributors..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 py-3 ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                    : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>

            {/* Section Title */}
            <div className="flex items-center justify-between mt-6">
              <h3 className="font-bold text-sm">
                Incoming Submission Requests
              </h3>
              <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                {pendingCount}
              </span>
            </div>

            {/* Request Cards */}
            <div className="space-y-3">
              {paginatedRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-900 border-gray-700"
                      : "bg-white border-gray-200"
                  } transition-colors`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm">{request.id}</p>
                      <p className="text-xs text-gray-500">{request.agent}</p>
                    </div>
                    <span className="text-xs text-gray-500">2025-12-31</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    24 Redeem Item Request
                  </p>
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        request.status === "Pending"
                          ? "bg-yellow-400 text-black"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      • {request.status}
                    </span>
                    <span className="text-xs font-semibold">
                      Total: 14,500 pts
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailsModal(true);
                    }}
                    className={`w-full py-2 text-xs font-medium rounded-lg ${
                      resolvedTheme === "dark"
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-gray-900 text-white hover:bg-gray-700"
                    } transition-colors`}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>

            {/* Mobile Pagination */}
            <div className="flex items-center justify-between mt-4">
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
              <h1 className="text-3xl font-semibold">Welcome, Izza</h1>
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
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div
              className={`p-6 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    resolvedTheme === "dark" ? "bg-yellow-400" : "bg-yellow-500"
                  }`}
                />
                <p className="font-semibold">Pending Request</p>
              </div>
              <p className="text-4xl font-bold">
                {pendingCount}{" "}
                <span
                  className={`text-lg ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  / {pendingCount + approvedCount}
                </span>
              </p>
            </div>

            <div
              className={`p-6 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    resolvedTheme === "dark" ? "bg-green-400" : "bg-green-500"
                  }`}
                />
                <p className="font-semibold">Approved Requests</p>
              </div>
              <p className="text-4xl font-bold">{approvedCount}</p>
            </div>

            <div
              className={`p-6 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              } transition-colors`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-2 h-2 rounded-full ${
                    resolvedTheme === "dark" ? "bg-blue-400" : "bg-blue-500"
                  }`}
                />
                <p className="font-semibold">On-board</p>
              </div>
              <p className="text-4xl font-bold">{onBoardCount}</p>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <h3
                className={`text-lg font-semibold ${
                  resolvedTheme === "dark" ? "text-white" : "text-gray-900"
                }`}
                aria-label="Current filter"
              >
                {selectedFilter}
              </h3>
            </div>
            <div
              className={`relative flex items-center ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <Search className="absolute left-3 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search....."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 w-80 ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
          </div>

          {/* Table */}
          <div
            className={`border rounded-lg overflow-hidden ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            } transition-colors`}
          >
            <table className="w-full">
              <thead
                className={`${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Agent
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
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
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4 text-sm">{request.id}</td>
                    <td className="px-6 py-4 text-sm">{request.agent}</td>
                    <td className="px-6 py-4 text-sm">{request.details}</td>
                    <td className="px-6 py-4 text-sm">{request.quantity}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          request.status === "Pending"
                            ? "bg-yellow-400 text-black"
                            : request.status === "Approved"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-3">
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-medium"
                        title="Confirm"
                      >
                        <Check className="w-4 h-4" /> Confirm
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
                        title="Reject"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button
                        className="flex items-center gap-1 px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500 transition-colors text-sm font-medium"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
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
        </div>
      </div>

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsResetModalOpen(false)}
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
                onClick={() => setIsResetModalOpen(false)}
                className={`p-2 rounded-lg ${
                  resolvedTheme === "dark"
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-100"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Select Client</label>
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
                {clientOptions.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
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
                onClick={() => {
                  setSelectedClient("");
                  setPointAmount("");
                }}
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
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDetailsModal(false)}
          />
          <div
            className={`relative w-full max-w-md rounded-xl border shadow-2xl p-6 space-y-4 ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Request Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`p-2 rounded-lg ${
                  resolvedTheme === "dark"
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-100"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div>
                <p
                  className={`text-xs font-medium ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Request ID
                </p>
                <p className="font-semibold">{selectedRequest.id}</p>
              </div>

              <div>
                <p
                  className={`text-xs font-medium ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Agent
                </p>
                <p className="font-semibold">{selectedRequest.agent}</p>
              </div>

              <div>
                <p
                  className={`text-xs font-medium ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Details
                </p>
                <p className="font-semibold">{selectedRequest.details}</p>
              </div>

              <div>
                <p
                  className={`text-xs font-medium ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Quantity
                </p>
                <p className="font-semibold">{selectedRequest.quantity}</p>
              </div>

              <div>
                <p
                  className={`text-xs font-medium ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Status
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedRequest.status === "Pending"
                      ? "bg-yellow-400 text-black"
                      : selectedRequest.status === "Approved"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            {/* Action Buttons - Vertical Stack */}
            <div className="flex flex-col gap-2 pt-4">
              <button
                className="w-full px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
                onClick={() => {
                  console.log("Approve request:", selectedRequest.id);
                  setShowDetailsModal(false);
                }}
              >
                Approve
              </button>
              <button
                className="w-full px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
                onClick={() => {
                  console.log("Reject request:", selectedRequest.id);
                  setShowDetailsModal(false);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <MobileBottomNav
        currentPage={activePage}
        onNavigate={onNavigate || (() => {})}
      />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}

export default Dashboard;
