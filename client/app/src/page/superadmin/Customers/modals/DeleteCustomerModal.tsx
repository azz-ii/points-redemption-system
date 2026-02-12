import { X, Archive } from "lucide-react";
import type { ModalBaseProps, Customer } from "./types";

interface ArchiveCustomerModalProps extends ModalBaseProps {
  customer: Customer | null;
  loading: boolean;
  onConfirm: (id: number) => void;
}

export function ArchiveCustomerModal({
  isOpen,
  onClose,
  customer,
  loading,
  onConfirm,
}: ArchiveCustomerModalProps) {
  if (!isOpen || !customer) return null;

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(customer.id);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="archive-customer-title"
        aria-describedby="archive-customer-message"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
      >
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Archive className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 id="archive-customer-title" className="text-lg font-semibold">
                Archive Customer
              </h2>
              <p className="text-xs text-gray-500 mt-0">
                This action can be reversed.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 space-y-2 max-h-[70vh] overflow-y-auto">
          <p id="archive-customer-message" className="text-base">
            Are you sure you want to archive <strong>{customer.name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            Archived customers cannot be selected in redemption requests. You can restore this customer later.
          </p>
        </div>

        <div className="p-3 border-t flex gap-2 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg font-semibold transition-colors bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
          >
            {loading ? "Archiving..." : "Archive"}
          </button>
        </div>
      </div>
    </div>
  );
}
