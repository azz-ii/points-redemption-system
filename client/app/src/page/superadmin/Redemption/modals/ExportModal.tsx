import { useState, useCallback } from "react";
import { X, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RedemptionItem } from "./types";
import {
  exportRedemptionRequests,
  DEFAULT_EXPORT_COLUMNS,
  type ExportColumn,
  type SortField,
  type SortDirection,
} from "../utils/exportUtils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  redemptions: RedemptionItem[];
}

export function ExportModal({ isOpen, onClose, redemptions }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"excel" | "pdf">("excel");
  const [columns, setColumns] = useState<ExportColumn[]>(DEFAULT_EXPORT_COLUMNS);
  const [sortField, setSortField] = useState<SortField>("date_requested");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate processing status summary
  const processingSummary = redemptions.reduce(
    (acc, item) => {
      const status = item.processing_status_display?.toLowerCase() || 
                     item.processing_status?.toLowerCase() || "";
      if (status.includes("processed") && !status.includes("processing")) {
        acc.processed++;
      } else if (status.includes("processing")) {
        acc.processing++;
      } else if (status.includes("cancelled")) {
        acc.cancelled++;
      } else if (status.includes("pending")) {
        acc.pending++;
      }
      return acc;
    },
    { pending: 0, processing: 0, processed: 0, cancelled: 0 }
  );

  const toggleColumn = useCallback((key: keyof RedemptionItem) => {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, enabled: !col.enabled } : col))
    );
  }, []);

  const toggleAllColumns = useCallback((enabled: boolean) => {
    setColumns((prev) => prev.map((col) => ({ ...col, enabled })));
  }, []);

  const handleExport = useCallback(() => {
    try {
      setIsExporting(true);
      setError(null);

      const enabledColumns = columns.filter((col) => col.enabled);
      if (enabledColumns.length === 0) {
        setError("Please select at least one column to export");
        setIsExporting(false);
        return;
      }

      exportRedemptionRequests(redemptions, {
        columns,
        sortField,
        sortDirection,
        format: selectedFormat,
      });

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error("Export error:", err);
      setError(err instanceof Error ? err.message : "Failed to export data");
      setIsExporting(false);
    }
  }, [columns, sortField, sortDirection, selectedFormat, redemptions, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-card"
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-card border-border"
        >
          <div>
            <h2 className="text-lg font-semibold">Export Redemption Requests</h2>
            <p
              className="text-sm mt-1 text-muted-foreground"
            >
              {redemptions.length} request{redemptions.length !== 1 ? "s" : ""} •{" "}
              <span className="text-yellow-600">Pending: {processingSummary.pending}</span> •{" "}
              <span className="text-blue-600">Processing: {processingSummary.processing}</span> •{" "}
              <span className="text-green-600">Processed: {processingSummary.processed}</span> •{" "}
              <span className="text-red-600">Cancelled: {processingSummary.cancelled}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-accent text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">Export Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedFormat("excel")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedFormat === "excel"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-border hover:border-gray-600"
                }`}
              >
                <div className="font-medium">Excel (.xlsx)</div>
                <div
                  className="text-xs mt-1 text-muted-foreground"
                >
                  Spreadsheet format
                </div>
              </button>
              <button
                onClick={() => setSelectedFormat("pdf")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedFormat === "pdf"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-border hover:border-gray-600"
                }`}
              >
                <div className="font-medium">PDF (.pdf)</div>
                <div
                  className="text-xs mt-1 text-muted-foreground"
                >
                  Document format
                </div>
              </button>
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Select Columns</label>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAllColumns(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Select All
                </button>
                <span className="text-xs text-gray-400">|</span>
                <button
                  onClick={() => toggleAllColumns(false)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {columns.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={column.enabled}
                    onChange={() => toggleColumn(column.key)}
                    className="rounded"
                  />
                  <span className="text-sm">{column.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="w-full p-2 rounded-lg border bg-card border-border"
              >
                {columns.map((col) => (
                  <option key={col.key} value={col.key}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Direction</label>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as SortDirection)}
                className="w-full p-2 rounded-lg border bg-card border-border"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 flex items-center justify-end gap-2 p-6 border-t bg-card border-border"
        >
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || columns.filter((c) => c.enabled).length === 0}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>
    </div>
  );
}
