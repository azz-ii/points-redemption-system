import { useState, useEffect } from "react";
import { X, Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import type { ModalBaseProps } from "./types";
import { FormSkeleton } from "@/components/shared/form-skeleton";

interface UserAccount {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  uses_points: boolean;
  is_activated: boolean;
}

interface ViewAccountModalProps extends ModalBaseProps {}

export function ViewAccountModal({ isOpen, onClose }: ViewAccountModalProps) {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changeError, setChangeError] = useState("");

  // Fetch current user data
  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  const fetchCurrentUser = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithCsrf("/api/users/me/");
      const data = await response.json();
      if (response.ok) {
        setAccount(data);
      } else {
        setError(data.error || "Failed to load account details");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching current user:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetChangePasswordForm = () => {
    setShowChangePassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setSaving(false);
    setChangeError("");
  };

  const handleClose = () => {
    setError("");
    resetChangePasswordForm();
    onClose();
  };

  const handleChangePassword = async () => {
    setChangeError("");

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangeError("All fields are required");
      return;
    }
    if (newPassword.length < 6) {
      setChangeError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      console.debug("[ViewAccountModal] Submitting change_password request");
      const response = await fetchWithCsrf(`${API_URL}/users/change_password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword }),
      });
      const data = await response.json();
      console.debug("[ViewAccountModal] change_password response:", response.status, data);
      if (response.ok) {
        toast.success("Password changed successfully");
        resetChangePasswordForm();
      } else {
        setChangeError(data.error || "Failed to change password");
      }
    } catch (err) {
      console.error("[ViewAccountModal] change_password error:", err);
      setChangeError("Error connecting to server");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-account-title"
        className={`bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-account-title" className="text-xl font-semibold">
              My Account
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage your account details
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="space-y-6">
              {/* Credentials skeleton */}
              <div className="space-y-4">
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                <FormSkeleton fieldCount={2} columns={2} />
              </div>
              {/* Personal Info skeleton */}
              <div className="space-y-4">
                <div className="h-4 w-36 rounded bg-muted animate-pulse" />
                <FormSkeleton fieldCount={2} columns={2} />
              </div>
              {/* Account Details skeleton */}
              <div className="space-y-4">
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                <FormSkeleton fieldCount={2} columns={2} />
              </div>
            </div>
          ) : error && !account ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchCurrentUser}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : account ? (
            <>
              {/* Credentials Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Credentials
                  </h3>
                  <button
                    onClick={() => {
                      setChangeError("");
                      setShowChangePassword((v) => !v);
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    {showChangePassword ? "Cancel" : "Change Password"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={account.username || ""}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={account.email || ""}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none`}
                    />
                  </div>
                </div>

                {/* Inline Change Password Form */}
                {showChangePassword && (
                  <div className="mt-4 p-4 rounded-lg border border-border bg-muted/40 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Change Password</p>

                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-3 py-2 pr-10 rounded border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                          aria-label={showCurrentPw ? "Hide password" : "Show password"}
                        >
                          {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-3 py-2 pr-10 rounded border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                          aria-label={showNewPw ? "Hide password" : "Show password"}
                        >
                          {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPw ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full px-3 py-2 pr-10 rounded border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          tabIndex={-1}
                          aria-label={showConfirmPw ? "Hide password" : "Show password"}
                        >
                          {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Inline error */}
                    {changeError && (
                      <p className="text-sm text-red-500">{changeError}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleChangePassword}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground transition-colors"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={resetChangePasswordForm}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-muted hover:bg-accent text-foreground border border-border transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={account.full_name || ""}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={account.position || ""}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Account Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Account Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Points
                    </label>
                    <input
                      type="text"
                      value={account.points?.toLocaleString() ?? "0"}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <input
                      type="text"
                      value={account.is_activated ? "Active" : "Inactive"}
                      disabled
                      className={`w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-muted-foreground focus:outline-none`}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="p-8 flex justify-end">
          <button
            onClick={handleClose}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
