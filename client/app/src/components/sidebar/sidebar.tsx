import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  LogOut,
  Home,
  History,
  ChevronLeft,
  Menu,
  User,
  Package,
  ClipboardList,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentPage:
    | "dashboard"
    | "history"
    | "accounts"
    | "catalogue"
    | "redemption"
    | "inventory";
  onNavigate: (
    page:
      | "dashboard"
      | "history"
      | "accounts"
      | "catalogue"
      | "redemption"
      | "inventory"
  ) => void;
  onLogout: () => void;
}

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const { resolvedTheme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [username, setUsername] = useState<string | null>(() => {
    try {
      return localStorage.getItem("username");
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState<string | null>(() => {
    try {
      return localStorage.getItem("position");
    } catch {
      return null;
    }
  });

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "history", label: "History", icon: History },
    { id: "accounts", label: "Accounts", icon: User },
    { id: "catalogue", label: "Catalogue", icon: Package },
    { id: "redemption", label: "Redemption", icon: ClipboardList },
    { id: "inventory", label: "Inventory", icon: Warehouse },
  ] as const;

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "username") setUsername(e.newValue);
      if (e.key === "position") setRole(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div
      className={`hidden md:flex md:flex-col md:${
        sidebarExpanded ? "w-52" : "w-20"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-r border-gray-700"
          : "bg-white border-r border-gray-100"
      } md:p-4 md:justify-between md:transition-all md:duration-300 md:ease-in-out`}
    >
      {/* Top */}
      <div className="space-y-3">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-center">
          {sidebarExpanded && (
            <img
              src="/src/assets/oracle-logo-mb.png"
              alt="Oracle Petroleum"
              className="w-12 h-auto object-contain shrink-0"
              onError={(e) => {
                e.currentTarget.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="currentColor" font-size="10" font-family="sans-serif">ORACLE</text></svg>';
              }}
            />
          )}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`p-2 rounded-lg shrink-0 ${
              resolvedTheme === "dark"
                ? "hover:bg-gray-800"
                : "hover:bg-gray-100"
            } transition-colors`}
            title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarExpanded ? (
              <ChevronLeft className="h-5 w-5 shrink-0" />
            ) : (
              <Menu className="h-5 w-5 shrink-0" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-3">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center ${
                sidebarExpanded ? "gap-3" : "justify-center"
              } px-4 py-2 rounded-lg font-medium ${
                currentPage === id
                  ? resolvedTheme === "dark"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-900"
                  : resolvedTheme === "dark"
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              } transition-colors`}
              title={label}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarExpanded && (
                <span className="transition-all duration-300 inline-block">
                  {label}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom - User Profile */}
      <div className="space-y-4">
        <div
          className={`flex items-center ${
            sidebarExpanded ? "gap-3" : "justify-center"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full shrink-0 ${
              resolvedTheme === "dark" ? "bg-green-600" : "bg-green-500"
            } flex items-center justify-center`}
          >
            <span className="text-white font-semibold text-sm">{(username || "I").charAt(0).toUpperCase()}</span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-300">
              <p className="font-medium text-sm">{username || "Guest"}</p>
              <p
                className={`text-xs ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {role || "User"}
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={onLogout}
          className={`w-full flex items-center ${
            sidebarExpanded ? "justify-center" : "justify-center"
          } gap-2 ${
            resolvedTheme === "dark"
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-gray-900 text-white hover:bg-gray-700"
          } transition-colors cursor-pointer`}
          title="Log Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarExpanded && (
            <span className="transition-all duration-300 inline-block">
              Log Out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
