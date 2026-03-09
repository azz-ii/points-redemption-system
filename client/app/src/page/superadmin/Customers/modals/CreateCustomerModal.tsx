import { X } from "lucide-react";
import type { ModalBaseProps, CustomerFormData } from "./types";

interface CreateCustomerModalProps extends ModalBaseProps {
  newCustomer: CustomerFormData;
  setNewCustomer: (data: CustomerFormData) => void;
  creating: boolean;
  error: string | null;
  onSubmit: () => void;
}

export function CreateCustomerModal({
  isOpen,
  onClose,
  newCustomer,
  setNewCustomer,
  creating,
  error,
  onSubmit,
}: CreateCustomerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-customer-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-gray-700 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="create-customer-title" className="text-xl font-semibold">
              Add Customer
            </h2>
            <p
              className="text-sm text-muted-foreground"
            >
              Create a new customer
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
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
                placeholder="Enter customer name"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium mb-2">Brand *</label>
              <input
                type="text"
                value={newCustomer.brand}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, brand: e.target.value })
                }
                className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
                placeholder="Enter brand name"
              />
            </div>

            {/* Sales Channel */}
            <div>
              <label className="block text-sm font-medium mb-2">Sales Channel *</label>
              <input
                type="text"
                value={newCustomer.sales_channel}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, sales_channel: e.target.value })
                }
                className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
                placeholder="Enter sales channel"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-6 py-3 rounded-lg border font-semibold transition-colors border-border hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={creating}
            className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
