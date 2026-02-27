import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isLoggedIn: boolean;
  userPosition: string;
  username: string;
  login: (position: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem("isLoggedIn") === "true";
    } catch {
      return false;
    }
  });

  const [userPosition, setUserPosition] = useState<string>(() => {
    try {
      return localStorage.getItem("position") || "";
    } catch {
      return "";
    }
  });

  const [username, setUsername] = useState<string>(() => {
    try {
      return localStorage.getItem("username") || "";
    } catch {
      return "";
    }
  });

  const login = (position: string, newUsername: string) => {
    setIsLoggedIn(true);
    setUserPosition(position);
    setUsername(newUsername);
    try {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("position", position);
      localStorage.setItem("username", newUsername);
    } catch {
      // ignore storage errors
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserPosition("");
    setUsername("");
    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("position");
    } catch {
      // ignore storage errors
    }
  };

  // Sync state with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isLoggedIn") {
        setIsLoggedIn(e.newValue === "true");
      }
      if (e.key === "position") {
        setUserPosition(e.newValue || "");
      }
      if (e.key === "username") {
        setUsername(e.newValue || "");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userPosition, username, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook to handle logout with navigation
export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return () => {
    logout();
    navigate("/login", { replace: true });
  };
}
