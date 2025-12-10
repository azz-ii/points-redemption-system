import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface LoginProps {
  onLoginSuccess?: (position: string) => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const { resolvedTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        setMessage(`✅ Access Granted: ${data.message || "Login successful"}`);
        setUsername("");
        setPassword("");
        const position = data.position || "Admin";
        setTimeout(() => onLoginSuccess?.(position), 1000);
      } else {
        console.error("Login failed:", data);
        setMessage(`❌ Access Denied: ${data.error || "Invalid credentials"}`);
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      setMessage("❌ Server Error: Unable to connect to authentication server");
    }
  };

  return (
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
            className="w-64 h-auto object-contain filter dark:filter-none brightness-75 dark:brightness-100 transition-all"
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

          {message && (
            <div
              className={`p-4 rounded-lg text-sm font-medium ${
                message.includes("✅")
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              }`}
            >
              {message}
            </div>
          )}

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
              <a
                href="#"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
              >
                Forget Password?
              </a>
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
  );
}

export default Login;
