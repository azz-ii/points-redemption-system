import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import {
  Bell,
  Search,
  ChevronDown,
  Check,
  X,
  Pencil,
  Home,
  LogOut,
  History as HistoryIcon,
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
    page: "dashboard" | "history" | "accounts" | "catalogue"
  ) => void;
  onLogout?: () => void;
}

function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const { resolvedTheme } = useTheme();
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
  ]);

  const selectedFilter = "All Incoming Submission Request";
  const [searchQuery, setSearchQuery] = useState("");

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;
  const onBoardCount = 20;

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
          <ThemeToggle />
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
              {requests.map((request) => (
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
                className={`p-2 rounded-lg ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 hover:bg-gray-800"
                    : "bg-gray-100 hover:bg-gray-200"
                } transition-colors`}
              >
                <Bell className="h-6 w-6" />
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700 hover:bg-gray-800"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                } transition-colors`}
              >
                {selectedFilter}
                <ChevronDown className="h-4 w-4" />
              </button>
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                {requests.map((request) => (
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
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center p-4 border-t ${
          resolvedTheme === "dark"
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }`}
      >
        <button className="flex flex-col items-center gap-1">
          <Home className="h-6 w-6" />
          <span className="text-xs">Dashboard</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <HistoryIcon className="h-6 w-6" />
          <span className="text-xs">History</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <LogOut className="h-6 w-6" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
