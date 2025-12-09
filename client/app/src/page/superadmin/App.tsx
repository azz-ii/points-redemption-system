import { useState } from "react";
import Login from "../Login";
import Dashboard from "./Dashboard";
import History from "./History";

type PageType = "login" | "dashboard" | "history";

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

  return <Dashboard onNavigate={handleNavigateTo} onLogout={handleLogout} />;
}

export default App;
