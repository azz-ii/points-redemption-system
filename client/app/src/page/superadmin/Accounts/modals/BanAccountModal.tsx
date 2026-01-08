import type { Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { AlertTriangle } from "lucide-react";
import type { Account, ModalBaseProps } from "./types";
import { BaseModal } from "./BaseModal";
import { FormTextarea, FormSelect } from "./FormComponents";

interface BanAccountModalProps extends ModalBaseProps {
  account: Account | null;
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

export function BanAccountModal({
  isOpen,
  onClose,
  account,
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
}: BanAccountModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !account) return null;

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
            ? "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        <AlertTriangle className="h-4 w-4" />
        {loading ? "Banning..." : "Ban User"}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ban User"
      subtitle={`Ban ${account.full_name} from the platform`}
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
              ? "bg-red-500/5 border-red-500/30"
              : "bg-red-500/5 border-red-500/30"
          }`}
        >
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">
            This action will prevent the user from accessing the platform.
          </p>
        </div>

        <FormTextarea
          label="Ban Reason"
          required
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="Explain why this user is being banned"
          rows={3}
        />

        <FormTextarea
          label="Message to User"
          value={banMessage}
          onChange={(e) => setBanMessage(e.target.value)}
          placeholder="Optional: Message that will be shown to the user"
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
