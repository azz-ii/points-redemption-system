import { useTheme } from "next-themes";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  isDangerous?: boolean;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  isDangerous = false,
}: BaseModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm">
      <div
        className={`${
          sizeClasses[size]
        } w-full rounded-xl shadow-2xl overflow-hidden border transition-all duration-200 ${
          resolvedTheme === "dark"
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-200"
        } ${
          isDangerous
            ? resolvedTheme === "dark"
              ? "ring-1 ring-red-500/30"
              : "ring-1 ring-red-500/20"
            : ""
        }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-start p-6 border-b ${
            resolvedTheme === "dark" ? "border-gray-700" : "border-gray-100"
          } ${isDangerous && resolvedTheme === "dark" ? "bg-red-500/5" : ""}`}
        >
          <div className="flex-1">
            <h2
              className={`text-lg font-semibold ${
                isDangerous ? "text-red-500" : ""
              }`}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                className={`text-sm mt-1 ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={`ml-4 p-1 rounded-lg transition-colors ${
              resolvedTheme === "dark"
                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div
          className={`p-6 overflow-y-auto max-h-[calc(100vh-16rem)] ${
            resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
          }`}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`border-t p-4 flex justify-end gap-3 ${
              resolvedTheme === "dark"
                ? "border-gray-700 bg-gray-800/50"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
