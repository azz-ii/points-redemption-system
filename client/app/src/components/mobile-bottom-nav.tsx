import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  History as HistoryIcon,
  User,
  Package,
  ClipboardCheck,
  Gift,
  LogOut,
  FileBox,
  Users,
} from "lucide-react";
import { useLogout } from "@/context/AuthContext";

export function MobileBottomNavMarketing({
  isModalOpen = false,
}: {
  isModalOpen?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [isVisible, setIsVisible] = useState(true);

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/marketing/dashboard" },
    { id: "process-requests", icon: ClipboardCheck, label: "Requests", path: "/marketing/process-requests" },
    { id: "history", icon: HistoryIcon, label: "History", path: "/marketing/history" },
    { id: "logout", icon: LogOut, label: "Logout", action: handleLogout },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes("/process-requests")) return "process-requests";
    if (path.includes("/history")) return "history";
    return "dashboard";
  };

  useEffect(() => {
    const scrollContainer =
      document.querySelector('[class*="overflow-y-auto"]') || window;
    let lastScrollYRef = 0;

    const handleScroll = () => {
      const currentScrollY =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      if (currentScrollY < lastScrollYRef) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
        setIsVisible(false);
      }

      lastScrollYRef = currentScrollY;
    };

    (scrollContainer as HTMLElement | Window).addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );
    return () =>
      (scrollContainer as HTMLElement | Window).removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const currentPage = getCurrentPage();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-3 border-t transition-transform duration-300 ${
        isVisible && !isModalOpen ? "translate-y-0" : "translate-y-full"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {navItems.map((item) => {
        const isActive = !("action" in item) && currentPage === item.id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={item.id}
            onClick={() => {
              if ("action" in item) {
                item.action();
              } else if ("path" in item) {
                navigate(item.path);
              }
            }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px] ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileBottomNavReception({
  isModalOpen = false,
}: {
  isModalOpen?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [isVisible, setIsVisible] = useState(true);

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/reception/dashboard" },
    { id: "history", icon: HistoryIcon, label: "History", path: "/reception/history" },
    { id: "logout", icon: LogOut, label: "Logout", action: handleLogout },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes("/history")) return "history";
    return "dashboard";
  };

  useEffect(() => {
    const scrollContainer =
      document.querySelector('[class*="overflow-y-auto"]') || window;
    let lastScrollYRef = 0;

    const handleScroll = () => {
      const currentScrollY =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      if (currentScrollY < lastScrollYRef) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
        setIsVisible(false);
      }

      lastScrollYRef = currentScrollY;
    };

    (scrollContainer as HTMLElement | Window).addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );
    return () =>
      (scrollContainer as HTMLElement | Window).removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const currentPage = getCurrentPage();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-3 border-t transition-transform duration-300 ${
        isVisible && !isModalOpen ? "translate-y-0" : "translate-y-full"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {navItems.map((item) => {
        const isActive = !("action" in item) && currentPage === item.id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={item.id}
            onClick={() => {
              if ("action" in item) {
                item.action();
              } else if ("path" in item) {
                navigate(item.path);
              }
            }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px] ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileBottomNavExecutiveAssistant({
  isModalOpen = false,
}: {
  isModalOpen?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [isVisible, setIsVisible] = useState(true);

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/executive-assistant/dashboard" },
    { id: "history", icon: HistoryIcon, label: "History", path: "/executive-assistant/history" },
    { id: "logout", icon: LogOut, label: "Logout", action: handleLogout },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes("/history")) return "history";
    return "dashboard";
  };

  useEffect(() => {
    const scrollContainer =
      document.querySelector('[class*="overflow-y-auto"]') || window;
    let lastScrollYRef = 0;

    const handleScroll = () => {
      const currentScrollY =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      if (currentScrollY < lastScrollYRef) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
        setIsVisible(false);
      }

      lastScrollYRef = currentScrollY;
    };

    (scrollContainer as HTMLElement | Window).addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );
    return () =>
      (scrollContainer as HTMLElement | Window).removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const currentPage = getCurrentPage();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-3 border-t transition-transform duration-300 ${
        isVisible && !isModalOpen ? "translate-y-0" : "translate-y-full"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {navItems.map((item) => {
        const isActive = !("action" in item) && currentPage === item.id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={item.id}
            onClick={() => {
              if ("action" in item) {
                item.action();
              } else if ("path" in item) {
                navigate(item.path);
              }
            }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px] ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileBottomNavSales({
  isModalOpen = false,
}: {
  isModalOpen?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [isVisible, setIsVisible] = useState(true);

  const navItems = [
    { id: "dashboard", icon: Home, label: "Distributors", path: "/sales/dashboard" },
    { id: "redemption-status", icon: ClipboardCheck, label: "Status", path: "/sales/redemption-status" },
    { id: "redeem-items", icon: Gift, label: "Redeem", path: "/sales/redeem-items" },
    { id: "logout", icon: LogOut, label: "Logout", action: handleLogout },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes("/redemption-status")) return "redemption-status";
    if (path.includes("/redeem-items")) return "redeem-items";
    return "dashboard";
  };

  useEffect(() => {
    const scrollContainer =
      document.querySelector('[class*="overflow-y-auto"]') || window;
    let lastScrollYRef = 0;

    const handleScroll = () => {
      const currentScrollY =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      if (currentScrollY < lastScrollYRef) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
        setIsVisible(false);
      }

      lastScrollYRef = currentScrollY;
    };

    (scrollContainer as HTMLElement | Window).addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );
    return () =>
      (scrollContainer as HTMLElement | Window).removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const currentPage = getCurrentPage();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-3 border-t transition-transform duration-300 ${
        isVisible && !isModalOpen ? "translate-y-0" : "translate-y-full"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {navItems.map((item) => {
        const isActive = !("action" in item) && currentPage === item.id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={item.id}
            onClick={() => {
              if ("action" in item) {
                item.action();
              } else if ("path" in item) {
                navigate(item.path);
              }
            }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px] ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileBottomNavApprover({
  isModalOpen = false,
}: {
  isModalOpen?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = useLogout();
  const [isVisible, setIsVisible] = useState(true);

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/approver/dashboard" },
    { id: "requests", icon: FileBox, label: "Requests", path: "/approver/requests" },
    { id: "history", icon: HistoryIcon, label: "History", path: "/approver/history" },
    { id: "logout", icon: LogOut, label: "Logout", action: handleLogout },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes("/requests")) return "requests";
    if (path.includes("/history")) return "history";
    return "dashboard";
  };

  useEffect(() => {
    const scrollContainer =
      document.querySelector('[class*="overflow-y-auto"]') || window;
    let lastScrollYRef = 0;

    const handleScroll = () => {
      const currentScrollY =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      if (currentScrollY < lastScrollYRef) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
        setIsVisible(false);
      }

      lastScrollYRef = currentScrollY;
    };

    (scrollContainer as HTMLElement | Window).addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );
    return () =>
      (scrollContainer as HTMLElement | Window).removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const currentPage = getCurrentPage();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-2 py-3 border-t transition-transform duration-300 ${
        isVisible && !isModalOpen ? "translate-y-0" : "translate-y-full"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {navItems.map((item) => {
        const isActive = !("action" in item) && currentPage === item.id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={item.id}
            onClick={() => {
              if ("action" in item) {
                item.action();
              } else if ("path" in item) {
                navigate(item.path);
              }
            }}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[60px] ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileBottomNav({
  isModalOpen = false,
}: {
  isModalOpen?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/admin/dashboard" },
    { id: "history", icon: HistoryIcon, label: "History", path: "/admin/history" },
    { id: "accounts", icon: User, label: "Accounts", path: "/admin/accounts" },
    { id: "catalogue", icon: Package, label: "Catalogue", path: "/admin/catalogue" },
    { id: "teams", icon: Users, label: "Teams", path: "/admin/teams" },
  ] as const;

  const getCurrentPage = () => {
    const path = location.pathname;
    const item = navItems.find((item) => path === item.path);
    return item?.id || "dashboard";
  };

  useEffect(() => {
    const scrollContainer =
      document.querySelector('[class*="overflow-y-auto"]') || window;
    let lastScrollYRef = 0;

    const handleScroll = () => {
      const currentScrollY =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      if (currentScrollY < lastScrollYRef) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
        setIsVisible(false);
      }

      lastScrollYRef = currentScrollY;
    };

    (scrollContainer as HTMLElement | Window).addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );
    return () =>
      (scrollContainer as HTMLElement | Window).removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  const currentPage = getCurrentPage();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center p-4 border-t transition-transform duration-300 ${
        isVisible && !isModalOpen ? "translate-y-0" : "translate-y-full"
      } ${
        resolvedTheme === "dark"
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {navItems.map(({ id, icon: Icon, label, path }) => {
        const isActive = currentPage === id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={id}
            onClick={() => navigate(path)}
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
