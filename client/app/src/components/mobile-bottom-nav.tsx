import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  Home,
  History as HistoryIcon,
  User,
  Package,
  ClipboardList,
  ClipboardCheck,
  Gift,
  LogOut,
  FileBox,
} from "lucide-react";

interface MobileBottomNavMarketingProps {
  currentPage: "dashboard" | "history";
  onNavigate: (page: "dashboard" | "history") => void;
  onLogout: () => void;
  isModalOpen?: boolean;
}

export function MobileBottomNavMarketing({
  currentPage,
  onNavigate,
  onLogout,
  isModalOpen = false,
}: MobileBottomNavMarketingProps) {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

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

  const navItems = [
    {
      id: "dashboard" as const,
      icon: Home,
      label: "Dashboard",
      action: undefined,
    },
    {
      id: "history" as const,
      icon: HistoryIcon,
      label: "History",
      action: undefined,
    },
    { id: "logout" as const, icon: LogOut, label: "Logout", action: onLogout },
  ];

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
        const isActive = !item.action && currentPage === item.id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={item.id}
            onClick={() =>
              item.action
                ? item.action()
                : onNavigate(item.id as typeof currentPage)
            }
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

interface MobileBottomNavReceptionProps {
  currentPage: "dashboard" | "history";
  onNavigate: (page: "dashboard" | "history") => void;
  onLogout: () => void;
  isModalOpen?: boolean;
}

export function MobileBottomNavReception({
  currentPage,
  onNavigate,
  onLogout,
  isModalOpen = false,
}: MobileBottomNavReceptionProps) {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

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

  const navItems = [
    {
      id: "dashboard" as const,
      icon: Home,
      label: "Dashboard",
      action: undefined,
    },
    {
      id: "history" as const,
      icon: HistoryIcon,
      label: "History",
      action: undefined,
    },
    { id: "logout" as const, icon: LogOut, label: "Logout", action: onLogout },
  ];

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
        const isActive = !item.action && currentPage === item.id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={item.id}
            onClick={() =>
              item.action
                ? item.action()
                : onNavigate(item.id as typeof currentPage)
            }
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

// Mobile Bottom Navigation for Executive Assistant Role
interface MobileBottomNavExecutiveAssistantProps {
  currentPage: "dashboard" | "history";
  onNavigate: (page: "dashboard" | "history") => void;
  onLogout: () => void;
  isModalOpen?: boolean;
}

export function MobileBottomNavExecutiveAssistant({
  currentPage,
  onNavigate,
  onLogout,
  isModalOpen = false,
}: MobileBottomNavExecutiveAssistantProps) {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Find the scrollable container (parent with overflow-y-auto)
    const scrollContainer =
      document.querySelector('[class*="overflow-y-auto"]') || window;
    let lastScrollYRef = 0;

    const handleScroll = () => {
      const currentScrollY =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollYRef) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
        setIsVisible(false);
      }

      lastScrollYRef = currentScrollY;
    };

    // Add scroll event listener
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

  const navItems = [
    {
      id: "dashboard" as const,
      icon: Home,
      label: "Dashboard",
      action: undefined,
    },
    {
      id: "history" as const,
      icon: HistoryIcon,
      label: "History",
      action: undefined,
    },
    { id: "logout" as const, icon: LogOut, label: "Logout", action: onLogout },
  ];

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
        const isActive = !item.action && currentPage === item.id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={item.id}
            onClick={() =>
              item.action
                ? item.action()
                : onNavigate(item.id as typeof currentPage)
            }
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

// Mobile Bottom Navigation for Sales Role
interface MobileBottomNavSalesProps {
  currentPage: "dashboard" | "redemption-status" | "redeem-items";
  onNavigate: (
    page: "dashboard" | "redemption-status" | "redeem-items"
  ) => void;
  onLogout: () => void;
  isModalOpen?: boolean;
}

export function MobileBottomNavSales({
  currentPage,
  onNavigate,
  onLogout,
  isModalOpen = false,
}: MobileBottomNavSalesProps) {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Find the scrollable container (parent with overflow-y-auto)
    const scrollContainer =
      document.querySelector('[class*="overflow-y-auto"]') || window;
    let lastScrollYRef = 0;

    const handleScroll = () => {
      const currentScrollY =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollYRef) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
        setIsVisible(false);
      }

      lastScrollYRef = currentScrollY;
    };

    // Add scroll event listener
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

  const navItems = [
    {
      id: "dashboard" as const,
      icon: Home,
      label: "Distributors",
      action: undefined,
    },
    {
      id: "redemption-status" as const,
      icon: ClipboardCheck,
      label: "Status",
      action: undefined,
    },
    {
      id: "redeem-items" as const,
      icon: Gift,
      label: "Redeem",
      action: undefined,
    },
    { id: "logout" as const, icon: LogOut, label: "Logout", action: onLogout },
  ];

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
        const isActive = !item.action && currentPage === item.id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={item.id}
            onClick={() =>
              item.action
                ? item.action()
                : onNavigate(item.id as typeof currentPage)
            }
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

