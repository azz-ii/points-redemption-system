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
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3">
          <div>
            <h2 id="view-customer-title" className="text-lg font-semibold">
              Customer Details
            </h2>
            <p
              className="text-xs text-muted-foreground mt-0"
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
        <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium mb-2">ID</label>
              <input
                type="text"
                value={customer.id}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={customer.name}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={customer.contact_email}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={customer.phone}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={customer.location}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>

            {/* Points */}
            <div>
              <label className="block text-sm font-medium mb-2">Points</label>
              <input
                type="text"
                value={customer.points?.toLocaleString() ?? 0}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border font-semibold transition-colors border-gray-600 hover:bg-accent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
