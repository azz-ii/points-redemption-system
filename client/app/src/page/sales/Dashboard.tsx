import { useState } from "react";
import { useTheme } from "next-themes";
import { SidebarSales } from "@/components/sidebar/sidebar";
import { MobileBottomNavSales } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import RedemptionStatus from "@/page/sales/Redemption-Status";
import { Bell, Search, Truck } from "lucide-react";

interface DashboardProps {
  onLogout?: () => void;
}

interface Distributor {
  id: number;
  name: string;
  location: string;
  points: number;
}

function SalesDashboard({ onLogout }: DashboardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "redemption-status" | "redeem-items"
  >("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Sample distributor data
  const distributors: Distributor[] = [
    {
      id: 1,
      name: "Oracle Petroleum",
      location: "Cubao, PHI",
      points: 15000,
    },
    {
      id: 2,
      name: "Oracle Petroleum",
      location: "Cubao, PHI",
      points: 15000,
    },
    {
      id: 3,
      name: "Oracle Petroleum",
      location: "Cubao, PHI",
      points: 15000,
    },
    {
      id: 4,
      name: "Oracle Petroleum",
      location: "Cubao, PHI",
      points: 15000,
    },
  ];

  const filteredDistributors = distributors.filter(
    (dist) =>
      dist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dist.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (
    page: "dashboard" | "redemption-status" | "redeem-items"
  ) => {
    setCurrentPage(page);
  };

  // Route to Redemption Status full-page when selected
  if (currentPage === "redemption-status") {
    return (
      <RedemptionStatus
        onNavigate={handleNavigate}
        onLogout={onLogout}
        currentPage={currentPage}
      />
    );
  }

  return (
    <div className="flex h-screen">
      <SidebarSales
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />

      {/* Main Content */}
      <div
        className={`flex-1 overflow-y-auto pb-20 md:pb-0 ${
          isDark ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-8 md:pb-6">
          <div className="flex justify-between items-start mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 md:hidden rounded-full flex items-center justify-center ${
                  isDark ? "bg-green-600" : "bg-green-500"
                }`}
              >
                <span className="text-white font-semibold text-sm">J</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold mb-1">
                  Welcome, Jane<span className="hidden md:inline">!</span>
                </h1>
                <p
                  className={`text-xs md:text-base ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="md:hidden">Sales Agent</span>
                  <span className="hidden md:inline">
                    Manage points, track redemptions and redeem items
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Search and Delivery Button */}
          <div className="flex gap-2 md:gap-4 items-center mb-2 md:mb-8">
            <div
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border ${
                isDark
                  ? "bg-gray-900 border-gray-800"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Search
                className={`h-5 w-5 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search Distributors....."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${
                  isDark
                    ? "text-white placeholder-gray-500"
                    : "text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>
            <button
              className={`hidden md:flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                isDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              <Truck className="h-4 w-4" />
              <span>+ Delivery</span>
            </button>
          </div>

          {/* Mobile Delivery Button */}
          <div className="md:hidden mb-4">
            <button
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                isDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              <Truck className="h-4 w-4" />
              <span>+ Delivery</span>
            </button>
          </div>

          {/* Distributor Points Table */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">
              Distributer Points
            </h2>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredDistributors.length > 0 ? (
                filteredDistributors.map((distributor) => (
                  <div
                    key={distributor.id}
                    className={`rounded-lg border p-4 ${
                      isDark
                        ? "bg-gray-900 border-gray-800"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-base mb-1">
                          {distributor.name}
                        </h3>
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {distributor.location}
                        </p>
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          isDark
                            ? "text-white md:text-green-400"
                            : "text-white md:text-green-600"
                        }`}
                      >
                        {distributor.points.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={`rounded-lg border p-8 text-center ${
                    isDark
                      ? "bg-gray-900 border-gray-800 text-gray-500"
                      : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  No distributors found
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div
              className={`hidden md:block rounded-lg border overflow-hidden ${
                isDark ? "border-gray-800" : "border-gray-200"
              }`}
            >
              <table className="w-full">
                <thead className={isDark ? "bg-gray-900" : "bg-gray-50"}>
                  <tr>
                    <th
                      className={`px-6 py-4 text-left text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Distributor Name
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Location
                    </th>
                    <th
                      className={`px-6 py-4 text-left text-sm font-medium ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributors.length > 0 ? (
                    filteredDistributors.map((distributor) => (
                      <tr
                        key={distributor.id}
                        className={`border-t ${
                          isDark ? "border-gray-800" : "border-gray-200"
                        }`}
                      >
                        <td className="px-6 py-4 font-medium">
                          {distributor.name}
                        </td>
                        <td
                          className={`px-6 py-4 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {distributor.location}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {distributor.points.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className={`px-6 py-8 text-center ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        No distributors found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavSales
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={onLogout || (() => {})}
      />
    </div>
  );
}

export default SalesDashboard;
