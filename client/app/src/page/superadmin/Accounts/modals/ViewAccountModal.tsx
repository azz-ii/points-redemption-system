import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";

interface ViewAccountModalProps extends ModalBaseProps {
  account: Account | null;
}

export function ViewAccountModal({
  isOpen,
  onClose,
  account,
}: ViewAccountModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-md w-full border ${
          resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold">View Account</h2>
            <p className="text-xs text-gray-500 mt-1">
              Details for {account.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
          <div>
            <p className="text-xs text-gray-500">Username</p>
            <p className="font-medium">{account.username || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Full Name</p>
            <p className="font-medium">{account.full_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="font-medium">{account.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Position</p>
            <p className="font-medium">{account.position || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="font-medium">
              {account.is_activated ? "Active" : "Inactive"}
              {account.is_banned ? " • Banned" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
