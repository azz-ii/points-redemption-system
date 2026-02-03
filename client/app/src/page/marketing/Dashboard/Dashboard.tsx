import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarMarketing } from "@/components/sidebar";
import { MobileBottomNavMarketing } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  Search,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CampaignItem {
  id: string;
  agent: string;
  details: string;
  quantity: number;
  status: "Pending" | "Approved" | "Rejected";
}

function MarketingDashboard() {
  const _navigate = useNavigate();
  const _handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"incoming" | "handled">("incoming");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editItem, setEditItem] = useState<CampaignItem | null>(null);
  const [campaigns] = useState<CampaignItem[]>([
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
  ]);

  const pageSize = 5;
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      campaign.id.toLowerCase().includes(query) ||
      campaign.agent.toLowerCase().includes(query) ||
      campaign.details.toLowerCase().includes(query) ||
      campaign.status.toLowerCase().includes(query)
    );
  });

  const pendingCount = campaigns.filter((c) => c.status === "Pending").length;
  const approvedCount = campaigns.filter((c) => c.status === "Approved").length;
  const onBoardCount = 20;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCampaigns.length / pageSize)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <SidebarMarketing />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div
          className={`md:hidden sticky top-0 z-40 p-4 flex justify-between items-center border-b ${
            resolvedTheme === "dark"
              ? "bg-gray-0 border-gray-0"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full ${
                resolvedTheme === "dark" ? "bg-purple-600" : "bg-purple-500"
              } flex items-center justify-center`}
            >
              <span className="text-white font-semibold text-xs">M</span>
            </div>
            <span className="font-medium text-sm">Marketing Dashboard</span>
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
                placeholder="Search....."
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

            {/* Mobile Filter Dropdown */}
            <div className="relative mb-6">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-300"
                } transition-colors`}
              >
                <span className="font-semibold text-sm">
                  {viewMode === "incoming"
                    ? "All Incoming Submission Request"
                    : "Handled Items"}
                </span>
                <ChevronLeft
                  className={`h-4 w-4 transition-transform ${
                    isDropdownOpen ? "rotate-90" : "-rotate-90"
                  }`}
                />
              </button>
              {isDropdownOpen && (
                <div
                  className={`absolute top-full mt-2 left-0 w-full rounded-lg border shadow-lg z-50 ${
                    resolvedTheme === "dark"
                      ? "bg-gray-900 border-gray-700"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <button
                    onClick={() => {
                      setViewMode("incoming");
                      setIsDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-3 hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors first:rounded-t-lg`}
                  >
                    All Incoming Submission Request
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("handled");
                      setIsDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-3 hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors last:rounded-b-lg`}
                  >
                    Handled Items
                  </button>
                </div>
              )}
            </div>

            {/* Campaign Cards */}
            <div className="space-y-3">
              {paginatedCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={`p-4 rounded-lg border ${
                    resolvedTheme === "dark"
                      ? "bg-gray-900 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {viewMode === "incoming" ? (
                    // Incoming Request Card
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-sm">{campaign.id}</p>
                          <p className="text-xs text-gray-500">
                            {campaign.agent}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === "Pending"
                              ? "bg-yellow-400 text-black"
                              : campaign.status === "Approved"
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-2">
                        {campaign.details}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Qty: {campaign.quantity}
                      </p>
                      <div className="flex flex-col gap-2">
                        <button className="w-full py-2.5 rounded bg-green-500 text-white hover:bg-green-600 text-sm font-semibold transition-colors">
                          Accept
                        </button>
                        <button className="w-full py-2.5 rounded bg-red-500 text-white hover:bg-red-600 text-sm font-semibold transition-colors">
                          Reject
                        </button>
                      </div>
                    </>
                  ) : (
                    // Handled Items Card
                    <>
                      <div className="mb-3">
                        <p className="text-xs text-gray-400">{campaign.id}</p>
                        <p className="font-semibold text-base mt-1">T-Shirt</p>
                        <p className="text-sm text-gray-500">
                          {campaign.details}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`flex items-center gap-2 text-xs font-semibold ${
                            campaign.status === "Pending"
                              ? "text-yellow-400"
                              : campaign.status === "Approved"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {campaign.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          2025-12-31
                        </span>
                      </div>
                      <button
                        onClick={() => setEditItem(campaign)}
                        className="w-full py-2.5 rounded bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 text-sm font-semibold transition-colors"
                      >
                        Edit Details
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Pagination */}
            <div className="flex justify-between items-center mt-6">
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
              <span className="text-sm">
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
              <h1 className="text-3xl font-semibold">Welcome, Marketing</h1>
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
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700 hover:bg-gray-800"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                } transition-colors`}
              >
                {viewMode === "incoming"
                  ? "All Incoming Submission Request"
                  : "Handled Items"}
                <ChevronLeft
                  className={`h-4 w-4 transition-transform ${
                    isDropdownOpen ? "rotate-90" : "-rotate-90"
                  }`}
                />
              </button>
              {isDropdownOpen && (
                <div
                  className={`absolute top-full mt-2 left-0 min-w-[250px] rounded-lg border shadow-lg z-50 ${
                    resolvedTheme === "dark"
                      ? "bg-gray-900 border-gray-700"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <button
                    onClick={() => {
                      setViewMode("incoming");
                      setIsDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors first:rounded-t-lg`}
                  >
                    All Incoming Submission Request
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("handled");
                      setIsDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors last:rounded-b-lg`}
                  >
                    Handled Items
                  </button>
                </div>
              )}
            </div>
            <div className="relative max-w-md flex-1 ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search....."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 h-10 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
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
                  {viewMode === "handled" && (
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Type
                    </th>
                  )}
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
                {paginatedCampaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className={`hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4 text-sm">{campaign.id}</td>
                    {viewMode === "handled" && (
                      <td className="px-6 py-4">
                        <span className="inline-block rounded-full px-2 py-1 text-xs font-semibold bg-green-500 text-white">
                          T-shirt
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm">{campaign.details}</td>
                    <td className="px-6 py-4 text-sm">{campaign.quantity}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === "Pending"
                            ? "bg-yellow-400 text-black"
                            : campaign.status === "Approved"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    {viewMode === "incoming" ? (
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
                      </td>
                    ) : (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setEditItem(campaign)}
                          className="px-3 py-1 rounded bg-yellow-500 text-black hover:bg-yellow-600 transition-colors text-sm font-semibold"
                        >
                          Edit Details
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Desktop Pagination */}
            <div
              className={`flex justify-between items-center px-6 py-4 border-t ${
                resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border border-gray-700 hover:bg-gray-700"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <span className="text-sm">
                Page {safePage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, safePage + 1))
                }
                disabled={safePage === totalPages}
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 border border-gray-700 hover:bg-gray-700"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Edit Account Modal */}
        {editItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className={`relative w-full max-w-md rounded-lg shadow-xl ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-50 text-gray-900"
              }`}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">Edit Item</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Update item quantity for {editItem.details}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditItem(null)}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">ID</label>
                  <input
                    type="text"
                    value={editItem.id}
                    disabled
                    className={`w-full px-4 py-3 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-500"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    } cursor-not-allowed`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={editItem.details}
                    disabled
                    className={`w-full px-4 py-3 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-500"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    } cursor-not-allowed`}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Item Type
                  </label>
                  <input
                    type="text"
                    value="T-shirt"
                    disabled
                    className={`w-full px-4 py-3 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700 text-gray-500"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    } cursor-not-allowed`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    defaultValue={editItem.quantity}
                    min="1"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              {/* Footer Button */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    // Handle update logic here
                    setEditItem(null);
                  }}
                  className="w-full py-3 rounded-lg bg-white text-gray-900 hover:bg-gray-100 font-semibold transition-colors"
                >
                  Update Item
                </button>
              </div>
            </div>
          </div>
        )}

        <NotificationPanel
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      </div>

      <MobileBottomNavMarketing />
    </div>
  );
}

export default MarketingDashboard;
