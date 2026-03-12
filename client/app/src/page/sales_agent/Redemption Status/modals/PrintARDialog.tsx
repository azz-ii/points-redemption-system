import { useState } from "react";
import { X, Printer } from "lucide-react";
import type { RedemptionRequest } from "./types";
import { generateAcknowledgementReceiptPdf } from "../utils/generateAcknowledgementReceiptPdf";

interface PrintARDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: RedemptionRequest;
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function PrintARDialog({ isOpen, onClose, request }: PrintARDialogProps) {
  const [arNumber, setArNumber] = useState("");
  const [arDate, setArDate] = useState(toDateInputValue(new Date()));
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!arNumber.trim()) {
      setError("Please enter the AR number");
      return;
    }
    setError(null);
    generateAcknowledgementReceiptPdf(request, arNumber.trim(), new Date(arDate + "T00:00:00"));
    handleClose();
  };

  const handleClose = () => {
    setArNumber("");
    setArDate(toDateInputValue(new Date()));
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-sm w-full border border-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-ar-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-muted-foreground" />
            <h3 id="print-ar-title" className="text-base font-semibold">
              Print Acknowledgement Receipt
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Request #{request.id} — {request.requested_for_name}
          </p>

          <div>
            <label htmlFor="ar-number" className="block text-sm font-medium mb-1.5 text-foreground">
              AR Number <span className="text-destructive">*</span>
            </label>
            <input
              id="ar-number"
              type="text"
              value={arNumber}
              onChange={(e) => setArNumber(e.target.value)}
              placeholder="e.g., 26-0007"
              className={`w-full px-3 py-2 rounded-lg border text-sm bg-card border-border text-foreground placeholder-muted-foreground ${
                error ? "border-red-500" : ""
              }`}
              autoFocus
            />
            {error && <p className="text-destructive text-sm mt-1">{error}</p>}
          </div>

          <div>
            <label htmlFor="ar-date" className="block text-sm font-medium mb-1.5 text-foreground">
              Date
            </label>
            <input
              id="ar-date"
              type="date"
              value={arDate}
              onChange={(e) => setArDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm bg-card border-border text-foreground"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-border">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Printer className="h-4 w-4" />
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
