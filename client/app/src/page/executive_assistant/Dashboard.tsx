import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarExecutiveAssistant } from "@/components/sidebar";
import { MobileBottomNavExecutiveAssistant } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { Bell, Search, Check, X } from "lucide-react";

interface ApprovalItem {
  id: string;
  submitter: string;
  date: string;
  category: string;
  approvalStatus: "Pending" | "Approved" | "Rejected";
}

function ExecutiveAssistantDashboard() {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [approvalItems] = useState<ApprovalItem[]>([
    {
      id: "101",
      submitter: "Celestine Quizon",
      date: "12-10-2025",
      category: "Client Meal",
      approvalStatus: "Pending",
    },
  ]);

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <SidebarExecutiveAssistant />

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
              <span className="text-white font-semibold text-xs">J</span>
            </div>
            <span className="text-sm font-medium">Edit Approval Requests</span>
          </div>
          <div className="flex items-center gap-2">
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

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Welcome, Jane</h1>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Manage approval requests and redemptions
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

          {/* Search Bar */}
          <div className="mb-8">
            <div
              className={`relative flex items-center rounded-xl border-2 transition-all duration-300 hover:shadow-md focus-within:shadow-lg ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <Search
                className={`absolute left-4 h-5 w-5 ${
                  resolvedTheme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <Input
                placeholder="Search by ID, Name....."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-12 w-full h-12 text-base font-medium ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                    : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
                } focus:outline-none`}
              />
            </div>
          </div>

          {/* Edit Approval Requests Table */}
          <div
            className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700 shadow-xl"
                : "bg-white border-gray-200 shadow-soft"
            }`}
          >
            <div
              className={`px-8 py-6 border-b-2 bg-gradient-to-r ${
                resolvedTheme === "dark"
                  ? "border-gray-700 from-gray-800 to-gray-900"
                  : "border-gray-100 from-gray-50 to-white"
              }`}
            >
              <h2 className="text-xl font-bold tracking-tight">
                Edit Approval Requests
              </h2>
              <p
                className={`text-xs mt-1 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Manage pending approvals and requests
              </p>
            </div>
            <table className="w-full">
              <thead
                className={`${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 text-gray-300"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider">
                    <input type="checkbox" className="rounded cursor-pointer" />
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider">
                    Submitter
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-bold uppercase tracking-wider">
                    Approval Status
                  </th>
                  <th className="px-8 py-5 text-right text-xs font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  resolvedTheme === "dark"
                    ? "divide-gray-700"
                    : "divide-gray-100"
                }`}
              >
                {approvalItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-all duration-200 hover:shadow-sm`}
                  >
                    <td className="px-8 py-5">
                      <input
                        type="checkbox"
                        className="rounded cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="px-8 py-5 text-sm font-semibold text-brand">
                      {item.id}
                    </td>
                    <td className="px-8 py-5 text-sm font-medium">
                      {item.submitter}
                    </td>
                    <td className="px-8 py-5 text-sm">{item.date}</td>
                    <td className="px-8 py-5 text-sm">{item.category}</td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-transform duration-200 ${
                          item.approvalStatus === "Pending"
                            ? resolvedTheme === "dark"
                              ? "bg-yellow-900 text-yellow-200"
                              : "bg-yellow-100 text-yellow-800"
                            : item.approvalStatus === "Approved"
                            ? resolvedTheme === "dark"
                              ? "bg-green-900 text-green-200"
                              : "bg-green-100 text-green-800"
                            : resolvedTheme === "dark"
                            ? "bg-red-900 text-red-200"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.approvalStatus}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex gap-3 justify-end">
                        <button
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                          onClick={() => console.log("Confirm", item.id)}
                        >
                          <Check className="h-4 w-4" />
                          Confirm
                        </button>
                        <button
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                          onClick={() => console.log("Reject", item.id)}
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex-1 overflow-y-auto pb-20 p-4">
          <h2 className="text-2xl font-bold mb-6 tracking-tight">
            Edit Approval Requests
          </h2>
          <div
            className={`relative flex items-center rounded-xl border-2 mb-6 transition-all duration-300 ${
              resolvedTheme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <Search
              className={`absolute left-3 h-4 w-4 ${
                resolvedTheme === "dark" ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 w-full text-sm font-medium ${
                resolvedTheme === "dark"
                  ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                  : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4">
            {approvalItems.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-sm text-brand">{item.id}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.submitter}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                      item.approvalStatus === "Pending"
                        ? resolvedTheme === "dark"
                          ? "bg-yellow-900 text-yellow-200"
                          : "bg-yellow-100 text-yellow-800"
                        : item.approvalStatus === "Approved"
                        ? resolvedTheme === "dark"
                          ? "bg-green-900 text-green-200"
                          : "bg-green-100 text-green-800"
                        : resolvedTheme === "dark"
                        ? "bg-red-900 text-red-200"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.approvalStatus}
                  </span>
                </div>
                <div className="flex justify-between mb-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase font-semibold">
                      Date
                    </p>
                    <p className="font-semibold mt-1">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs uppercase font-semibold">
                      Category
                    </p>
                    <p className="font-semibold mt-1">{item.category}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-200 hover:shadow-lg active:scale-95 uppercase tracking-wide"
                    onClick={() => console.log("Confirm", item.id)}
                  >
                    <Check className="h-4 w-4" />
                    Confirm
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200 hover:shadow-lg active:scale-95 uppercase tracking-wide"
                    onClick={() => console.log("Reject", item.id)}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <NotificationPanel
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      </div>

      <MobileBottomNavExecutiveAssistant />
    </div>
  );
}

export default ExecutiveAssistantDashboard;
