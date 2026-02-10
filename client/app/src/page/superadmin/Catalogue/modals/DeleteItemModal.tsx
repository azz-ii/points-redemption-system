import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { ModalBaseProps, CatalogueVariant } from "./types";

interface DeleteItemModalProps extends ModalBaseProps {
  item: CatalogueVariant | null;
  onConfirm: () => void;
}

export function DeleteItemModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: DeleteItemModalProps) {
  const { resolvedTheme } = useTheme();

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-lg w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-item-title"
      >
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 id="delete-item-title" className="text-lg font-semibold">
              Delete Item
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Confirm deletion
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-sm">
            Are you sure you want to delete <strong>{item.item_name}</strong>?
            This action cannot be undone.
          </p>
        </div>

        <div className="p-4 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`flex-1 px-3 py-2 rounded-lg font-semibold border transition-colors text-sm ${
              resolvedTheme === "dark"
                ? "border-gray-600 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
