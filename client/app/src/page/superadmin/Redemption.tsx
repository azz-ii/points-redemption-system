import { useState } from "react";
import { useTheme } from "next-themes";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { NotificationPanel } from "@/components/notification-panel";
import { Bell, Search, Sliders, Filter, Warehouse, LogOut } from "lucide-react";

interface RedemptionItem {
  id: string;
  name: string;
  type: string;
  points: number;
}

interface RedemptionProps {
  onNavigate?: (
    page:
      | "dashboard"
      | "history"
      | "accounts"
      | "catalogue"
      | "redemption"
      | "inventory"
  ) => void;
  onLogout?: () => void;
}

function Redemption({ onNavigate, onLogout }: RedemptionProps) {
  const { resolvedTheme } = useTheme();
  const currentPage = "redemption";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [items] = useState<RedemptionItem[]>([
    { id: "MC3001", name: "Platinum Polo", type: "Apparel", points: 500 },
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div
      className={`flex flex-col min-h-screen md:flex-row ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      <Sidebar
        currentPage="redemption"
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
            <span className="text-sm font-medium">Izza</span>
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

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-y-auto md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold">Redemption Request</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsNotificationOpen(true)}
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

          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div
              className={`relative flex items-center rounded-md border ${
                resolvedTheme === "dark"
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-300"
              } w-full max-w-xl flex-1`}
            >
              <Search className="absolute left-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-3 py-3 text-sm ${
                  resolvedTheme === "dark"
                    ? "bg-transparent border-0 text-white placeholder:text-gray-500"
                    : "bg-white border-0 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                    : "bg-black border-black text-white hover:bg-gray-900"
                }`}
              >
                <Sliders className="h-4 w-4" />
              </button>
              <button
                className={`px-4 py-2 rounded-lg border font-semibold inline-flex items-center gap-2 transition-colors ${
                  resolvedTheme === "dark"
                    ? "bg-white text-gray-900 border-gray-300 hover:bg-gray-200"
                    : "bg-black text-white border-black hover:bg-gray-900"
                }`}
              >
                New Request
              </button>
            </div>
          </div>

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
                    ? "bg-slate-800 text-gray-200"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">ID</th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Item Name
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Points</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`${
                  resolvedTheme === "dark"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-800">
                    <td className="px-5 py-4 align-middle">{item.id}</td>
                    <td className="px-5 py-4 align-middle">{item.name}</td>
                    <td className="px-5 py-4 align-middle">{item.type}</td>
                    <td className="px-5 py-4 align-middle">{item.points}</td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex gap-2 justify-end">
                        <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2">
                          View
                        </button>
                        <button
                          className={`px-4 py-2 rounded font-semibold text-sm flex items-center gap-2 ${
                            resolvedTheme === "dark"
                              ? "bg-gray-600 hover:bg-gray-700 text-white"
                              : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                          }`}
                        >
                          Edit
                        </button>
                        <button className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center gap-2">
                          Delete
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
        <div className="md:hidden flex-1 overflow-y-auto p-4 pb-24 space-y-4">
          <h2 className="text-2xl font-semibold">Redemption Request</h2>
          <div
            className={`relative flex items-center rounded-lg border ${
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
          <div className="flex gap-2">
            <button
              className={`flex-1 p-3 rounded-lg border text-sm font-semibold ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-black border-black text-white"
              } transition-colors flex items-center justify-center gap-2`}
            >
              <Sliders className="h-4 w-4" />
              Filter
            </button>
            <button
              className={`flex-1 p-3 rounded-lg border text-sm font-semibold ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } transition-colors flex items-center justify-center gap-2`}
            >
              <Filter className="h-4 w-4" />
              Sort
            </button>
          </div>
          <button
            className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 border transition-colors font-semibold text-sm ${
              resolvedTheme === "dark"
                ? "bg-white text-gray-900 border-gray-300 hover:bg-gray-200"
                : "bg-black text-white border-black hover:bg-gray-900"
            }`}
          >
            New Request
          </button>

          <div
            className={`border rounded-lg overflow-hidden ${
              resolvedTheme === "dark"
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            } transition-colors`}
          >
            <div
              className={`px-4 py-2 text-xs font-semibold border-b ${
                resolvedTheme === "dark"
                  ? "text-gray-400 border-gray-700"
                  : "text-gray-600 border-gray-200"
              }`}
            >
              HISTORY
            </div>
            <div className="divide-y divide-gray-700">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold">{item.id}</p>
                    <p className="text-xs text-gray-400">{item.name}</p>
                  </div>
                  <button
                    className={`text-xs font-semibold underline ${
                      resolvedTheme === "dark"
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-yellow-700 hover:text-yellow-800"
                    } transition-colors self-center`}
                  >
                    View details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav
        currentPage={currentPage}
        onNavigate={onNavigate || (() => {})}
      />
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}

export default Redemption;
