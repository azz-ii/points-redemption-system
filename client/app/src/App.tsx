import { useState } from "react";
import Login from "./page/login/Login";
import SuperAdminDashboard from "./page/superadmin/Dashboard";
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
  const [userPosition, setUserPosition] = useState<string>("Admin");

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
    setCurrentPage("login");
    try {
      localStorage.removeItem("username");
      localStorage.removeItem("position");
    } catch {
      // ignore
    }
  };

  // Debug: confirm React is mounting
  console.log(
    "App rendering - isLoggedIn:",
    isLoggedIn,
    "currentPage:",
    currentPage
  );

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentPage === "marketing-history") {
    return (
      <MarketingHistory onNavigate={handleNavigateTo} onLogout={handleLogout} />
    );
  }
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
    return (
      <ApproverHistory onNavigate={handleNavigateTo} onLogout={handleLogout} />
    );
  }

  if (currentPage === "accounts") {
    return <Accounts onNavigate={handleNavigateTo} onLogout={handleLogout} />;
  }

  if (currentPage === "catalogue") {
    return <Catalogue onNavigate={handleNavigateTo} onLogout={handleLogout} />;
  }

  if (currentPage === "redemption") {
    return <Redemption onNavigate={handleNavigateTo} onLogout={handleLogout} />;
  }

  if (currentPage === "inventory") {
    return <Inventory onNavigate={handleNavigateTo} onLogout={handleLogout} />;
  }

  // Fallback: default to SuperAdmin dashboard
  return (
    <SuperAdminDashboard
      onNavigate={handleNavigateTo}
      onLogout={handleLogout}
    />
  );
}

export default App;
