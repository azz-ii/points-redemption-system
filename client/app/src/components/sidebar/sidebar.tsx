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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/context/AuthContext";
import { ViewAccountModal } from "@/components/modals";
import oracleLogoMobile from "@/assets/oracle-logo-mb.png";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
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
  const [showAccountModal, setShowAccountModal] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/admin/dashboard",
    },
    { id: "accounts", label: "Accounts", icon: User, path: "/admin/accounts" },
    {
      id: "catalogue",
      label: "Catalogue",
      icon: Package,
      path: "/admin/catalogue",
    },
    {
      id: "distributors",
      label: "Distributors",
      icon: Store,
      path: "/admin/distributors",
    },
    {
      id: "customers",
      label: "Customers",
      icon: UserCircle,
      path: "/admin/customers",
    },
    { id: "teams", label: "Teams", icon: Users, path: "/admin/teams" },
    {
      id: "process-requests",
      label: "Process Requests",
      icon: ClipboardList,
      path: "/admin/redemption",
    },
    {
      id: "request-history",
      label: "Request History",
      icon: History,
      path: "/admin/request-history",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Warehouse,
      path: "/admin/inventory",
    },
    {
      id: "marketing",
      label: "Handler",
      icon: Megaphone,
      path: "/admin/marketing",
    },
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
        sidebarExpanded ? "w-60" : "w-20"
      } bg-sidebar border-r-2 border-sidebar-border shadow-sm md:py-4 md:px-3 md:justify-between md:transition-all md:duration-300 md:ease-in-out`}
    >
      {/* Top */}
      <div className="space-y-4">
        {/* Logo and Toggle */}
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
            className={`p-2 rounded-lg shrink-0 hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all`}
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
        <nav className="space-y-1">
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full flex items-center ${
                sidebarExpanded ? "gap-3 px-3" : "justify-center px-0"
              } py-2.5 rounded-lg font-medium transition-all ${
                currentPage === id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
              title={label}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "" : "mx-auto"
                }`}
              />
              {sidebarExpanded && (
                <span className="text-sm truncate">{label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom - User Profile */}
      <div
        className="space-y-3 border-t pt-3 border-border"
      >
        <button
          onClick={() => setShowAccountModal(true)}
          className={`w-full flex items-center ${
            sidebarExpanded ? "gap-3 px-2" : "justify-center"
          } rounded-lg py-2 transition-all hover:bg-sidebar-accent`}
        >
          <div
            className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 bg-primary ring-primary/30`}
          >
            <span className="text-primary-foreground font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-300 text-left">
              <p className="font-medium text-sm">{username || "Guest"}</p>
              <p
                className="text-xs text-muted-foreground"
              >
                {role || "User"}
              </p>
            </div>
          )}
        </button>
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 font-medium bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
          title="Log Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarExpanded && (
            <span className="text-sm font-semibold">Log Out</span>
          )}
        </Button>
      </div>

      <ViewAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </div>
  );
}

export function SidebarSuperAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
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
  const [showAccountModal, setShowAccountModal] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/admin/dashboard",
    },
    { id: "accounts", label: "Accounts", icon: User, path: "/admin/accounts" },
    {
      id: "catalogue",
      label: "Catalogue",
      icon: Package,
      path: "/admin/catalogue",
    },
    {
      id: "distributors",
      label: "Distributors",
      icon: Store,
      path: "/admin/distributors",
    },
    {
      id: "customers",
      label: "Customers",
      icon: UserCircle,
      path: "/admin/customers",
    },
    { id: "teams", label: "Teams", icon: Users, path: "/admin/teams" },
    {
      id: "process-requests",
      label: "Process Requests",
      icon: ClipboardList,
      path: "/admin/redemption",
    },
    {
      id: "request-history",
      label: "Request History",
      icon: History,
      path: "/admin/request-history",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Warehouse,
      path: "/admin/inventory",
    },
    {
      id: "marketing",
      label: "Handler",
      icon: Megaphone,
      path: "/admin/marketing",
    },
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
        sidebarExpanded ? "w-60" : "w-20"
      } bg-sidebar border-r-2 border-sidebar-border shadow-sm md:py-4 md:px-3 md:justify-between md:transition-all md:duration-300 md:ease-in-out`}
    >
      {/* Top */}
      <div className="space-y-4">
        {/* Logo and Toggle */}
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
            className={`p-2 rounded-lg shrink-0 hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all`}
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
        <nav className="space-y-1">
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full flex items-center ${
                sidebarExpanded ? "gap-3 px-3" : "justify-center px-0"
              } py-2.5 rounded-lg font-medium transition-all ${
                currentPage === id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
              title={label}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "" : "mx-auto"
                }`}
              />
              {sidebarExpanded && (
                <span className="text-sm truncate">{label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom - User Profile */}
      <div
        className="space-y-3 border-t pt-3 border-border"
      >
        <button
          onClick={() => setShowAccountModal(true)}
          className={`w-full flex items-center ${
            sidebarExpanded ? "gap-3 px-2" : "justify-center"
          } rounded-lg py-2 transition-all hover:bg-sidebar-accent`}
        >
          <div
            className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 bg-primary ring-primary/30`}
          >
            <span className="text-primary-foreground font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-300 text-left">
              <p className="font-medium text-sm">{username || "Guest"}</p>
              <p
                className="text-xs text-muted-foreground"
              >
                {role || "User"}
              </p>
            </div>
          )}
        </button>
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 font-medium bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
          title="Log Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarExpanded && (
            <span className="text-sm font-semibold">Log Out</span>
          )}
        </Button>
      </div>

      <ViewAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </div>
  );
}

