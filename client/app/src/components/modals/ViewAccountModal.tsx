import { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { fetchWithCsrf } from "@/lib/csrf";
import type { ModalBaseProps } from "./types";
import { FormSkeleton } from "@/components/shared/form-skeleton";

interface UserAccount {
  id: number;
  username: string;
  full_name: string;
  email: string;
  position: string;
  points: number;
  is_activated: boolean;
}

interface ViewAccountModalProps extends ModalBaseProps {}

export function ViewAccountModal({ isOpen, onClose }: ViewAccountModalProps) {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-account-title"
        className={`bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border`}
      >
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-account-title" className="text-xl font-semibold">
              My Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
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

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-6">
              {/* Avatar skeleton */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
              </div>
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
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : account ? (
            <>
              {/* Avatar Section */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-muted">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>

              {/* Credentials Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Credentials
                </h3>
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
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
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
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
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
