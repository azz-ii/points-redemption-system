import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useLogout } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarReception } from "@/components/sidebar";
import { MobileBottomNavReception } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import {
  Bell,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";

interface ServiceItem {
  id: string;
  employee: string;
  vehicle: string;
  date: string;
  driverStatus: "With Driver" | "Without Driver" | "Pending";
  approvalStatus: "Pending" | "Approved" | "Rejected";
}

function ReceptionDashboard() {
  const _navigate = useNavigate();
  const _handleLogout = useLogout();
  const { resolvedTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceItems] = useState<ServiceItem[]>([
    {
      id: "DV-330021",
      employee: "Raham Tresvalles",
      vehicle: "L-3000",
      date: "12-10-2025",
      driverStatus: "With Driver",
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
      <SidebarReception />

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
              <span className="text-white font-semibold text-xs">J</span>
            </div>
            <span className="text-sm font-medium">Service Vehicle Status</span>
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

          {/* Search + Actions Row */}
          <div className="mb-6 flex items-center gap-4">
            <div
              className={`relative flex items-center flex-1 max-w-xl rounded-lg border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-300"
              }`}
            >
              <Search className="absolute left-3 h-5 w-5 text-gray-500" />
              <Input
                placeholder="Search Distributors....."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 w-full h-12 text-base ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                    : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Service Vehicle Status Table */}
          <div
            className={`border rounded-lg overflow-hidden ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            } transition-colors`}
          >
            <div
              className={`px-6 py-4 border-b ${
                resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h2 className="text-xl font-semibold">Service Vehicle Status</h2>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Driver Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Approval Status
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
                {serviceItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:${
                      resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4 text-sm">{item.id}</td>
                    <td className="px-6 py-4 text-sm">{item.employee}</td>
                    <td className="px-6 py-4 text-sm">{item.date}</td>
                    <td className="px-6 py-4 text-sm">{item.vehicle}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.driverStatus === "With Driver"
                            ? "bg-green-500 text-white"
                            : item.driverStatus === "Without Driver"
                            ? "bg-red-500 text-white"
                            : "bg-yellow-400 text-black"
                        }`}
                      >
                        {item.driverStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                          item.approvalStatus === "Pending"
                            ? "bg-yellow-400 text-black"
                            : item.approvalStatus === "Approved"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {item.approvalStatus === "Pending" && (
                          <Clock className="h-3 w-3" />
                        )}
                        {item.approvalStatus === "Approved" && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {item.approvalStatus === "Rejected" && (
                          <XCircle className="h-3 w-3" />
                        )}
                        {item.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className={`px-3 py-1 rounded-md text-sm ${
                            resolvedTheme === "dark"
                              ? "bg-green-600 hover:bg-green-500 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          ✓ Confirm
                        </button>
                        <button
                          className={`px-3 py-1 rounded-md text-sm ${
                            resolvedTheme === "dark"
                              ? "bg-red-600 hover:bg-red-500 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          ✗ Reject
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
          <h2 className="text-2xl font-semibold mb-4">
            Service Vehicle Status
          </h2>
          <div
            className={`relative flex items-center rounded-lg border mb-4 ${
              resolvedTheme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            <Search className="absolute left-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 w-full text-sm ${
                resolvedTheme === "dark"
                  ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                  : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3">
            {serviceItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm">{item.id}</p>
                    <p className="text-xs text-gray-500">{item.employee}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.approvalStatus === "Pending"
                        ? "bg-yellow-400 text-black"
                        : item.approvalStatus === "Approved"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.approvalStatus}
                  </span>
                </div>

                <p className="text-base font-semibold mb-1">{item.vehicle}</p>
                <p className="text-sm text-gray-500 mb-3">Date: {item.date}</p>

                <div className="mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.driverStatus === "With Driver"
                        ? "bg-green-500 text-white"
                        : item.driverStatus === "Without Driver"
                        ? "bg-red-500 text-white"
                        : "bg-yellow-400 text-black"
                    }`}
                  >
                    {item.driverStatus}
                  </span>
                </div>

                {item.approvalStatus === "Pending" && (
                  <div className="space-y-2">
                    <button
                      className="w-full py-1.5 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
                      onClick={() => {
                        // Handle accept
                        console.log("Accepted:", item.id);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="w-full py-1.5 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                      onClick={() => {
                        // Handle reject
                        console.log("Rejected:", item.id);
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <NotificationPanel
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
        />
      </div>

      <MobileBottomNavReception />
    </div>
  );
}

export default ReceptionDashboard;
