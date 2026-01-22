import { X } from "lucide-react";
import type { ModalHeaderProps } from "./types";

export function ModalHeader({
  title,
  subtitle,
  onClose,
  titleId,
}: ModalHeaderProps) {
  return (
    <div className="flex justify-between items-center p-8">
      <div>
        <h2 id={titleId} className="text-xl font-semibold">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="hover:opacity-70 transition-opacity"
        aria-label="Close dialog"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
