import { useState } from "react";
import Login from "../Login";
import Dashboard from "./Dashboard";
import History from "./History";
import Accounts from "./Accounts";
import Catalogue from "./Catalogue";
import Redemption from "./Redemption";
import Inventory from "./Inventory";

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

  if (currentPage === "inventory") {
    return <Inventory onNavigate={handleNavigateTo} onLogout={handleLogout} />;
  }

  return <Dashboard onNavigate={handleNavigateTo} onLogout={handleLogout} />;
}

export default App;
