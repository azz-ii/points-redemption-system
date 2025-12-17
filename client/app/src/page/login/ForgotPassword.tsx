import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, CheckCircle2, Timer } from "lucide-react";
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

interface ForgotPasswordProps {
  onBackToLogin?: () => void;
}

type Step = 1 | 2 | 3;

function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [verifiedUsername, setVerifiedUsername] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [otpSentTime, setOtpSentTime] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();

  // Timer countdown for OTP expiration
  useEffect(() => {
    if (currentStep === 2 && otpSentTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - otpSentTime) / 1000);
        const remaining = 600 - elapsed; // 10 minutes = 600 seconds
        
        if (remaining <= 0) {
          setTimeLeft(0);
          setError("OTP has expired. Please request a new one.");
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentStep, otpSentTime]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/otp/request-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSentTime(Date.now());
        setTimeLeft(600);
        setCurrentStep(2);
      } else {
        setError(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error requesting OTP:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otpCode) {
      setError("OTP code is required");
      return;
    }

    if (otpCode.length !== 6) {
      setError("OTP code must be 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/otp/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerifiedUsername(data.username);
        setCurrentStep(3);
      } else {
        setError(data.error || "Invalid OTP code. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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

    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/otp/reset-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otpCode, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccessDialog(true);
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowSuccessDialog(false);
    setCurrentStep(1);
    setEmail("");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setVerifiedUsername("");
    setOtpSentTime(null);
    setError("");
    onBackToLogin?.();
  };

  const handleBackStep = () => {
    setError("");
    if (currentStep === 2) {
      setCurrentStep(1);
      setOtpCode("");
      setOtpSentTime(null);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setNewPassword("");
      setConfirmPassword("");
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
            className="w-130 h-auto object-contain filter dark:filter-none brightness-75 dark:brightness-100 transition-all"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24" font-family="sans-serif">ORACLE PETROLEUM</text></svg>';
            }}
          />
        </div>
      </div>

      {/* Right side - Password reset form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Theme toggle button */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* Back button */}
        <button
          onClick={onBackToLogin}
          className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

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

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-all ${
                      currentStep > step
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h1
              className={`text-3xl font-semibold transition-colors ${
                resolvedTheme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {currentStep === 1 && "Reset Password"}
              {currentStep === 2 && "Verify OTP"}
              {currentStep === 3 && "Create New Password"}
            </h1>
            <p className="text-gray-800 dark:text-gray-400 text-sm transition-colors">
              {currentStep === 1 &&
                "Enter your email address to receive a verification code."}
              {currentStep === 2 &&
                "Enter the 6-digit code sent to your email."}
              {currentStep === 3 &&
                "Enter your new password below. Passwords must be at least 6 characters long."}
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Email Input */}
          {currentStep === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className={`transition-colors ${
                    resolvedTheme === "dark" ? "text-gray-300" : "text-black"
                  }`}
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white dark:bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-blue-500 dark:focus-visible:ring-gray-600 h-12 pl-10 transition-colors"
                    placeholder="Enter your email address"
                  />
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
                {isLoading ? "Sending OTP..." : "Send Verification Code"}
              </Button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="otpCode"
                  className={`transition-colors ${
                    resolvedTheme === "dark" ? "text-gray-300" : "text-black"
                  }`}
                >
                  Verification Code
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    id="otpCode"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtpCode(value);
                    }}
                    required
                    maxLength={6}
                    className="bg-white dark:bg-transparent border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-blue-500 dark:focus-visible:ring-gray-600 h-12 pl-10 text-center text-2xl tracking-widest transition-colors"
                    placeholder="000000"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    Check your email for the code
                  </p>
                  {timeLeft > 0 && (
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <Timer className="h-4 w-4" />
                      <span className="font-mono">{formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleBackStep}
                  variant="outline"
                  className="flex-1 h-12 font-medium"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className={`flex-1 h-12 font-medium transition-colors duration-200 cursor-pointer ${
                    resolvedTheme === "dark"
                      ? "bg-white text-black hover:bg-gray-300"
                      : "bg-gray-900 text-white hover:bg-gray-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {currentStep === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {verifiedUsername && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-sm font-medium">
                      Verified account: <span className="font-bold">{verifiedUsername}</span>
                    </p>
                  </div>
                </div>
              )}

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

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleBackStep}
                  variant="outline"
                  className="flex-1 h-12 font-medium"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 h-12 font-medium transition-colors duration-200 cursor-pointer ${
                    resolvedTheme === "dark"
                      ? "bg-white text-black hover:bg-gray-300"
                      : "bg-gray-900 text-white hover:bg-gray-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Password Changed Successfully</AlertDialogTitle>
            <AlertDialogDescription>
              Your password has been updated. You can now log in with your new
              password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogAction onClick={handleBackToLogin}>
              Back to Log In
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ForgotPassword;
