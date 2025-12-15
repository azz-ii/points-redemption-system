import { useState } from "react";
import Login from "./page/login/Login";
import AdminDashboard from "./page/superadmin/Dashboard";
import ApproverDashboard from "./page/approver/Dashboard";
import ApproverHistory from "./page/approver/History";
import SalesDashboard from "./page/sales_agent/Dashboard";
import MarketingDashboard from "./page/marketing/Dashboard";
import MarketingHistory from "./page/marketing/History";
import ReceptionDashboard from "./page/reception/Dashboard";
import ReceptionHistory from "./page/reception/History";
import ExecutiveAssistantDashboard from "./page/executive_assistant/Dashboard";
import History from "./page/superadmin/History";
import Accounts from "./page/superadmin/Accounts";
import Catalogue from "./page/superadmin/Catalogue";
import Redemption from "./page/superadmin/Redemption";
import Inventory from "./page/superadmin/Inventory";

type PageType =
  | "login"
  | "dashboard"
  | "history"
  | "marketing-history"
  | "approver-history"
  | "accounts"
  | "catalogue"
  | "redemption"
  | "inventory";

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPosition, setUserPosition] = useState<string>("");

  const handleLoginSuccess = (position: string) => {
    setIsLoggedIn(true);
    setUserPosition(position);
    setCurrentPage("dashboard");
  };

  const handleNavigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserPosition("");
    setCurrentPage("login");
    try {
      localStorage.removeItem("username");
      localStorage.removeItem("position");
    } catch {
      // ignore storage errors
    }
  };

  // Show login if not authenticated
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Common props for all pages
  const pageProps = {
    onNavigate: handleNavigateTo,
    onLogout: handleLogout,
  };

  // Render dashboard based on user position
  if (currentPage === "dashboard") {
    // Render dashboard based on user position
    if (userPosition === "Sales Agent") {
      return <SalesDashboard onLogout={handleLogout} />;
    } else if (userPosition === "Approver") {
      return (
        <ApproverDashboard
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Marketing") {
      return (
        <MarketingDashboard
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Reception") {
      return (
        <ReceptionDashboard
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Executive Assistant") {
      return <ExecutiveAssistantDashboard onLogout={handleLogout} />;
    } else {
      // Admin or any other role defaults to SuperAdmin dashboard
      return (
        <SuperAdminDashboard
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    }
  }

  if (currentPage === "history") {
    // Render history based on user position
    if (userPosition === "Approver") {
      return (
        <ApproverHistory
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Marketing") {
      return (
        <MarketingHistory
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else if (userPosition === "Reception") {
      return (
        <ReceptionHistory
          onNavigate={handleNavigateTo}
          onLogout={handleLogout}
        />
      );
    } else {
      return <History onNavigate={handleNavigateTo} onLogout={handleLogout} />;
    }
  }

  if (currentPage === "approver-history") {
    return <ApproverHistory {...pageProps} />;
  }

  // Admin-only pages
  if (userPosition === "Admin") {
    switch (currentPage) {
      case "history":
        return <History {...pageProps} />;
      case "accounts":
        return <Accounts {...pageProps} />;
      case "catalogue":
        return <Catalogue {...pageProps} />;
      case "redemption":
        return <Redemption {...pageProps} />;
      case "inventory":
        return <Inventory {...pageProps} />;
    }
  }

  // Fallback for invalid page state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <button
          onClick={() => setCurrentPage("dashboard")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default App;
