import { X } from "lucide-react";
import type { ModalBaseProps, Customer } from "./types";

interface DeleteCustomerModalProps extends ModalBaseProps {
  customer: Customer | null;
  onConfirm: () => void;
}

export function DeleteCustomerModal({
  isOpen,
  onClose,
  customer,
  onConfirm,
}: DeleteCustomerModalProps) {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-customer-title"
        aria-describedby="delete-customer-message"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="delete-customer-title" className="text-xl font-semibold">
              Delete Customer
            </h2>
            <p
              className="text-sm text-muted-foreground"
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

        {/* Content */}
        <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto">
          <p id="delete-customer-message" className="text-base">
            Are you sure you want to delete <strong>{customer.name}</strong>?
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="p-8 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border font-semibold transition-colors border-gray-600 hover:bg-accent"
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
