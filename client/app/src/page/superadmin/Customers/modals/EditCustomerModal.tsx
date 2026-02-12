import { X } from "lucide-react";
import type { ModalBaseProps, CustomerFormData } from "./types";

interface EditCustomerModalProps extends ModalBaseProps {
  editCustomer: CustomerFormData;
  setEditCustomer: (data: CustomerFormData) => void;
  updating: boolean;
  error: string | null;
  onSubmit: () => void;
}

export function EditCustomerModal({
  isOpen,
  onClose,
  editCustomer,
  setEditCustomer,
  updating,
  error,
  onSubmit,
}: EditCustomerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-customer-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="edit-customer-title" className="text-xl font-semibold">
              Edit Customer
            </h2>
            <p
              className="text-sm text-muted-foreground"
            >
              Update customer information
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
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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
                value={editCustomer.name}
                onChange={(e) =>
                  setEditCustomer({
                    ...editCustomer,
                    name: e.target.value,
                  })
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
                value={editCustomer.contact_email}
                onChange={(e) =>
                  setEditCustomer({
                    ...editCustomer,
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
                value={editCustomer.phone}
                onChange={(e) =>
                  setEditCustomer({
                    ...editCustomer,
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
                value={editCustomer.location}
                onChange={(e) =>
                  setEditCustomer({
                    ...editCustomer,
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
        <div className="p-8 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={updating}
            className="px-6 py-3 rounded-lg border font-semibold transition-colors border-gray-600 hover:bg-accent disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={updating}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? "Updating..." : "Update Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
