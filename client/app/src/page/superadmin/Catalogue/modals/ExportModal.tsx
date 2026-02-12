import { useState, useCallback } from "react";
import { X, FileText, FileSpreadsheet, ArrowUp, ArrowDown, Download } from "lucide-react";
import type { Product } from "./types";
import {
  exportProducts,
  DEFAULT_EXPORT_COLUMNS,
  type ExportColumn,
  type SortField,
  type SortDirection,
} from "../utils/exportUtils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
}

export function ExportModal({ isOpen, onClose, items }: ExportModalProps) {
  const [format, setFormat] = useState<"pdf" | "excel">("excel");
  const [columns, setColumns] = useState<ExportColumn[]>(DEFAULT_EXPORT_COLUMNS);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const handleColumnToggle = useCallback((key: ExportColumn["key"]) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, enabled: !col.enabled } : col
      )
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setColumns((prev) => prev.map((col) => ({ ...col, enabled: true })));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setColumns((prev) => prev.map((col) => ({ ...col, enabled: false })));
  }, []);

  const handleExport = useCallback(() => {
    const enabledColumns = columns.filter((col) => col.enabled);
    if (enabledColumns.length === 0) {
      setError("Please select at least one column to export");
      return;
    }

    if (items.length === 0) {
      setError("No products to export");
      return;
    }

    setExporting(true);
    setError("");

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `products_export_${timestamp}`;
      
      exportProducts(items, {
        columns,
        sortField,
        sortDirection,
        format,
        filename,
      });

      // Close modal after successful export
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [items, columns, sortField, sortDirection, format, onClose]);

  const handleClose = useCallback(() => {
    setError("");
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const enabledCount = columns.filter((col) => col.enabled).length;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-border"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-2">
          <div>
            <h2 id="export-modal-title" className="text-lg font-semibold">
              Export Products
            </h2>
            <p className="text-xs text-gray-500 mt-0">
              {items.length} product{items.length !== 1 ? "s" : ""} will be exported
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
        <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">
          {/* Format Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Export Format
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all text-sm ${
                  format === "excel"
                    ? "border-green-500 bg-green-500/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <FileSpreadsheet
                  className={`h-4 w-4 ${
                    format === "excel"
                      ? "text-green-500"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left">
                  <div className="font-medium text-xs">Excel</div>
                  <div className="text-xs text-gray-500">.xlsx</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 transition-all text-sm ${
                  format === "pdf"
                    ? "border-red-500 bg-red-500/10"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <FileText
                  className={`h-4 w-4 ${
                    format === "pdf"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left">
                  <div className="font-medium text-xs">PDF</div>
                  <div className="text-xs text-gray-500">.pdf</div>
                </div>
              </button>
            </div>
          </div>

          {/* Column Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Columns to Export
              </h3>
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Select All
                </button>
                <span className="text-gray-400">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {columns.map((col) => (
                <label
                  key={String(col.key)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors text-sm ${
                    col.enabled
                      ? "bg-muted"
                      : "bg-muted/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={col.enabled}
                    onChange={() => handleColumnToggle(col.key)}
                    className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span
                    className={`text-xs ${
                      col.enabled
                        ? ""
                        : "text-muted-foreground"
                    }`}
                  >
                    {col.label}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {enabledCount} of {columns.length} columns selected
            </p>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Sort Options
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="sortField"
                  className="text-xs text-gray-500 mb-1 block"
                >
                  Sort By
                </label>
                <select
                  id="sortField"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className={`w-full px-2 py-1 rounded border bg-card border-border text-foreground focus:outline-none focus:border-blue-500 text-sm`}
                >
                  {columns.map((col) => (
                    <option key={String(col.key)} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Direction
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setSortDirection("asc")}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded border transition-colors text-xs ${
                      sortDirection === "asc"
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-card border-border text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <ArrowUp className="h-3 w-3" />
                    Asc
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortDirection("desc")}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded border transition-colors text-xs ${
                      sortDirection === "desc"
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-card border-border text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <ArrowDown className="h-3 w-3" />
                    Desc
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2">
          {error && (
            <div className="w-full mb-2 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-xs">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 px-3 py-2 rounded-lg font-medium transition-colors bg-muted hover:bg-accent text-foreground text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || enabledCount === 0}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold transition-colors bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 text-sm"
            >
              <Download className="h-3 w-3" />
              {exporting ? "Exporting..." : `Export ${format.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
