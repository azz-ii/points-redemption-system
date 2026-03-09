import { useState } from "react";
import { X, ArrowUpCircle } from "lucide-react";
import type { ModalBaseProps, Customer } from "./types";
import { customersApi } from "@/lib/customers-api";

interface PromoteCustomerModalProps extends ModalBaseProps {
  customer: Customer | null;
  onSuccess: () => void;
}

export function PromoteCustomerModal({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: PromoteCustomerModalProps) {
  const [brand, setBrand] = useState("");
  const [salesChannel, setSalesChannel] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleSubmit = async () => {
    setError(null);

    if (!brand.trim()) {
      setError("Brand is required");
      return;
    }
    if (!salesChannel.trim()) {
      setError("Sales channel is required");
      return;
    }

    try {
      setPromoting(true);
      await customersApi.promoteCustomer(customer.id, {
        brand: brand.trim(),
        sales_channel: salesChannel.trim(),
      });
      setBrand("");
      setSalesChannel("");
      setError(null);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error promoting customer:", err);
      setError("Failed to promote customer. Please try again.");
    } finally {
      setPromoting(false);
    }
  };

  const handleClose = () => {
    setBrand("");
    setSalesChannel("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promote-customer-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="promote-customer-title" className="text-xl font-semibold flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-blue-500" />
              Promote Prospect
            </h2>
            <p className="text-sm text-muted-foreground">
              Convert <strong>{customer.name}</strong> from a prospect to a full customer
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Customer Name (read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={customer.name}
              disabled
              className="w-full px-3 py-2 rounded border bg-muted border-border text-muted-foreground cursor-not-allowed"
            />
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium mb-2">Brand *</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
              placeholder="Enter brand name"
            />
          </div>

          {/* Sales Channel */}
          <div>
            <label className="block text-sm font-medium mb-2">Sales Channel *</label>
            <input
              type="text"
              value={salesChannel}
              onChange={(e) => setSalesChannel(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
              placeholder="Enter sales channel"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-8">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded border border-border hover:bg-accent transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={promoting}
            className="px-4 py-2 rounded bg-primary hover:bg-primary/90 text-primary-foreground transition-colors text-sm disabled:opacity-50"
          >
            {promoting ? "Promoting..." : "Promote to Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
