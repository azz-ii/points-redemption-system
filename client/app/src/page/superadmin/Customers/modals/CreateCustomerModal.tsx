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
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3">
          <div>
            <h2 id="create-customer-title" className="text-lg font-semibold">
              Add Customer
            </h2>
            <p
              className="text-xs text-muted-foreground mt-0"
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
        <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded border bg-card border-gray-600 text-foreground focus:outline-none focus:border-blue-500"
                placeholder="Enter customer name"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                value={newCustomer.contact_email}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    contact_email: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded border bg-card border-gray-600 text-foreground focus:outline-none focus:border-blue-500"
                placeholder="email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">Phone *</label>
              <input
                type="tel"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    phone: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded border bg-card border-gray-600 text-foreground focus:outline-none focus:border-blue-500"
                placeholder="+63 XXX XXX XXXX"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                value={newCustomer.location}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    location: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded border bg-card border-gray-600 text-foreground focus:outline-none focus:border-blue-500"
                placeholder="City, Province"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-4 py-2 rounded-lg border font-semibold transition-colors border-gray-600 hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Creating..." : "Create Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
