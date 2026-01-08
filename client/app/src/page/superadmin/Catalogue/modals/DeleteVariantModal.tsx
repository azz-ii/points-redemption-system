import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { ModalBaseProps, CatalogueVariant } from "./types";

interface DeleteVariantModalProps extends ModalBaseProps {
  variant: CatalogueVariant | null;
  onConfirm: () => void;
}

export function DeleteVariantModal({
  isOpen,
  onClose,
  variant,
  onConfirm,
}: DeleteVariantModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !variant) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-variant-title"
        aria-describedby="delete-variant-message"
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-lg w-full border divide-y ${
          resolvedTheme === "dark" ? "border-gray-700 divide-gray-700" : "border-gray-200 divide-gray-200"
        }`}
      >
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="delete-variant-title" className="text-xl font-semibold">Delete Variant</h2>
            <p
              className={`text-sm ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Confirm deletion
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
          <p id="delete-variant-message">
            Are you sure you want to delete variant{" "}
            <strong>{variant.item_code}</strong> (
            {variant.option_description || "No description"})? This action
            cannot be undone.
          </p>
        </div>

        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg border font-semibold transition-colors ${
              resolvedTheme === "dark"
                ? "border-gray-600 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
