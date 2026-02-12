import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  CheckCircle,
  Gift,
  Store,
  FileBox,
  Users,
  UserCircle,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/context/AuthContext";
import { ViewAccountModal } from "@/components/modals";
import { ThemeToggle } from "@/components/theme-toggle";
import oracleLogoMobile from "@/assets/oracle-logo-mb.png";

// ── Nav item type ──
export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

// ── Role-based nav configurations ──
const NAV_ITEMS: Record<string, NavItem[]> = {
  admin: [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin/dashboard" },
    { id: "accounts", label: "Accounts", icon: User, path: "/admin/accounts" },
    { id: "catalogue", label: "Catalogue", icon: Package, path: "/admin/catalogue" },
    { id: "distributors", label: "Distributors", icon: Store, path: "/admin/distributors" },
    { id: "customers", label: "Customers", icon: UserCircle, path: "/admin/customers" },
    { id: "teams", label: "Teams", icon: Users, path: "/admin/teams" },
    { id: "process-requests", label: "Process Requests", icon: ClipboardList, path: "/admin/redemption" },
    { id: "request-history", label: "Request History", icon: History, path: "/admin/request-history" },
    { id: "inventory", label: "Inventory", icon: Warehouse, path: "/admin/inventory" },
    { id: "marketing", label: "Marketing", icon: Megaphone, path: "/admin/marketing" },
  ],
  sales: [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/sales/dashboard" },
    { id: "redemption-status", label: "Redemption Status", icon: CheckCircle, path: "/sales/redemption-status" },
    { id: "redeem-items", label: "Redeem Items", icon: Gift, path: "/sales/redeem-items" },
  ],
  approver: [
    { id: "requests", label: "Requests", icon: FileBox, path: "/approver/requests" },
    { id: "history", label: "History", icon: History, path: "/approver/history" },
  ],
  marketing: [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/marketing/dashboard" },
    { id: "process-requests", label: "Process Requests", icon: ClipboardList, path: "/marketing/process-requests" },
    { id: "history", label: "History", icon: History, path: "/marketing/history" },
  ],
  reception: [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/reception/dashboard" },
    { id: "history", label: "History", icon: History, path: "/reception/history" },
  ],
  "executive-assistant": [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/executive-assistant/dashboard" },
    { id: "history", label: "History", icon: History, path: "/executive-assistant/history" },
  ],
};

/** Get nav items for a given user position string */
export function getNavItemsForRole(position: string): NavItem[] {
  const normalized = position.toLowerCase().trim();
  if (normalized === "admin" || normalized === "superadmin") return NAV_ITEMS.admin;
  if (normalized === "sales agent") return NAV_ITEMS.sales;
  if (normalized === "approver") return NAV_ITEMS.approver;
  if (normalized === "marketing") return NAV_ITEMS.marketing;
  if (normalized === "reception") return NAV_ITEMS.reception;
  if (normalized === "executive assistant") return NAV_ITEMS["executive-assistant"];
  return NAV_ITEMS.admin;
}

/** Get mobile nav items for a given user position string */
export function getMobileNavItemsForRole(position: string): NavItem[] {
  const items = getNavItemsForRole(position);
  // For mobile, show a subset (max 4 nav items + logout is handled separately)
  if (items.length <= 4) return items;
  // For admin, pick key items
  const normalized = position.toLowerCase().trim();
  if (normalized === "admin" || normalized === "superadmin") {
    return [
      items[0], // Dashboard
      items[1], // Accounts
      items[2], // Catalogue
      items[8], // Inventory
    ];
  }
  return items.slice(0, 4);
}

// ── Sidebar Component ──
interface AppSidebarProps {
  items?: NavItem[];
}

export function AppSidebar({ items }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const [username, setUsername] = useState<string | null>(() => {
    try { return localStorage.getItem("username"); } catch { return null; }
  });
  const [role, setRole] = useState<string | null>(() => {
    try { return localStorage.getItem("position"); } catch { return null; }
  });
  const [profilePicture, setProfilePicture] = useState<string | null>(() => {
    try { return localStorage.getItem("profilePicture"); } catch { return null; }
  });

  // Fallback nav items from stored role
  const navItems = items ?? getNavItemsForRole(role ?? "admin");

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "username") setUsername(e.newValue);
      if (e.key === "position") setRole(e.newValue);
      if (e.key === "profilePicture") setProfilePicture(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const currentPage = (() => {
    const path = location.pathname;
    const item = navItems.find((item) => path === item.path);
    return item?.id ?? navItems[0]?.id ?? "dashboard";
  })();

  return (
    <aside
      className={`hidden md:flex md:flex-col ${
        sidebarExpanded ? "md:w-60" : "md:w-20"
      } bg-sidebar border-r border-sidebar-border md:py-4 md:px-3 md:justify-between transition-all duration-300 ease-in-out`}
    >
      {/* Top: Logo + Nav */}
      <div className="space-y-4">
        {/* Logo and collapse toggle */}
        <div className="flex items-center justify-between mb-2 px-2">
          {sidebarExpanded && (
            <img
              src={oracleLogoMobile}
              alt="Oracle Petroleum"
              className="w-14 h-auto object-contain shrink-0"
              onError={(e) => {
                e.currentTarget.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="currentColor" font-size="10" font-family="sans-serif">ORACLE</text></svg>';
              }}
            />
          )}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-2 rounded-lg shrink-0 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarExpanded ? (
              <ChevronLeft className="h-5 w-5 shrink-0" />
            ) : (
              <Menu className="h-5 w-5 shrink-0" />
            )}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full flex items-center ${
                sidebarExpanded ? "gap-3 px-3" : "justify-center px-0"
              } py-2.5 rounded-lg font-medium transition-colors ${
                currentPage === id
                  ? "bg-foreground text-background shadow-sm"
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              }`}
              title={label}
            >
              <Icon className={`h-5 w-5 shrink-0 ${sidebarExpanded ? "" : "mx-auto"}`} />
              {sidebarExpanded && <span className="text-sm truncate">{label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom: User Profile + Theme + Logout */}
      <div className="space-y-3 border-t border-sidebar-border pt-3">
        <button
          onClick={() => setShowAccountModal(true)}
          className={`w-full flex items-center ${
            sidebarExpanded ? "gap-3 px-2" : "justify-center"
          } rounded-lg py-2 transition-colors hover:bg-sidebar-accent`}
        >
          <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 bg-muted ring-border">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={`${username}'s profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            <span className={`text-foreground font-semibold text-sm ${profilePicture ? "hidden" : ""}`}>
              {(username || "U").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="text-left">
              <p className="font-medium text-sm text-foreground">{username || "Guest"}</p>
              <p className="text-xs text-muted-foreground">{role || "User"}</p>
            </div>
          )}
        </button>
        <div className={`flex items-center ${sidebarExpanded ? "justify-between" : "justify-center"} gap-2`}>
          <ThemeToggle />
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 font-medium cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarExpanded && <span className="text-sm font-semibold">Log Out</span>}
          </Button>
        </div>
      </div>

      <ViewAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </aside>
  );
}