export function SidebarSales() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
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
  const [showAccountModal, setShowAccountModal] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/sales/dashboard",
    },
    {
      id: "redemption-status",
      label: "Redemption Status",
      icon: CheckCircle,
      path: "/sales/redemption-status",
    },
    {
      id: "redeem-items",
      label: "Redeem Items",
      icon: Gift,
      path: "/sales/redeem-items",
    },
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
        sidebarExpanded ? "w-60" : "w-20"
      } bg-sidebar border-r-2 border-sidebar-border shadow-sm md:py-4 md:px-3 md:justify-between md:transition-all md:duration-300 md:ease-in-out`}
    >
      {/* Top */}
      <div className="space-y-4">
        {/* Logo and Toggle */}
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
            className={`p-2 rounded-lg shrink-0 hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all`}
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
        <nav className="space-y-1">
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full flex items-center ${
                sidebarExpanded ? "gap-3 px-3" : "justify-center px-0"
              } py-2.5 rounded-lg font-medium transition-all ${
                currentPage === id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
              title={label}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "" : "mx-auto"
                }`}
              />
              {sidebarExpanded && (
                <span className="text-sm truncate">{label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom - User Profile */}
      <div
        className="space-y-3 border-t pt-3 border-border"
      >
        <button
          onClick={() => setShowAccountModal(true)}
          className={`w-full flex items-center ${
            sidebarExpanded ? "gap-3 px-2" : "justify-center"
          } rounded-lg py-2 transition-all hover:bg-sidebar-accent`}
        >
          <div
            className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 bg-primary ring-primary/30`}
          >
            <span className="text-primary-foreground font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-300 text-left">
              <p className="font-medium text-sm">{username || "Guest"}</p>
              <p
                className="text-xs text-muted-foreground"
              >
                {role || "User"}
              </p>
            </div>
          )}
        </button>
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 font-medium bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
          title="Log Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarExpanded && (
            <span className="text-sm font-semibold">Log Out</span>
          )}
        </Button>
      </div>

      <ViewAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </div>
  );
}

export function SidebarApprover() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
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
  const [showAccountModal, setShowAccountModal] = useState(false);

  const navItems = [
    {
      id: "requests",
      label: "Requests",
      icon: FileBox,
      path: "/approver/requests",
    },
    {
      id: "history",
      label: "History",
      icon: History,
      path: "/approver/history",
    },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navItems.find((item) => path === item.path);
    return item?.id || "requests";
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
        sidebarExpanded ? "w-60" : "w-20"
      } bg-sidebar border-r-2 border-sidebar-border shadow-sm md:py-4 md:px-3 md:justify-between md:transition-all md:duration-300 md:ease-in-out`}
    >
      {/* Top */}
      <div className="space-y-4">
        {/* Logo and Toggle */}
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
            className={`p-2 rounded-lg shrink-0 hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all`}
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
        <nav className="space-y-1">
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full flex items-center ${
                sidebarExpanded ? "gap-3 px-3" : "justify-center px-0"
              } py-2.5 rounded-lg font-medium transition-all ${
                currentPage === id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
              title={label}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "" : "mx-auto"
                }`}
              />
              {sidebarExpanded && (
                <span className="text-sm truncate">{label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom - User Profile */}
      <div
        className="space-y-3 border-t pt-3 border-border"
      >
        <button
          onClick={() => setShowAccountModal(true)}
          className={`w-full flex items-center ${
            sidebarExpanded ? "gap-3 px-2" : "justify-center"
          } rounded-lg py-2 transition-all hover:bg-sidebar-accent`}
        >
          <div
            className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 bg-primary ring-primary/30`}
          >
            <span className="text-primary-foreground font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-300 text-left">
              <p className="font-medium text-sm">{username || "Guest"}</p>
              <p
                className="text-xs text-muted-foreground"
              >
                {role || "User"}
              </p>
            </div>
          )}
        </button>
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 font-medium bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
          title="Log Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarExpanded && (
            <span className="text-sm font-semibold">Log Out</span>
          )}
        </Button>
      </div>

      <ViewAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </div>
  );
}

