import { useState } from "react";
import Login from "./page/login/Login";
import SuperAdminDashboard from "./page/superadmin/Dashboard";
import SupportDashboard from "./page/support/Dashboard";
import SalesDashboard from "./page/sales/Dashboard";
import MarketingDashboard from "./page/marketing/Dashboard";
import History from "./page/superadmin/History";
import Accounts from "./page/superadmin/Accounts";
import Catalogue from "./page/superadmin/Catalogue";
import Redemption from "./page/superadmin/Redemption";
import Inventory from "./page/superadmin/Inventory";

type PageType =
  | "login"
  | "dashboard"
  | "history"
  | "accounts"
  | "catalogue"
  | "redemption"
  | "inventory";

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPosition, setUserPosition] = useState<UserPosition>("Admin");

  const handleLoginSuccess = (position: string) => {
    setIsLoggedIn(true);
    setUserPosition(position as UserPosition);
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

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentPage === "dashboard") {
    // Render dashboard based on user position
    if (userPosition === "Support") {
      return <SupportDashboard onLogout={handleLogout} />;
    } else if (userPosition === "Sales") {
      return <SalesDashboard onLogout={handleLogout} />;
    } else if (userPosition === "Marketing") {
      return <MarketingDashboard onLogout={handleLogout} />;
    } else {
      // Admin or any other role defaults to SuperAdmin dashboard
      return <SuperAdminDashboard onNavigate={handleNavigateTo} onLogout={handleLogout} />;
    }
  }

  if (currentPage === "history") {
    return <History onNavigate={handleNavigateTo} onLogout={handleLogout} />;
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

  return <Dashboard onNavigate={handleNavigateTo} onLogout={handleLogout} />;
}

export default App;
