import { X } from "lucide-react";
import type { ModalBaseProps, Customer } from "./types";

interface ViewCustomerModalProps extends ModalBaseProps {
  customer: Customer | null;
}

export function ViewCustomerModal({
  isOpen,
  onClose,
  customer,
}: ViewCustomerModalProps) {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-customer-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-gray-700 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-customer-title" className="text-xl font-semibold flex items-center gap-2">
              Customer Details
              {customer.is_prospect && (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500 text-white">
                  Prospect
                </span>
              )}
            </h2>
            <p
              className="text-sm text-muted-foreground"
            >
              View customer information
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
        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium mb-2">ID</label>
              <input
                type="text"
                value={customer.id}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-foreground focus:outline-none"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={customer.name}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-foreground focus:outline-none"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <input
                type="text"
                value={customer.brand ?? ""}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-foreground focus:outline-none"
              />
            </div>

            {/* Sales Channel */}
            <div>
              <label className="block text-sm font-medium mb-2">Sales Channel</label>
              <input
                type="text"
                value={customer.sales_channel ?? ""}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-border text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border font-semibold transition-colors border-border hover:bg-accent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
