import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/context/AuthContext";

export function Sidebar() {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin/dashboard" },
    { id: "accounts", label: "Accounts", icon: User, path: "/admin/accounts" },
    { id: "catalogue", label: "Catalogue", icon: Package, path: "/admin/catalogue" },
    { id: "distributors", label: "Distributors", icon: Store, path: "/admin/distributors" },
    { id: "customers", label: "Customers", icon: UserCircle, path: "/admin/customers" },
    { id: "teams", label: "Teams", icon: Users, path: "/admin/teams" },
    { id: "redemption", label: "Redemption", icon: ClipboardList, path: "/admin/redemption" },
    { id: "inventory", label: "Inventory", icon: Warehouse, path: "/admin/inventory" },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navItems.find((item) => path === item.path);
    return item?.id || "dashboard";
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "username") setUsername(e.newValue);
      if (e.key === "position") setRole(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const currentPage = getCurrentPage();

  return (
    <div
      className={`hidden md:flex md:flex-col md:${
        sidebarExpanded ? "w-52" : "w-20"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-r border-gray-700"
          : "bg-white border-r border-gray-100"
      } md:p-4 md:justify-between md:transition-all md:duration-500`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Top */}
      <div className="space-y-3">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between">
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
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
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
                <span className="transition-all duration-500 inline-block">
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
            <span className="text-white font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-500">
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
          onClick={handleLogout}
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
            <span className="transition-all duration-500 inline-block">
              Log Out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export function SidebarSuperAdmin() {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin/dashboard" },
    { id: "accounts", label: "Accounts", icon: User, path: "/admin/accounts" },
    { id: "catalogue", label: "Catalogue", icon: Package, path: "/admin/catalogue" },
    { id: "distributors", label: "Distributors", icon: Store, path: "/admin/distributors" },
    { id: "customers", label: "Customers", icon: UserCircle, path: "/admin/customers" },
    { id: "teams", label: "Teams", icon: Users, path: "/admin/teams" },
    { id: "redemption", label: "Redemption", icon: ClipboardList, path: "/admin/redemption" },
    { id: "inventory", label: "Inventory", icon: Warehouse, path: "/admin/inventory" },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navItems.find((item) => path === item.path);
    return item?.id || "dashboard";
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "username") setUsername(e.newValue);
      if (e.key === "position") setRole(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const currentPage = getCurrentPage();

  return (
    <div
      className={`hidden md:flex md:flex-col md:${
        sidebarExpanded ? "w-52" : "w-20"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-r border-gray-700"
          : "bg-white border-r border-gray-100"
      } md:p-4 md:justify-between md:transition-all md:duration-500`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Top */}
      <div className="space-y-3">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between">
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
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
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
                <span className="transition-all duration-500 inline-block">
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
            <span className="text-white font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-500">
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
          onClick={handleLogout}
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
            <span className="transition-all duration-500 inline-block">
              Log Out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export function SidebarSales() {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/sales/dashboard" },
    { id: "redemption-status", label: "Redemption Status", icon: CheckCircle, path: "/sales/redemption-status" },
    { id: "redeem-items", label: "Redeem Items", icon: Gift, path: "/sales/redeem-items" },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navItems.find((item) => path === item.path);
    return item?.id || "dashboard";
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "username") setUsername(e.newValue);
      if (e.key === "position") setRole(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const currentPage = getCurrentPage();

  return (
    <div
      className={`hidden md:flex md:flex-col md:${
        sidebarExpanded ? "w-52" : "w-20"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-r border-gray-700"
          : "bg-white border-r border-gray-100"
      } md:p-4 md:justify-between md:transition-all md:duration-500`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Top */}
      <div className="space-y-3">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between">
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
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
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
                <span className="transition-all duration-500 inline-block">
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
            <span className="text-white font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-500">
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
          onClick={handleLogout}
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
            <span className="transition-all duration-500 inline-block">
              Log Out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export function SidebarApprover() {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/approver/dashboard" },
    { id: "requests", label: "Requests", icon: FileBox, path: "/approver/requests" },
    { id: "history", label: "History", icon: History, path: "/approver/history" },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navItems.find((item) => path === item.path);
    return item?.id || "dashboard";
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "username") setUsername(e.newValue);
      if (e.key === "position") setRole(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const currentPage = getCurrentPage();

  return (
    <div
      className={`hidden md:flex md:flex-col md:${
        sidebarExpanded ? "w-52" : "w-20"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-r border-gray-700"
          : "bg-white border-r border-gray-100"
      } md:p-4 md:justify-between md:transition-all md:duration-500`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Top */}
      <div className="space-y-3">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between">
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
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
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
                <span className="transition-all duration-500 inline-block">
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
            <span className="text-white font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-500">
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
          onClick={handleLogout}
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
            <span className="transition-all duration-500 inline-block">
              Log Out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export function SidebarMarketing() {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/marketing/dashboard" },
    { id: "history", label: "History", icon: History, path: "/marketing/history" },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navItems.find((item) => path === item.path);
    return item?.id || "dashboard";
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "username") setUsername(e.newValue);
      if (e.key === "position") setRole(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const currentPage = getCurrentPage();

  return (
    <div
      className={`hidden md:flex md:flex-col md:${
        sidebarExpanded ? "w-52" : "w-20"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-r border-gray-700"
          : "bg-white border-r border-gray-100"
      } md:p-4 md:justify-between md:transition-all md:duration-500`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Top */}
      <div className="space-y-3">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between">
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
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
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
                <span className="transition-all duration-500 inline-block">
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
              resolvedTheme === "dark" ? "bg-purple-600" : "bg-purple-500"
            } flex items-center justify-center`}
          >
            <span className="text-white font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-500">
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
          onClick={handleLogout}
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
            <span className="transition-all duration-500 inline-block">
              Log Out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export function SidebarReception() {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/reception/dashboard" },
    { id: "history", label: "History", icon: History, path: "/reception/history" },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navItems.find((item) => path === item.path);
    return item?.id || "dashboard";
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "username") setUsername(e.newValue);
      if (e.key === "position") setRole(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const currentPage = getCurrentPage();

  return (
    <div
      className={`hidden md:flex md:flex-col md:${
        sidebarExpanded ? "w-52" : "w-20"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-r border-gray-700"
          : "bg-white border-r border-gray-100"
      } md:p-4 md:justify-between md:transition-all md:duration-500`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Top */}
      <div className="space-y-3">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between">
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
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
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
                <span className="transition-all duration-500 inline-block">
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
            <span className="text-white font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-500">
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
          onClick={handleLogout}
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
            <span className="transition-all duration-500 inline-block">
              Log Out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

export function SidebarExecutiveAssistant() {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/executive-assistant/dashboard" },
    { id: "history", label: "History", icon: History, path: "/executive-assistant/history" },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navItems.find((item) => path === item.path);
    return item?.id || "dashboard";
  };

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "username") setUsername(e.newValue);
      if (e.key === "position") setRole(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const currentPage = getCurrentPage();

  return (
    <div
      className={`hidden md:flex md:flex-col md:${
        sidebarExpanded ? "w-52" : "w-20"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-r border-gray-700"
          : "bg-white border-r border-gray-100"
      } md:p-4 md:justify-between md:transition-all md:duration-500`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      onMouseEnter={() => setSidebarExpanded(true)}
      onMouseLeave={() => setSidebarExpanded(false)}
    >
      {/* Top */}
      <div className="space-y-3">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between">
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
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
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
                <span className="transition-all duration-500 inline-block">
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
            <span className="text-white font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-500">
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
          onClick={handleLogout}
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
            <span className="transition-all duration-500 inline-block">
              Log Out
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

