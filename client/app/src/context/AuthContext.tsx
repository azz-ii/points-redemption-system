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
  profilePicture: string | null;
  login: (position: string, username: string, profilePicture?: string | null) => void;
  logout: () => void;
  updateProfilePicture: (profilePicture: string | null) => void;
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

  const [profilePicture, setProfilePicture] = useState<string | null>(() => {
    try {
      return localStorage.getItem("profilePicture");
    } catch {
      return null;
    }
  });

  const login = (position: string, newUsername: string, newProfilePicture?: string | null) => {
    setIsLoggedIn(true);
    setUserPosition(position);
    setUsername(newUsername);
    setProfilePicture(newProfilePicture || null);
    try {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("position", position);
      localStorage.setItem("username", newUsername);
      if (newProfilePicture) {
        localStorage.setItem("profilePicture", newProfilePicture);
      } else {
        localStorage.removeItem("profilePicture");
      }
    } catch {
      // ignore storage errors
    }
  };

  const updateProfilePicture = (newProfilePicture: string | null) => {
    setProfilePicture(newProfilePicture);
    try {
      if (newProfilePicture) {
        localStorage.setItem("profilePicture", newProfilePicture);
      } else {
        localStorage.removeItem("profilePicture");
      }
      // Dispatch storage event to sync across components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'profilePicture',
        newValue: newProfilePicture,
        oldValue: localStorage.getItem('profilePicture'),
      }));
    } catch {
      // ignore storage errors
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserPosition("");
    setUsername("");
    setProfilePicture(null);
    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("position");
      localStorage.removeItem("profilePicture");
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
      if (e.key === "profilePicture") {
        setProfilePicture(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userPosition, username, profilePicture, login, logout, updateProfilePicture }}
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
