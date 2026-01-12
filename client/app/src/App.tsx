import { useEffect, useState } from "react";
import Login from "./page/login/Login";
import ApproverDashboard from "./page/approver/Dashboard";
import ApproverRequests from "./page/approver/Requests/Requests";
import ApproverHistory from "./page/approver/History";
import SalesDashboard from "./page/sales_agent/Dashboard";
import MarketingDashboard from "./page/marketing/Dashboard";
import MarketingHistory from "./page/marketing/History";
import ReceptionDashboard from "./page/reception/Dashboard";
import ReceptionHistory from "./page/reception/History";
import ExecutiveAssistantDashboard from "./page/executive_assistant/Dashboard";
import ExecutiveAssistantHistory from "./page/executive_assistant/History";
import SuperAdminDashboard from "./page/superadmin/Dashboard";
import SuperAdminHistory from "./page/superadmin/History";
import Accounts from "./page/superadmin/Accounts/Accounts";
import Catalogue from "./page/superadmin/Catalogue/Catalogue";
import Redemption from "./page/superadmin/Redemption/Redemption";
import Inventory from "./page/superadmin/Inventory";
import Distributors from "./page/superadmin/Distributors/Distributors";
import Teams from "./page/superadmin/Teams/Teams";
import { Toaster } from "sonner";

type PageType =
  | "login"
  | "dashboard"
  | "history"
  | "marketing-history"
  | "approver-history"
  | "approver-requests"
  | "accounts"
  | "catalogue"
  | "redemption"
  | "inventory"
  | "distributors"
  | "teams";

const pageToPath: Record<PageType, string> = {
  login: "/",
  dashboard: "/dashboard",
  history: "/history",
  "marketing-history": "/marketing/history",
  "approver-history": "/approver/history",
  "approver-requests": "/approver/requests",
  accounts: "/accounts",
  catalogue: "/catalogue",
  redemption: "/redemption",
  inventory: "/inventory",
  distributors: "/distributors",
  teams: "/teams",
};

const normalizePath = (path: string) => {
  const url = new URL(path, window.location.origin);
  let clean = url.pathname.toLowerCase();
  if (clean.length > 1 && clean.endsWith("/")) clean = clean.slice(0, -1);
  return clean;
};

const resolvePageFromPath = (path: string): PageType => {
  const normalized = normalizePath(path);
  const match = (Object.keys(pageToPath) as PageType[]).find(
    (key) => pageToPath[key] === normalized
  );
  return match ?? "login";
};

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPosition, setUserPosition] = useState<string>("");

  const navigateToPage = (page: PageType, replace = false) => {
    setCurrentPage(page);
    const newPath = pageToPath[page] ?? "/";
    const normalizedNewPath = normalizePath(newPath);
    if (normalizePath(window.location.pathname) !== normalizedNewPath) {
      const fn = replace ? "replaceState" : "pushState";
      window.history[fn]({}, "", newPath);
    }
  };

  const handleLoginSuccess = (position: string) => {
    setIsLoggedIn(true);
    setUserPosition(position);
    try {
      localStorage.setItem("position", position);
    } catch {
      // ignore storage errors
    }
    navigateToPage("dashboard");
  };

  const handleNavigateTo = (page: PageType) => {
    navigateToPage(page);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserPosition("");
    navigateToPage("login");
    try {
      localStorage.removeItem("username");
      localStorage.removeItem("position");
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    // Sync initial load with URL and stored session details
    const readStoredPosition = () => {
      try {
        return localStorage.getItem("position") || "";
      } catch {
        return "";
      }
    };

    const storedPosition = readStoredPosition();

    if (storedPosition) setUserPosition(storedPosition);
    setIsLoggedIn(Boolean(storedPosition));

    const initialPageFromUrl = resolvePageFromPath(window.location.pathname);
    const initialPage = storedPosition
      ? initialPageFromUrl === "login"
        ? "dashboard"
        : initialPageFromUrl
      : "login";

    navigateToPage(initialPage, true);

    const handlePopState = () => {
      const pageFromUrl = resolvePageFromPath(window.location.pathname);
      const latestPosition = readStoredPosition();
      const authed = Boolean(latestPosition);

      if (!authed && pageFromUrl !== "login") {
        setIsLoggedIn(false);
        setUserPosition("");
        navigateToPage("login", true);
        return;
      }

      setUserPosition(latestPosition);
      setIsLoggedIn(authed);
      const targetPage = authed
        ? pageFromUrl === "login"
          ? "dashboard"
          : pageFromUrl
        : "login";
      setCurrentPage(targetPage);
      if (targetPage !== pageFromUrl) navigateToPage(targetPage, true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  let content;

  if (!isLoggedIn) {
    content = <Login onLoginSuccess={handleLoginSuccess} />;
  } else if (currentPage === "dashboard") {
    if (userPosition === "Sales Agent") {
      content = <SalesDashboard onLogout={handleLogout} />;
    } else if (userPosition === "Approver") {
      content = (
        <ApproverDashboard
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Marketing") {
      content = (
        <MarketingDashboard
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Reception") {
      content = (
        <ReceptionDashboard
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Executive Assistant") {
      content = (
        <ExecutiveAssistantDashboard
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else {
      // Admin or any other role defaults to SuperAdmin dashboard
      content = (
        <SuperAdminDashboard
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    }
  } else if (currentPage === "approver-requests") {
    if (userPosition === "Approver") {
      content = (
        <ApproverRequests
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else {
      content = (
        <ApproverDashboard
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    }
  } else if (currentPage === "history") {
    // Render history based on user position
    if (userPosition === "Approver") {
      content = (
        <ApproverHistory
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Marketing") {
      content = (
        <MarketingHistory
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Reception") {
      content = (
        <ReceptionHistory
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Executive Assistant") {
      content = (
        <ExecutiveAssistantHistory
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else {
      content = (
        <SuperAdminHistory
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    }
  } else if (currentPage === "marketing-history") {
    // Handle marketing-history page type
    content = (
      <MarketingHistory onNavigate={handleNavigateTo} onLogout={handleLogout} />
    );
  } else if (currentPage === "approver-history") {
    // Handle approver-history page type
    content = (
      <ApproverHistory onNavigate={handleNavigateTo} onLogout={handleLogout} />
    );
  } else if (
    userPosition === "Admin" ||
    userPosition === "SuperAdmin" ||
    userPosition === "admin"
  ) {
    switch (currentPage) {
      case "accounts":
        content = (
          <Accounts onNavigate={handleNavigateTo} onLogout={handleLogout} />
        );
        break;
      case "catalogue":
        content = (
          <Catalogue onNavigate={handleNavigateTo} onLogout={handleLogout} />
        );
        break;
      case "redemption":
        content = (
          <Redemption onNavigate={handleNavigateTo} onLogout={handleLogout} />
        );
        break;
      case "inventory":
        content = (
          <Inventory onNavigate={handleNavigateTo} onLogout={handleLogout} />
        );
        break;
      case "distributors":
        content = (
          <Distributors onNavigate={handleNavigateTo} onLogout={handleLogout} />
        );
        break;
      case "teams":
        content = (
          <Teams onNavigate={handleNavigateTo} onLogout={handleLogout} />
        );
        break;
      default:
        content = (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <button
                onClick={() => navigateToPage("dashboard")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
    }
  } else {
    // Fallback for invalid page state
    content = (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
          <button
            onClick={() => navigateToPage("dashboard")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {content}
      <Toaster />
    </>
  );
}

export default App;
