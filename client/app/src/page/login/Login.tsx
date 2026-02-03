import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import ForgotPassword from "./ForgotPassword";
import ActivateAccount from "./ActivateAccount";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showActivateAccount, setShowActivateAccount] = useState(false);
  const [activationUsername, setActivationUsername] = useState("");
  const { resolvedTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (position: string, profilePicture?: string | null) => {
    login(position, username, profilePicture);
    navigate("/dashboard", { replace: true });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetchWithCsrf(`${API_URL}/login/`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        
        // Check if user needs activation
        if (data.needs_activation) {
          setActivationUsername(data.username);
          setShowActivateAccount(true);
          return;
        }
        
        const position = data.position || "Admin";
        const profilePicture = data.profile_picture || null;
        setUsername("");
        setPassword("");
        toast.success("Login successful", {
          description: data.message || "Welcome back!"
        });
        setTimeout(() => handleLoginSuccess(position, profilePicture), 1000);
      } else {
        console.error("Login failed:", data);
        
        // Check if user is banned
        if (response.status === 403 && data.error && (data.error.includes("banned") || data.error.includes("activated"))) {
          let description = "";
          
          if (data.error.includes("not activated")) {
            description = data.detail || "Your account has not been activated.";
          } else if (data.is_permanent) {
            description = `Reason: ${data.ban_reason || "No reason provided"}\n\n${data.detail || "Your account has been permanently banned."}`;
          } else {
            const unbanDate = data.unban_date ? new Date(data.unban_date).toLocaleString() : "Unknown";
            description = `Reason: ${data.ban_reason || "No reason provided"}\n${data.detail || "Your account is temporarily banned."}\n\nUnban Date: ${unbanDate}`;
          }
          
          toast.error(data.error.includes("not activated") ? "Account Not Activated" : "Account Banned", {
            description
          });
        } else {
          toast.error("Access Denied", {
            description: data.error || data.detail || "Invalid credentials"
          });
        }
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      toast.error("Server Error", {
        description: "Unable to connect to authentication server"
      });
    }
  };

  return (
    <>
      {showActivateAccount ? (
        <ActivateAccount 
          username={activationUsername} 
          onActivationComplete={() => {
            setShowActivateAccount(false);
            setActivationUsername("");
          }}
          onAutoLogin={(position) => {
            // Auto-login user after successful activation
            setShowActivateAccount(false);
            setActivationUsername("");
            handleLoginSuccess(position);
          }}
        />
      ) : showForgotPassword ? (
        <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
      ) : (
        <div className="flex min-h-screen">
      {/* Left side - Image section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 transition-colors">
        {/* Building backdrop with low opacity */}
        <div className="absolute inset-0">
          <img
            src="/src/assets/building.jpg"
            alt="Building exterior"
            className="object-cover w-full h-full opacity-20 dark:opacity-30 transition-opacity"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-slate-200/50 to-slate-300/50 dark:from-slate-900/80 dark:to-slate-900/90 z-10 transition-colors" />

        {/* Centered Oracle Logo */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <img
            src="/src/assets/oracle-logo.png"
            alt="Oracle Petroleum"
            className="w-130 h-auto object-contain filter dark:filter-none brightness-75 dark:brightness-100 transition-all"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="sans-serif">ORACLE PETROLEUM</text></svg>';
            }}
          />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Theme toggle button */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="/src/assets/oracle-logo-mb.png"
              alt="Oracle Petroleum"
              className="w-48 h-auto object-contain filter dark:filter-none brightness-75 dark:brightness-100 transition-all"
              onError={(e) => {
                e.currentTarget.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="192" height="96"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666" font-size="20" font-family="sans-serif">ORACLE PETROLEUM</text></svg>';
              }}
            />
          </div>

          <div className="space-y-2">
            <h1
              className={`text-3xl font-semibold transition-colors ${
                resolvedTheme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Log In
            </h1>
            <p className="text-gray-800 dark:text-gray-400 text-sm transition-colors">
              Turn points into possibilities. Log in to track, discover, and
              redeem.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className={`transition-colors ${
                  resolvedTheme === "dark" ? "text-gray-300" : "text-black"
                }`}
              >
                Username
              </Label>
              <Input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white dark:bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-blue-500 dark:focus-visible:ring-gray-600 h-12 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={`transition-colors ${
                  resolvedTheme === "dark" ? "text-gray-300" : "text-black"
                }`}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white dark:bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-blue-500 dark:focus-visible:ring-gray-600 h-12 pr-10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cur"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className={`w-full h-12 font-medium transition-colors duration-200 cursor-pointer ${
                resolvedTheme === "dark"
                  ? "bg-white text-black hover:bg-gray-300"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              Log In
            </Button>
          </form>
        </div>
      </div>
        </div>
      )}
    </>
  );
}

export default Login;
