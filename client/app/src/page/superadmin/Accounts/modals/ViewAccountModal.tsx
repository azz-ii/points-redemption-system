import { useTheme } from "next-themes";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";
import { BaseModal } from "./BaseModal";

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

  const statusColor =
    account.is_activated && !account.is_banned
      ? "text-green-600"
      : account.is_banned
      ? "text-red-600"
      : "text-gray-600";

  const statusIcon =
    account.is_activated && !account.is_banned ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : account.is_banned ? (
      <XCircle className="h-4 w-4" />
    ) : (
      <XCircle className="h-4 w-4" />
    );

  const statusLabel = account.is_activated
    ? account.is_banned
      ? "Banned"
      : "Active"
    : "Inactive";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Account Details"
      subtitle={`Viewing ${account.full_name}`}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <DetailField label="Username" value={account.username} />
          <DetailField label="Full Name" value={account.full_name} />
          <DetailField label="Email" value={account.email} />
          <DetailField label="Position" value={account.position} />
          <DetailField
            label="Points"
            value={account.points?.toLocaleString() ?? "0"}
          />
          <div className="space-y-1">
            <p
              className={`text-sm font-medium ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Status
            </p>
            <div
              className={`flex items-center gap-2 font-semibold ${statusColor}`}
            >
              {statusIcon}
              {statusLabel}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div
          className={`p-3 rounded-lg ${
            resolvedTheme === "dark" ? "bg-gray-800/50" : "bg-gray-100/50"
          }`}
        >
          <p
            className={`text-xs mb-2 font-medium ${
              resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Account Status
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span
                className={
                  resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                }
              >
                Activated
              </span>
              <span className="font-medium">
                {account.is_activated ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Yes
                  </span>
                ) : (
                  <span className="text-gray-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    No
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span
                className={
                  resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                }
              >
                Banned
              </span>
              <span className="font-medium">
                {account.is_banned ? (
                  <span className="text-red-600 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Yes
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    No
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

interface DetailFieldProps {
  label: string;
  value: string;
}

function DetailField({ label, value }: DetailFieldProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="space-y-1">
      <p
        className={`text-sm font-medium ${
          resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-semibold ${
          resolvedTheme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
