import { X } from "lucide-react";
import type { ModalBaseProps, Distributor } from "./types";

interface ViewDistributorModalProps extends ModalBaseProps {
  distributor: Distributor | null;
}

export function ViewDistributorModal({
  isOpen,
  onClose,
  distributor,
}: ViewDistributorModalProps) {
  if (!isOpen || !distributor) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-distributor-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-gray-700"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="view-distributor-title" className="text-xl font-semibold">
              Distributor Details
            </h2>
            <p
              className="text-sm text-muted-foreground"
            >
              View distributor information
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID */}
            <div>
              <label className="block text-sm font-medium mb-2">ID</label>
              <input
                type="text"
                value={distributor.id}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={distributor.name}
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
                value={distributor.contact_email}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={distributor.phone}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={distributor.location}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>

            {/* Points */}
            <div>
              <label className="block text-sm font-medium mb-2">Points</label>
              <input
                type="text"
                value={distributor.points?.toLocaleString() ?? 0}
                disabled
                className="w-full px-3 py-2 rounded border cursor-not-allowed bg-muted border-gray-600 text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border font-semibold transition-colors border-gray-600 hover:bg-accent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
