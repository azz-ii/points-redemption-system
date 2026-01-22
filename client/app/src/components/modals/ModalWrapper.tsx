import { useTheme } from "next-themes";
import type { ModalWrapperProps } from "./types";

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function ModalWrapper({
  isOpen,
  onClose,
  children,
  maxWidth = "lg",
  ariaLabelledBy,
  ariaDescribedBy,
  role = "dialog",
}: ModalWrapperProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl ${maxWidthClasses[maxWidth]} w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
        role={role}
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
