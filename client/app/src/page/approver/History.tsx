import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarApprover } from "@/components/sidebar";
import { MobileBottomNavApprover } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Search, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";

interface HistoryItem {
  id: string;
  type: string;
  details: string;
  quantity: number;
  status: "Approved" | "Rejected";
}

function ApproverHistory() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [historyItems] = useState<HistoryItem[]>([
    { id: "MC0003C", type: "T-shirt", details: "Platinum Polo", quantity: 8, status: "Approved" },
    { id: "MC0004C", type: "Cap", details: "Platinum Cap", quantity: 5, status: "Approved" },
    { id: "SA220015", type: "Tie", details: "Corporate Tie", quantity: 10, status: "Rejected" },
    { id: "SA220016", type: "Shirt", details: "Casual Shirt", quantity: 10, status: "Rejected" },
    { id: "SA220017", type: "Jacket", details: "Wool Jacket", quantity: 5, status: "Approved" },
    { id: "SA220018", type: "Pants", details: "Business Pants", quantity: 3, status: "Rejected" },
    { id: "SA220019", type: "Shoes", details: "Leather Shoes", quantity: 7, status: "Approved" },
  ]);

  const pageSize = 7;
  const filteredItems = historyItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query) ||
      item.details.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const badgeTone = (status: HistoryItem["status"]) =>
    status === "Approved"
      ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200"
      : "bg-rose-100 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200";

  const handleNavigate = (
    page: "dashboard" | "approver-requests" | "history" | "requests"
  ) => {
    if (page === "approver-requests" || page === "requests") {
      navigate("/approver/requests");
    } else if (page === "history") {
      navigate("/approver/history");
    } else {
      navigate("/approver/dashboard");
    }
  };

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark" ? "bg-black text-white" : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <SidebarApprover />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div
          className={`md:hidden sticky top-0 z-40 p-4 flex justify-between items-center border-b ${
            resolvedTheme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div>
            <h1 className="font-semibold text-lg">History</h1>
            <p className={`text-xs ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              View complete history
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNotificationOpen(true)}
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark" ? "bg-gray-900 hover:bg-gray-800" : "bg-gray-100 hover:bg-gray-200"
              } transition-colors`}
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
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search by ID, Name....."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>

            {/* History Cards */}
            <div className="space-y-3">
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${
                    resolvedTheme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-sm">{item.id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-200 ring-1 ring-blue-200/60 dark:ring-blue-500/30">
                          {item.type}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeTone(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">{item.details}</p>
                  <p className="text-xs text-gray-500 mb-3">Qty: {item.quantity}</p>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                </div>
              ))}
            </div>

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
                Previous
              </button>
              <span className="text-xs font-medium">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
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
              <h1 className="text-3xl font-semibold">History</h1>
              <p className={`text-sm ${resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                View and manage the complete history of point redemptions.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsNotificationOpen(true)}
                className={`p-2 rounded-lg ${
                  resolvedTheme === "dark" ? "bg-gray-900 hover:bg-gray-800" : "bg-gray-100 hover:bg-gray-200"
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
              className={`relative flex items-center ${
                resolvedTheme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"
              }`}
            >
              <Search className="absolute left-3 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search by ID, Name....."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 w-full ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-gray-700 text-white placeholder:text-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
          </div>

          {/* Table */}
          <div
            className={`border rounded-xl overflow-hidden shadow-sm ${
              resolvedTheme === "dark" ? "bg-neutral-900/80 border-neutral-800" : "bg-white border-gray-200"
            } transition-colors`}
          >
            <div className="px-6 py-4 border-b border-border/60 bg-muted/50 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recent approvals & rejections</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">{filteredItems.length} records</span>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60">
                  <TableHead className="min-w-[110px]">ID</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-28">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-32">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40">
                    <TableCell className="font-semibold">{item.id}</TableCell>
                    <TableCell>
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-200 ring-1 ring-blue-200/60 dark:ring-blue-500/30">
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.details}</TableCell>
                    <TableCell className="text-sm font-semibold">{item.quantity}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badgeTone(item.status)}`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
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
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
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

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`relative w-full max-w-md rounded-lg shadow-xl ${
              resolvedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">History Item</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.id}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold">{selectedItem.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeTone(selectedItem.status)}`}>
                  {selectedItem.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-semibold">{selectedItem.quantity}</span>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Details</p>
                <p className="font-semibold">{selectedItem.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavApprover />
    </div>
  );
}

export default ApproverHistory;
