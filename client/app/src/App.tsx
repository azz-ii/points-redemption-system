import { useState } from "react";
import Login from "./page/login/Login";
import ApproverDashboard from "./page/approver/Dashboard";
import ApproverRequests from "./page/approver/Requests";
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
import Redemption from "./page/superadmin/Redemption";
import Inventory from "./page/superadmin/Inventory";
import Distributors from "./page/superadmin/Distributors";
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
                onClick={() => setCurrentPage("dashboard")}
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
            onClick={() => setCurrentPage("dashboard")}
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
