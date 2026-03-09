import { useState, useEffect, useCallback } from "react";
import { X, Merge, Search } from "lucide-react";
import type { ModalBaseProps, Customer } from "./types";
import { customersApi } from "@/lib/customers-api";

interface MergeCustomerModalProps extends ModalBaseProps {
  customer: Customer | null;
  onSuccess: () => void;
}

export function MergeCustomerModal({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: MergeCustomerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<Customer | null>(null);
  const [searching, setSearching] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCustomers = useCallback(async (query: string) => {
    if (!query.trim() || !customer) return;
    try {
      setSearching(true);
      const data = await customersApi.getCustomersPage(1, 10, query);
      // Filter out the source customer and only show non-archived, non-prospect results
      setSearchResults(
        (data.results || []).filter(
          (c: Customer) => c.id !== customer.id && !c.is_archived && !c.is_prospect
        )
      );
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [customer]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchCustomers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCustomers]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async () => {
    if (!selectedTarget) {
      setError("Please select a target customer to merge into");
      return;
    }

    setError(null);
    try {
      setMerging(true);
      await customersApi.mergeCustomer(customer.id, selectedTarget.id);
      handleClose();
      onSuccess();
    } catch (err) {
      console.error("Error merging customer:", err);
      setError("Failed to merge customer. Please try again.");
    } finally {
      setMerging(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedTarget(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="merge-customer-title"
        className="bg-card rounded-lg shadow-2xl max-w-3xl w-full border divide-y border-border divide-border max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div>
            <h2 id="merge-customer-title" className="text-xl font-semibold flex items-center gap-2">
              <Merge className="h-5 w-5 text-orange-500" />
              Merge Prospect
            </h2>
            <p className="text-sm text-muted-foreground">
              Merge <strong>{customer.name}</strong> into an existing customer. All redemption requests will be transferred.
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
        <div className="p-8 space-y-6 flex-1 overflow-y-auto min-h-0">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Source Customer (read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2">Source (Prospect)</label>
            <div className="w-full px-3 py-2 rounded border bg-muted border-border text-muted-foreground">
              {customer.name}
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                Prospect
              </span>
            </div>
          </div>

          {/* Target Customer Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Merge Into (Target Customer) *</label>
            {selectedTarget ? (
              <div className="flex items-center justify-between w-full px-3 py-2 rounded border border-green-500 bg-green-500/10">
                <div>
                  <span className="font-medium">{selectedTarget.name}</span>
                  {selectedTarget.brand && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {selectedTarget.brand}
                    </span>
                  )}
                  {selectedTarget.sales_channel && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      — {selectedTarget.sales_channel}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedTarget(null)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
                    placeholder="Search for target customer..."
                  />
                </div>
                {searching && (
                  <p className="text-sm text-muted-foreground mt-2">Searching...</p>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-border rounded max-h-48 overflow-y-auto">
                    {searchResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedTarget(c);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                      >
                        <span className="font-medium">{c.name}</span>
                        {c.brand && (
                          <span className="ml-2 text-sm text-muted-foreground">{c.brand}</span>
                        )}
                        {c.sales_channel && (
                          <span className="ml-2 text-sm text-muted-foreground">— {c.sales_channel}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">No matching customers found.</p>
                )}
              </>
            )}
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500 text-amber-600 dark:text-amber-400 text-sm">
            <strong>Warning:</strong> This action will transfer all redemption requests from{" "}
            <strong>{customer.name}</strong> to the selected target customer, then archive the prospect record. This cannot be undone.
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
            disabled={merging || !selectedTarget}
            className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white transition-colors text-sm disabled:opacity-50"
          >
            {merging ? "Merging..." : "Merge Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