export function SidebarMarketing() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
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
  const [showAccountModal, setShowAccountModal] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/handler/dashboard",
    },
    {
      id: "process-requests",
      label: "Process Requests",
      icon: ClipboardList,
      path: "/handler/process-requests",
    },
    {
      id: "history",
      label: "History",
      icon: History,
      path: "/handler/history",
    },
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
        sidebarExpanded ? "w-60" : "w-20"
      } bg-sidebar border-r-2 border-sidebar-border shadow-sm md:py-4 md:px-3 md:justify-between md:transition-all md:duration-300 md:ease-in-out`}
    >
      {/* Top */}
      <div className="space-y-4">
        {/* Logo and Toggle */}
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
            className={`p-2 rounded-lg shrink-0 hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all`}
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
        <nav className="space-y-1">
          {navItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`w-full flex items-center ${
                sidebarExpanded ? "gap-3 px-3" : "justify-center px-0"
              } py-2.5 rounded-lg font-medium transition-all ${
                currentPage === id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
              title={label}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  sidebarExpanded ? "" : "mx-auto"
                }`}
              />
              {sidebarExpanded && (
                <span className="text-sm truncate">{label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom - User Profile */}
      <div
        className="space-y-3 border-t pt-3 border-border"
      >
        <button
          onClick={() => setShowAccountModal(true)}
          className={`w-full flex items-center ${
            sidebarExpanded ? "gap-3 px-2" : "justify-center"
          } rounded-lg py-2 transition-all hover:bg-sidebar-accent`}
        >
          <div
            className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 bg-primary ring-primary/30`}
          >
            <span className="text-primary-foreground font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-300 text-left">
              <p className="font-medium text-sm">{username || "Guest"}</p>
              <p
                className="text-xs text-muted-foreground"
              >
                {role || "User"}
              </p>
            </div>
          )}
        </button>
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
          title="Log Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarExpanded && (
            <span className="text-sm font-semibold">Log Out</span>
          )}
        </Button>
      </div>

      <ViewAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </div>
  );
}

