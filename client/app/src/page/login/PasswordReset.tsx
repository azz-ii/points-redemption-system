import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Lock, CheckCircle2, Timer, AlertTriangle } from "lucide-react";
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

type Step = 1 | 2;

function PasswordReset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [verifiedUsername, setVerifiedUsername] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [otpSentTime, setOtpSentTime] = useState<number | null>(null);
  const [otpRequested, setOtpRequested] = useState(false);

  // Auto-request OTP on mount when email is present
  const requestOtp = useCallback(async () => {
    if (!email || otpRequested) return;
    setOtpRequested(true);
    setIsLoading(true);
    setError("");
    console.debug("[PasswordReset] Auto-requesting OTP for email:", email);

    try {
      const response = await fetchWithCsrf(`${API_URL}/otp/request-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.debug("[PasswordReset] OTP request response:", response.status, data);

      if (response.ok) {
        setOtpSentTime(Date.now());
        setTimeLeft(600);
        console.debug("[PasswordReset] OTP sent successfully");
      } else {
        console.error("[PasswordReset] OTP request failed:", data);
        setError(data.error || "Failed to send verification code. Please try again.");
      }
    } catch (err) {
      console.error("[PasswordReset] OTP request error:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [email, otpRequested]);

  useEffect(() => {
    requestOtp();
  }, [requestOtp]);

  // Timer countdown for OTP expiration
  useEffect(() => {
    if (currentStep === 1 && otpSentTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - otpSentTime) / 1000);
        const remaining = 600 - elapsed;

        if (remaining <= 0) {
          setTimeLeft(0);
          setError("Verification code has expired. Please request a new one.");
          clearInterval(interval);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentStep, otpSentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");
    console.debug("[PasswordReset] Resending OTP for email:", email);

    try {
      const response = await fetchWithCsrf(`${API_URL}/otp/request-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.debug("[PasswordReset] Resend OTP response:", response.status, data);

      if (response.ok) {
        setOtpSentTime(Date.now());
        setTimeLeft(600);
        setOtpCode("");
        setError("");
      } else {
        setError(data.error || "Failed to resend verification code.");
      }
    } catch (err) {
      console.error("[PasswordReset] Resend OTP error:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otpCode) {
      setError("Verification code is required");
      return;
    }

    if (otpCode.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    setIsLoading(true);
    console.debug("[PasswordReset] Verifying OTP:", otpCode);
    try {
      const response = await fetchWithCsrf(`${API_URL}/otp/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otpCode }),
      });

      const data = await response.json();
      console.debug("[PasswordReset] Verify OTP response:", response.status, data);

      if (response.ok) {
        setVerifiedUsername(data.username);
        setCurrentStep(2);
      } else {
        setError(data.error || "Invalid verification code. Please try again.");
      }
    } catch (err) {
      console.error("[PasswordReset] Verify OTP error:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
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
    console.debug("[PasswordReset] Resetting password for email:", email);
    try {
      const response = await fetchWithCsrf(`${API_URL}/otp/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otpCode, new_password: newPassword }),
      });

      const data = await response.json();
      console.debug("[PasswordReset] Reset password response:", response.status, data);

      if (response.ok) {
        setShowSuccessDialog(true);
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      console.error("[PasswordReset] Reset password error:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowSuccessDialog(false);
    navigate("/login");
  };

  // No email in URL params
  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 inline-flex">
            <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-semibold">Invalid Reset Link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired. Please contact
            your administrator to request a new password reset email.
          </p>
          <Button onClick={() => navigate("/login")} className="w-full h-12">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 transition-colors">
        <div className="absolute inset-0">
          <img
            src={buildingImage}
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

      {/* Right side - Password reset form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Theme toggle button */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* Back to login button */}
        <button
          onClick={() => navigate("/login")}
          className="absolute top-6 left-6 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Login</span>
        </button>

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

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 2 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-all ${
                      currentStep > step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold transition-colors text-foreground">
              {currentStep === 1 && "Verify Your Identity"}
              {currentStep === 2 && "Create New Password"}
            </h1>
            <p className="text-muted-foreground text-sm transition-colors">
              {currentStep === 1 &&
                "A verification code has been sent to your email. Enter it below."}
              {currentStep === 2 &&
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

          {/* Step 1: OTP Verification */}
          {currentStep === 1 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="otpCode"
                  className="transition-colors text-foreground"
                >
                  Verification Code
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-12 pl-10 text-center text-2xl tracking-widest transition-colors"
                    placeholder="000000"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-muted-foreground">
                    Check your email for the code
                  </p>
                  {timeLeft > 0 && (
                    <div className="flex items-center gap-1 text-primary">
                      <Timer className="h-4 w-4" />
                      <span className="font-mono">{formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full h-12 font-medium transition-colors duration-200 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          )}

          {/* Step 2: New Password */}
          {currentStep === 2 && (
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
                  className="transition-colors text-foreground"
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
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-12 pr-10 transition-colors"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                  className="transition-colors text-foreground"
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
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-12 pr-10 transition-colors"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                className="w-full h-12 font-medium transition-colors duration-200 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
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

export default PasswordReset;
