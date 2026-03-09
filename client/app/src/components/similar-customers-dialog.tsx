import { X, AlertTriangle } from "lucide-react";
import type { Customer } from "@/lib/customers-api";

interface SimilarCustomersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prospectName: string;
  exactMatch: Customer | null;
  similarCustomers: Customer[];
  onSelectExisting: (customer: Customer) => void;
  onCreateAnyway: () => void;
  creating: boolean;
}

export default function SimilarCustomersDialog({
  isOpen,
  onClose,
  prospectName,
  exactMatch,
  similarCustomers,
  onSelectExisting,
  onCreateAnyway,
  creating,
}: SimilarCustomersDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-xl shadow-2xl bg-card text-foreground border border-border max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Similar customers found</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                We found existing customers similar to &ldquo;{prospectName}&rdquo;. Did you mean one of these?
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Matches */}
        <div className="p-4 flex-1 overflow-y-auto min-h-0 space-y-2">
          {exactMatch && (
            <button
              onClick={() => onSelectExisting(exactMatch)}
              className="w-full p-3 rounded-lg border-2 border-amber-500/50 bg-amber-500/5 text-left hover:bg-amber-500/10 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{exactMatch.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                  Exact match
                </span>
              </div>
              {exactMatch.brand && (
                <span className="text-xs text-muted-foreground">{exactMatch.brand}</span>
              )}
              {exactMatch.is_prospect && (
                <span className="text-xs text-blue-500 ml-2">(Prospect)</span>
              )}
            </button>
          )}

          {similarCustomers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => onSelectExisting(customer)}
              className="w-full p-3 rounded-lg border border-border text-left hover:bg-accent transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{customer.name}</span>
                {customer.is_prospect && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    Prospect
                  </span>
                )}
              </div>
              {customer.brand && (
                <span className="text-xs text-muted-foreground">{customer.brand}</span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={onCreateAnyway}
            disabled={creating}
            className="w-full px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-accent transition disabled:opacity-50"
          >
            {creating ? "Creating..." : `No, create "${prospectName}" as new prospect`}
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
