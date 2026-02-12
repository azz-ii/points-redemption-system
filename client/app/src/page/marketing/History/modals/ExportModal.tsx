import { Download, X } from "lucide-react";
import { useState } from "react";
import type { ExportModalProps } from "./types";

export function ExportModal({
  isOpen,
  onClose,
  onConfirm,
  selectedItems,
  isExporting,
}: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("csv");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(exportFormat);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isExporting) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 border border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Export History</h2>
              <p className="text-sm text-muted-foreground">
                Export {selectedItems.length} record{selectedItems.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wide">
              Export Format
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={(e) => setExportFormat(e.target.value as "csv" | "excel")}
                  disabled={isExporting}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">CSV (.csv)</p>
                  <p className="text-xs text-muted-foreground">
                    Comma-separated values, compatible with Excel and spreadsheet apps
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={exportFormat === "excel"}
                  onChange={(e) => setExportFormat(e.target.value as "csv" | "excel")}
                  disabled={isExporting}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">Excel (.xlsx)</p>
                  <p className="text-xs text-muted-foreground">
                    Microsoft Excel format with formatting and metadata
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Export Summary */}
          <div className="rounded-lg p-4 bg-muted/50 border border-border">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
              Export Summary
            </h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Records:</span>{" "}
                <span className="font-semibold">{selectedItems.length}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Columns:</span>{" "}
                <span className="font-semibold">8</span> (ID, Requested By, Requested For, Total Points, Status, Processing Status, Date Requested, Date Processed)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
