import { useState } from "react";
import { X, Mail } from "lucide-react";
import { fetchWithCsrf } from "@/lib/csrf";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import type { Account, ModalBaseProps } from "./types";

interface SendPasswordResetEmailModalProps extends ModalBaseProps {
  account: Account | null;
}

export function SendPasswordResetEmailModal({
  isOpen,
  onClose,
  account,
}: SendPasswordResetEmailModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !account) return null;

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    console.debug("[SendPasswordResetEmailModal] Sending password reset email for account:", account.id, account.email);
    try {
      const response = await fetchWithCsrf(
        `${API_URL}/users/${account.id}/send_password_reset_email/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      console.debug("[SendPasswordResetEmailModal] Response:", response.status, data);

      if (response.ok) {
        toast.success("Password reset email sent", {
          description: `An email has been sent to ${account.email} with a link to reset their password.`,
        });
        onClose();
      } else {
        console.error("[SendPasswordResetEmailModal] Error response:", data);
        toast.error(data.error || "Failed to send password reset email");
      }
    } catch (err) {
      console.error("[SendPasswordResetEmailModal] Network error:", err);
      toast.error("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="send-reset-email-title"
        aria-describedby="send-reset-email-message"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex justify-between items-center p-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 id="send-reset-email-title" className="text-xl font-semibold">
                Send Password Reset Email
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                The user will receive an email with instructions.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-4 flex-1 overflow-y-auto min-h-0">
          <p id="send-reset-email-message" className="text-base">
            Send a password reset email to{" "}
            <strong>{account.full_name}</strong> ({account.username})?
          </p>
          <p className="text-sm text-muted-foreground">
            An email will be sent to{" "}
            <strong className="text-foreground">{account.email}</strong> with a
            link to reset their password. The user will need to verify their
            identity with a one-time code before setting a new password.
          </p>
        </div>

        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold transition-colors bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
