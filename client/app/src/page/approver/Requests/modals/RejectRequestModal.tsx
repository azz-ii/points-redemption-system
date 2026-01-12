import { useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { BaseModal } from "@/page/superadmin/Accounts/modals/BaseModal";
import type { ModalBaseProps, RequestItem } from "./types";

interface RejectRequestModalProps extends ModalBaseProps {
  request: RequestItem | null;
  onConfirm: (reason: string, remarks: string) => void;
}

export function RejectRequestModal({
  isOpen,
  onClose,
  request,
  onConfirm,
}: RejectRequestModalProps) {
  const { resolvedTheme } = useTheme();
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");

  if (!isOpen || !request) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    onConfirm(reason, remarks);
    setReason("");
    setRemarks("");
  };

  const handleClose = () => {
    setReason("");
    setRemarks("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-sm w-full border ${
          resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Reject Request</h2>
          <p className="text-sm mb-4">
            Are you sure you want to reject this request for{" "}
            <span className="font-semibold">{request.requested_for_name}</span>?
          </p>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-2"
              htmlFor="reject-reason"
            >
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className={`w-full px-3 py-2 rounded border text-sm resize-none ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              }`}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className={`flex-1 py-2 rounded font-semibold transition-colors ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
