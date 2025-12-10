import { useTheme } from "next-themes";
import {
  Home,
  History as HistoryIcon,
  User,
  Package,
  ClipboardList,
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
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onNavigate(id as typeof currentPage)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            currentPage === id
              ? resolvedTheme === "dark"
                ? "bg-blue-600 text-white"
                : "bg-blue-100 text-blue-700"
              : resolvedTheme === "dark"
              ? "text-gray-200 hover:bg-gray-800"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Icon className="h-6 w-6" />
          <span className="text-xs">{label}</span>
        </button>
      ))}
    </nav>
  );
}
