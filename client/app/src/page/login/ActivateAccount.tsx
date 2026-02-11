import { useState } from "react";
import { useTheme } from "next-themes";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { XCircle } from "lucide-react";
import buildingImage from "@/assets/building.png";
import oracleLogo from "@/assets/oracle-logo.png";
import oracleLogoMobile from "@/assets/oracle-logo-mb.png";

interface ActivateAccountProps {
  username: string;
  onActivationComplete?: () => void;
  onAutoLogin?: (position: string) => void;
}

function ActivateAccount({ username, onActivationComplete, onAutoLogin }: ActivateAccountProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [userPosition, setUserPosition] = useState("");
  const { resolvedTheme } = useTheme();

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Call API to activate account
    setIsLoading(true);
    try {
      const response = await fetchWithCsrf(`${API_URL}/activate-account/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store position for auto-login
        const pos = data.position || "Admin";
        setUserPosition(pos);
        // persist username and position so Sidebar can read them
        try {
          localStorage.setItem("username", username);
          localStorage.setItem("position", pos);
        } catch {
          // ignore
        }
        setShowSuccessDialog(true);
      } else {
        setError(data.error || "Failed to activate account. Please try again.");
      }
    } catch (err) {
      console.error("Error activating account:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoLogin = () => {
    setShowSuccessDialog(false);
    // Trigger auto-login with the user's position
    if (onAutoLogin && userPosition) {
      onAutoLogin(userPosition);
    } else {
      // Fallback to activation complete if no auto-login callback
      onActivationComplete?.();
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 transition-colors">
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
        <div className="absolute inset-0 bg-linear-to-br from-slate-200/50 to-slate-300/50 dark:from-slate-900/80 dark:to-slate-900/90 z-10 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <img
            src={oracleLogo}
            alt="Oracle Petroleum"
            className="w-130 h-auto object-contain filter dark:filter-none brightness-75 dark:brightness-100 transition-all"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="sans-serif">ORACLE PETROLEUM</text></svg>';
            }}
          />
        </div>
      </div>

      {/* Right side - Activation form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src={oracleLogoMobile}
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
              Activate Your Account
            </h1>
            <p className="text-gray-800 dark:text-gray-400 text-sm transition-colors">
              Welcome, <strong>{username}</strong>! Please set a new password to activate your account.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleActivateAccount} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className={`transition-colors ${
                  resolvedTheme === "dark" ? "text-gray-300" : "text-black"
                }`}
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-white dark:bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-blue-500 dark:focus-visible:ring-gray-600 h-12 pr-10 transition-colors"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className={`transition-colors ${
                  resolvedTheme === "dark" ? "text-gray-300" : "text-black"
                }`}
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-white dark:bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-blue-500 dark:focus-visible:ring-gray-600 h-12 pr-10 transition-colors"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 font-medium transition-colors duration-200 cursor-pointer ${
                resolvedTheme === "dark"
                  ? "bg-white text-black hover:bg-gray-300"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Activating..." : "Activate Account"}
            </Button>
          </form>
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className={`${
          resolvedTheme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        }`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={resolvedTheme === "dark" ? "text-white" : "text-gray-900"}>
              Account Activated Successfully
            </AlertDialogTitle>
            <AlertDialogDescription className={resolvedTheme === "dark" ? "text-gray-300" : "text-gray-600"}>
              Your account has been activated. Logging you in automatically...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogAction 
              onClick={handleAutoLogin}
              className={`${
                resolvedTheme === "dark"
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-700"
              }`}
            >
              Continue
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ActivateAccount;
