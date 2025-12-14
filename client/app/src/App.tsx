import { useState } from "react";
import Login from "./page/login/Login";
import AdminDashboard from "./page/superadmin/Dashboard";
import ApproverDashboard from "./page/approver/Dashboard";
import ApproverHistory from "./page/approver/History";
import SalesDashboard from "./page/sales_agent/Dashboard";
import MarketingDashboard from "./page/marketing/Dashboard";
import MarketingHistory from "./page/marketing/History";
import ReceptionDashboard from "./page/reception/Dashboard";
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
    switch (userPosition) {
      case "Admin":
        return <AdminDashboard {...pageProps} />;
      case "Sales Agent":
        return <SalesDashboard onLogout={handleLogout} />;
      case "Approver":
        return <ApproverDashboard {...pageProps} />;
      case "Marketing":
        return <MarketingDashboard {...pageProps} />;
      case "Reception":
        return <ReceptionDashboard onLogout={handleLogout} />;
      case "Executive Assistant":
        return <ExecutiveAssistantDashboard onLogout={handleLogout} />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Invalid Position</h1>
              <p className="mb-4">Your account position "{userPosition}" is not recognized.</p>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        );
    }
  }

  // Role-specific history pages
  if (currentPage === "marketing-history") {
    return <MarketingHistory {...pageProps} />;
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
