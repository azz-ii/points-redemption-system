import { useTheme } from "next-themes";
import {
  Home,
  History as HistoryIcon,
  User,
  Package,
  ClipboardList,
  ClipboardCheck,
  Gift,
  LogOut,
} from "lucide-react";

interface MobileBottomNavProps {
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
}

export function MobileBottomNav({
  currentPage,
  onNavigate,
}: MobileBottomNavProps) {
  const { resolvedTheme } = useTheme();

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "history", icon: HistoryIcon, label: "History" },
    { id: "accounts", icon: User, label: "Accounts" },
    { id: "catalogue", icon: Package, label: "Catalogue" },
    { id: "redemption", icon: ClipboardList, label: "Redemption" },
  ] as const;

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center p-4 border-t ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {navItems.map(({ id, icon: Icon, label }) => {
        const isActive = currentPage === id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={id}
            onClick={() => onNavigate(id as typeof currentPage)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// Mobile Bottom Navigation for Sales Role
interface MobileBottomNavSalesProps {
  currentPage: "dashboard" | "redemption-status" | "redeem-items";
  onNavigate: (
    page: "dashboard" | "redemption-status" | "redeem-items"
  ) => void;
  onLogout: () => void;
}

export function MobileBottomNavSales({
  currentPage,
  onNavigate,
  onLogout,
}: MobileBottomNavSalesProps) {
  const { resolvedTheme } = useTheme();

  const navItems = [
    { id: "dashboard", icon: Home, label: "Distributors" },
    { id: "redemption-status", icon: ClipboardCheck, label: "Status" },
    { id: "redeem-items", icon: Gift, label: "Redeem" },
    { id: "logout", icon: LogOut, label: "Logout", action: onLogout },
  ] as const;

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 py-3 border-t ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {navItems.map(({ id, icon: Icon, label, action }) => {
        const isActive = currentPage === id && id !== "logout";
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={id}
            onClick={() =>
              action ? action() : onNavigate(id as typeof currentPage)
            }
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px] ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