export function SidebarReception() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
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
  const [showAccountModal, setShowAccountModal] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/reception/dashboard",
    },
    {
      id: "history",
      label: "History",
      icon: History,
      path: "/reception/history",
    },
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
        sidebarExpanded ? "w-60" : "w-20"
      } bg-sidebar border-r-2 border-sidebar-border shadow-sm md:py-4 md:px-3 md:justify-between md:transition-all md:duration-300 md:ease-in-out`}
    >
      {/* Top */}
      <div className="space-y-4">
        {/* Logo and Toggle */}
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
            className={`p-2 rounded-lg shrink-0 hover:bg-sidebar-accent transition-colors`}
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
                sidebarExpanded ? "gap-3 px-2" : "justify-center"
              } px-4 py-2 rounded-lg font-medium ${
                currentPage === id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              } transition-colors`}
              title={label}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarExpanded && (
                <span className="text-sm font-semibold">{label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom - User Profile */}
      <div
        className="space-y-3 border-t pt-3 border-border"
      >
        <button
          onClick={() => setShowAccountModal(true)}
          className={`w-full flex items-center ${
            sidebarExpanded ? "gap-3 px-2" : "justify-center"
          } rounded-lg py-2 transition-all hover:bg-sidebar-accent`}
        >
          <div
            className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 bg-primary ring-primary/30`}
          >
            <span className="text-primary-foreground font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-300 text-left">
              <p className="font-medium text-sm">{username || "Guest"}</p>
              <p
                className="text-xs text-muted-foreground"
              >
                {role || "User"}
              </p>
            </div>
          )}
        </button>
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 font-medium bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
          title="Log Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarExpanded && (
            <span className="text-sm font-semibold">Log Out</span>
          )}
        </Button>
      </div>

      <ViewAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </div>
  );
}

export function SidebarExecutiveAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
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
  const [showAccountModal, setShowAccountModal] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/executive-assistant/dashboard",
    },
    {
      id: "history",
      label: "History",
      icon: History,
      path: "/executive-assistant/history",
    },
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
        sidebarExpanded ? "w-60" : "w-20"
      } bg-sidebar border-r-2 border-sidebar-border shadow-sm md:py-4 md:px-3 md:justify-between md:transition-all md:duration-300 md:ease-in-out`}
    >
      {/* Top */}
      <div className="space-y-4">
        {/* Logo and Toggle */}
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
            className={`p-2 rounded-lg shrink-0 hover:bg-sidebar-accent transition-colors`}
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
                sidebarExpanded ? "gap-3 px-2" : "justify-center"
              } px-4 py-2 rounded-lg font-medium ${
                currentPage === id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              } transition-colors`}
              title={label}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarExpanded && (
                <span className="text-sm font-semibold">{label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom - User Profile */}
      <div
        className="space-y-3 border-t pt-3 border-border"
      >
        <button
          onClick={() => setShowAccountModal(true)}
          className={`w-full flex items-center ${
            sidebarExpanded ? "gap-3 px-2" : "justify-center"
          } rounded-lg py-2 transition-all hover:bg-sidebar-accent`}
        >
          <div
            className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden ring-2 bg-primary ring-primary/30`}
          >
            <span className="text-primary-foreground font-semibold text-sm">
              {(username || "I").charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarExpanded && (
            <div className="transition-all duration-300 text-left">
              <p className="font-medium text-sm">{username || "Guest"}</p>
              <p
                className="text-xs text-muted-foreground"
              >
                {role || "User"}
              </p>
            </div>
          )}
        </button>
        <Button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 font-medium bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
          title="Log Out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarExpanded && (
            <span className="text-sm font-semibold">Log Out</span>
          )}
        </Button>
      </div>

      <ViewAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </div>
  );
}