// Mobile Bottom Navigation for Approver Role
interface MobileBottomNavApproverProps {
  currentPage: "dashboard" | "requests" | "history";
  onNavigate: (page: "dashboard" | "requests" | "history") => void;
  onLogout: () => void;
  isModalOpen?: boolean;
}

export function MobileBottomNavApprover({
  currentPage,
  onNavigate,
  onLogout,
  isModalOpen = false,
}: MobileBottomNavApproverProps) {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Find the scrollable container (parent with overflow-y-auto)
    const scrollContainer =
      document.querySelector('[class*="overflow-y-auto"]') || window;
    let lastScrollYRef = 0;

    const handleScroll = () => {
      const currentScrollY =
        scrollContainer === window
          ? window.scrollY
          : (scrollContainer as HTMLElement).scrollTop;

      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollYRef) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef && currentScrollY > 100) {
        setIsVisible(false);
      }

      lastScrollYRef = currentScrollY;
    };

    // Add scroll event listener
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

  const navItems = [
    {
      id: "dashboard" as const,
      icon: Home,
      label: "Dashboard",
      action: undefined,
    },
    {
      id: "requests" as const,
      icon: ClipboardList,
      label: "Requests",
      action: undefined,
    },
    {
      id: "history" as const,
      icon: HistoryIcon,
      label: "History",
      action: undefined,
    },
    { id: "logout" as const, icon: LogOut, label: "Logout", action: onLogout },
  ];

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
        const isActive = !item.action && currentPage === item.id;
        const activeClass = "bg-blue-600 text-white";
        const inactiveClass =
          resolvedTheme === "dark"
            ? "text-gray-200 hover:bg-gray-800"
            : "text-gray-700 hover:bg-gray-100";

        return (
          <button
            key={item.id}
            onClick={() =>
              item.action
                ? item.action()
                : onNavigate(item.id as typeof currentPage)
            }
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

// Generic Mobile Bottom Navigation for SuperAdmin pages
interface MobileBottomNavProps {
  currentPage:
    | "dashboard"
    | "history"
    | "accounts"
    | "catalogue"
    | "redemption"
    | "inventory"
    | "distributors";
  onNavigate: (
    page:
      | "dashboard"
      | "history"
      | "accounts"
      | "catalogue"
      | "redemption"
      | "inventory"
      | "distributors"
  ) => void;
  isModalOpen?: boolean;
}

export function MobileBottomNav({
  currentPage,
  onNavigate,
  isModalOpen = false,
}: MobileBottomNavProps) {
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);

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

  const navItems = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    { id: "history", icon: HistoryIcon, label: "History" },
    { id: "accounts", icon: User, label: "Accounts" },
    { id: "catalogue", icon: Package, label: "Catalogue" },
    { id: "redemption", icon: ClipboardList, label: "Redemption" },
  ] as const;

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
