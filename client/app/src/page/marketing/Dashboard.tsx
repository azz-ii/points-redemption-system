import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Megaphone } from "lucide-react";

interface DashboardProps {
  onLogout?: () => void;
}

function MarketingDashboard({ onLogout }: DashboardProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div
      className={`min-h-screen ${
        resolvedTheme === "dark"
          ? "bg-black text-white"
          : "bg-gray-50 text-gray-900"
      } transition-colors`}
    >
      {/* Header */}
      <div
        className={`border-b ${
          resolvedTheme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${
                  resolvedTheme === "dark" ? "bg-purple-600" : "bg-purple-500"
                } flex items-center justify-center`}
              >
                <Megaphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Marketing Dashboard</h1>
                <p
                  className={`text-sm ${
                    resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Role: Marketing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={onLogout}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  resolvedTheme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition-colors`}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className={`rounded-lg border ${
            resolvedTheme === "dark"
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          } p-12 text-center`}
        >
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
              resolvedTheme === "dark" ? "bg-purple-600/20" : "bg-purple-100"
            }`}
          >
            <Megaphone
              className={`h-10 w-10 ${
                resolvedTheme === "dark" ? "text-purple-400" : "text-purple-600"
              }`}
            />
          </div>
          <h2 className="text-3xl font-bold mb-3">Welcome to Marketing Dashboard</h2>
          <p
            className={`text-lg mb-8 ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Your role: <span className="font-semibold text-purple-500">Marketing</span>
          </p>
          <div
            className={`inline-block px-6 py-3 rounded-lg ${
              resolvedTheme === "dark"
                ? "bg-gray-800 text-gray-300"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Role-specific features coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketingDashboard;
