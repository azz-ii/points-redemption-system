import type { Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { AlertTriangle } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";
import { BaseModal } from "./BaseModal";
import { FormTextarea, FormSelect } from "./FormComponents";

interface BulkBanAccountModalProps extends ModalBaseProps {
  accounts: Account[];
  banReason: string;
  setBanReason: Dispatch<SetStateAction<string>>;
  banMessage: string;
  setBanMessage: Dispatch<SetStateAction<string>>;
  banDuration: "1" | "7" | "30" | "permanent";
  setBanDuration: Dispatch<SetStateAction<"1" | "7" | "30" | "permanent">>;
  loading: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
}

export function BulkBanAccountModal({
  isOpen,
  onClose,
  accounts,
  banReason,
  setBanReason,
  banMessage,
  setBanMessage,
  banDuration,
  setBanDuration,
  loading,
  error,
  setError,
  onSubmit,
}: BulkBanAccountModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || accounts.length === 0) return null;

  const handleClose = () => {
    onClose();
    setError("");
  };

  const footer = (
    <>
      <button
        onClick={handleClose}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          resolvedTheme === "dark"
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 text-gray-900"
        }`}
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
          resolvedTheme === "dark"
            ? "bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        <AlertTriangle className="h-4 w-4" />
        {loading
          ? "Banning..."
          : `Ban ${accounts.length} User${accounts.length > 1 ? "s" : ""}`}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ban Multiple Users"
      subtitle={`Applying action to ${accounts.length} user${
        accounts.length > 1 ? "s" : ""
      }`}
      footer={footer}
      isDangerous
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <div
          className={`p-3 rounded-lg border flex gap-2 ${
            resolvedTheme === "dark"
              ? "bg-orange-500/5 border-orange-500/30"
              : "bg-orange-500/5 border-orange-500/30"
          }`}
        >
          <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-700 font-medium">
            This action will be applied to all {accounts.length} selected user
            {accounts.length > 1 ? "s" : ""}.
          </p>
        </div>

        <div
          className={`p-3 rounded-lg max-h-48 overflow-y-auto space-y-1.5 ${
            resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <p
            className={`text-sm font-medium px-1 ${
              resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Users to ban:
          </p>
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`text-xs px-3 py-1.5 rounded flex justify-between ${
                resolvedTheme === "dark"
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <span className="font-medium">{account.full_name}</span>
              <span className="text-gray-500">@{account.username}</span>
            </div>
          ))}
        </div>

        <FormTextarea
          label="Ban Reason"
          required
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="Explain why these users are being banned (applies to all)"
          hint="This reason will be recorded for all selected users"
          rows={3}
        />

        <FormTextarea
          label="Message to Users"
          value={banMessage}
          onChange={(e) => setBanMessage(e.target.value)}
          placeholder="Optional: Message that will be shown to users"
          hint="Leave blank to use a default message"
          rows={2}
        />

        <FormSelect
          label="Ban Duration"
          required
          value={banDuration}
          onChange={(e) =>
            setBanDuration(e.target.value as "1" | "7" | "30" | "permanent")
          }
          options={[
            { value: "1", label: "1 day" },
            { value: "7", label: "7 days" },
            { value: "30", label: "30 days" },
            { value: "permanent", label: "Permanent" },
          ]}
        />
      </div>
    </BaseModal>
  );
}
