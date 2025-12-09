import { useState } from "react";
import Login from "./page/login/Login";
import Dashboard from "./page/superadmin/Dashboard";
import History from "./page/superadmin/History";
import Accounts from "./page/superadmin/Accounts";
import Catalogue from "./page/superadmin/Catalogue";
import Redemption from "./page/superadmin/Redemption";

type PageType =
  | "login"
  | "dashboard"
  | "history"
  | "accounts"
  | "catalogue"
  | "redemption";

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage("dashboard");
  };

  const handleNavigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("login");
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentPage === "dashboard") {
    return <Dashboard onNavigate={handleNavigateTo} onLogout={handleLogout} />;
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

  return <Dashboard onNavigate={handleNavigateTo} onLogout={handleLogout} />;
}

export default App;
