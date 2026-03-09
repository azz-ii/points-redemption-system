import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import { resetForceLogoutFlag, abortPendingRequests } from "@/lib/fetch-interceptor";
import { queryClient } from "@/lib/query-client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface AuthContextType {
  isLoggedIn: boolean;
  userPosition: string;
  username: string;
  canSelfRequest: boolean;
  login: (position: string, username: string, canSelfRequest?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
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

  const [canSelfRequest, setCanSelfRequest] = useState<boolean>(() => {
    try {
      return localStorage.getItem("canSelfRequest") === "true";
    } catch {
      return false;
    }
  });

  const [showForceLogoutModal, setShowForceLogoutModal] = useState(false);

  const login = (position: string, newUsername: string, newCanSelfRequest?: boolean) => {
    abortPendingRequests();
    resetForceLogoutFlag();
    setIsLoggedIn(true);
    setUserPosition(position);
    setUsername(newUsername);
    setCanSelfRequest(!!newCanSelfRequest);
    try {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("position", position);
      localStorage.setItem("username", newUsername);
      localStorage.setItem("canSelfRequest", newCanSelfRequest ? "true" : "false");
    } catch {
      // ignore storage errors
    }
  };

  const logout = () => {
    queryClient.clear();
    setIsLoggedIn(false);
    setUserPosition("");
    setUsername("");
    setCanSelfRequest(false);
    try {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      localStorage.removeItem("position");
      localStorage.removeItem("canSelfRequest");
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
      if (e.key === "canSelfRequest") {
        setCanSelfRequest(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Listen for force-logout events dispatched by fetchWithCsrf on 401 responses.
  useEffect(() => {
    const handleForceLogout = () => setShowForceLogoutModal(true);
    window.addEventListener("force-logout", handleForceLogout);
    return () => window.removeEventListener("force-logout", handleForceLogout);
  }, []);

  const handleForceLogoutConfirm = () => {
    setShowForceLogoutModal(false);
    abortPendingRequests();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userPosition, username, canSelfRequest, login, logout }}
    >
      {children}
      <AlertDialog open={showForceLogoutModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>New Login Detected</AlertDialogTitle>
            <AlertDialogDescription>
              Your account was signed in from another device or location. You
              have been logged out of this session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleForceLogoutConfirm}>
              Log In Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

  return async () => {
    // Cancel any in-flight requests from the old session before logout
    abortPendingRequests();
    // Call server-side logout to flush the session
    try {
      await fetchWithCsrf(`${API_URL}/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Server unreachable — still clear local state
    }
    logout();
    navigate("/login", { replace: true });
  };
}
