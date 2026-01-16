import { useState } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarApprover } from "@/components/sidebar";
import { MobileBottomNavApprover } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  Search,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface RequestItem {
  id: string;
  agent: string;
  details: string;
  quantity: number;
  status: "Pending" | "Approved" | "Rejected";
}

const initialRequests: RequestItem[] = [
  {
    id: "RQ-001",
    agent: "Alex Tan",
    details: "Redeem 50,000 pts for Cap",
    quantity: 50,
    status: "Pending",
  },
  {
    id: "RQ-002",
    agent: "Jamie Lee",
    details: "Redeem 10,000 pts for Polo",
    quantity: 10,
    status: "Approved",
  },
  {
    id: "RQ-003",
    agent: "Priya Kumar",
    details: "Redeem 25,000 pts for Jacket",
    quantity: 25,
    status: "Rejected",
  },
  {
    id: "RQ-004",
    agent: "Hafiz Rahman",
    details: "Redeem 5,000 pts for Tie",
    quantity: 5,
    status: "Pending",
  },
  {
    id: "RQ-005",
    agent: "Sarah Chen",
    details: "Redeem 15,000 pts for Shirt",
    quantity: 15,
    status: "Approved",
  },
  {
    id: "RQ-006",
    agent: "Daniel Ong",
    details: "Redeem 8,000 pts for Cap",
    quantity: 8,
    status: "Pending",
  },
  {
    id: "RQ-007",
    agent: "Maria Lopez",
    details: "Redeem 30,000 pts for Shoes",
    quantity: 30,
    status: "Rejected",
  },
  {
    id: "RQ-008",
    agent: "Kenji Sato",
    details: "Redeem 20,000 pts for Hoodie",
    quantity: 20,
    status: "Approved",
  },
];

function ApproverDashboard() {
  const { resolvedTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [requests, setRequests] = useState<RequestItem[]>(initialRequests);

  const pageSize = 6;

  const badgeTone = (status: RequestItem["status"]) => {
    if (status === "Approved") {
      return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-200";
    }
    if (status === "Pending") {
      return "bg-amber-100 text-amber-800 ring-1 ring-amber-300 dark:bg-amber-500/10 dark:text-amber-200";
    }
    return "bg-rose-100 text-rose-800 ring-1 ring-rose-300 dark:bg-rose-500/10 dark:text-rose-200";
  };

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
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + pageSize
  );

  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  const updateStatus = (id: string, status: RequestItem["status"]) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req))
    );
  };

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <SidebarApprover />

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
            <span className="font-medium text-sm">Approver Dashboard</span>
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
                      <p className="font-semibold text-sm">{request.id}</p>
                      <p className="text-xs text-gray-500">{request.agent}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeTone(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-2">{request.details}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    Qty: {request.quantity}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateStatus(request.id, "Approved")}
                      className="flex items-center justify-center gap-1 px-2 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-medium"
                    >
                      <Check className="w-3 h-3" /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(request.id, "Rejected")}
                      className="flex items-center justify-center gap-1 px-2 py-2 rounded bg-rose-500 text-white hover:bg-rose-600 text-xs font-medium"
                    >
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

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
              <h1 className="text-3xl font-semibold">Request Management</h1>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className={`p-4 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Pending
              </p>
              <p className="text-2xl font-bold mt-2">{pendingCount}</p>
            </div>
            <div
              className={`p-4 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Approved
              </p>
              <p className="text-2xl font-bold mt-2">{approvedCount}</p>
            </div>
            <div
              className={`p-4 rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              }`}
            >
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Total
              </p>
              <p className="text-2xl font-bold mt-2">{requests.length}</p>
            </div>
          </div>

          <div className="mb-6">
            <div
              className={`relative flex items-center h-12 ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <Search className="absolute left-3 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search by ID, Name, Details, or Status..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 w-full h-full ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
          </div>

          <div
            className={`border rounded-xl overflow-hidden shadow-sm ${
              resolvedTheme === "dark"
                ? "bg-neutral-900/80 border-neutral-800"
                : "bg-white border-gray-200"
            } transition-colors`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                resolvedTheme === "dark"
                  ? "bg-gray-800/50 border-gray-700 text-gray-400"
                  : "bg-gray-100/50 border-gray-200 text-gray-600"
              }`}
            >
              <div className="text-sm font-medium">Live queue</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 font-semibold">
                  {approvedCount} approved
                </span>
                <span className="px-2 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-200 font-semibold">
                  {pendingCount} pending
                </span>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow
                  className={`${
                    resolvedTheme === "dark" ? "bg-gray-800/60" : "bg-gray-100"
                  }`}
                >
                  <TableHead className="min-w-[110px] font-semibold">
                    ID
                  </TableHead>
                  <TableHead className="min-w-[160px] font-semibold">
                    Agent
                  </TableHead>
                  <TableHead className="font-semibold">Details</TableHead>
                  <TableHead className="w-28 font-semibold">Quantity</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right w-48 font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className={`${
                      resolvedTheme === "dark"
                        ? "hover:bg-gray-800/40"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <TableCell className="font-semibold">
                      {request.id}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {request.agent}
                    </TableCell>
                    <TableCell
                      className={`text-sm ${
                        resolvedTheme === "dark"
                          ? "text-muted-foreground"
                          : "text-gray-600"
                      }`}
                    >
                      {request.details}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {request.quantity}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeTone(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => updateStatus(request.id, "Approved")}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                          title="Confirm"
                        >
                          <Check className="w-4 h-4" /> Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(request.id, "Rejected")}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between p-4 border-t border-border/60">
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

      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
      <MobileBottomNavApprover />
    </div>
  );
}

export default ApproverDashboard;
