import { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { X, FileText, FileSpreadsheet, ArrowUp, ArrowDown, Download } from "lucide-react";
import type { ModalBaseProps, Account } from "./types";
import {
  exportAccounts,
  DEFAULT_EXPORT_COLUMNS,
  type ExportColumn,
  type SortField,
  type SortDirection,
} from "../utils/exportUtils";

interface ExportModalProps extends ModalBaseProps {
  accounts: Account[];
}

export function ExportModal({ isOpen, onClose, accounts }: ExportModalProps) {
  const { resolvedTheme } = useTheme();
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

    if (accounts.length === 0) {
      setError("No accounts to export");
      return;
    }

    setExporting(true);
    setError("");

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `accounts_export_${timestamp}`;
      
      exportAccounts(accounts, {
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
  }, [accounts, columns, sortField, sortDirection, format, onClose]);

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
        className={`${
          resolvedTheme === "dark" ? "bg-gray-900" : "bg-white"
        } rounded-lg shadow-2xl max-w-lg w-full border divide-y ${
          resolvedTheme === "dark"
            ? "border-gray-700 divide-gray-700"
            : "border-gray-200 divide-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <div>
            <h2 id="export-modal-title" className="text-lg font-semibold">
              Export Accounts
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {accounts.length} account{accounts.length !== 1 ? "s" : ""}
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
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Format Selection */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Export Format
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 text-sm transition-all ${
                  format === "excel"
                    ? resolvedTheme === "dark"
                      ? "border-green-500 bg-green-500/10"
                      : "border-green-600 bg-green-50"
                    : resolvedTheme === "dark"
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileSpreadsheet
                  className={`h-4 w-4 ${
                    format === "excel"
                      ? "text-green-500"
                      : resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />
                <div className="text-left">
                  <div className="font-medium text-xs">Excel</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex items-center justify-center gap-2 p-2 rounded-lg border-2 text-sm transition-all ${
                  format === "pdf"
                    ? resolvedTheme === "dark"
                      ? "border-red-500 bg-red-500/10"
                      : "border-red-600 bg-red-50"
                    : resolvedTheme === "dark"
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText
                  className={`h-4 w-4 ${
                    format === "pdf"
                      ? "text-red-500"
                      : resolvedTheme === "dark"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                />
                <div className="text-left">
                  <div className="font-medium text-xs">PDF</div>
                </div>
              </button>
            </div>
          </div>

          {/* Column Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Columns to Export
              </h3>
              <div className="flex gap-2 text-xs">
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
            <div className="grid grid-cols-2 gap-2">
              {columns.map((col) => (
                <label
                  key={col.key}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    col.enabled
                      ? resolvedTheme === "dark"
                        ? "bg-gray-800"
                        : "bg-gray-100"
                      : resolvedTheme === "dark"
                      ? "bg-gray-800/50"
                      : "bg-gray-50"
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
                        : resolvedTheme === "dark"
                        ? "text-gray-500"
                        : "text-gray-400"
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
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
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
                  className={`w-full px-2 py-1 rounded border text-sm ${
                    resolvedTheme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:border-blue-500`}
                >
                  {columns.map((col) => (
                    <option key={col.key} value={col.key}>
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
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded border text-xs transition-colors ${
                      sortDirection === "asc"
                        ? resolvedTheme === "dark"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-blue-500 border-blue-500 text-white"
                        : resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white hover:border-gray-500"
                        : "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
                    }`}
                  >
                    <ArrowUp className="h-3 w-3" />
                    Asc
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortDirection("desc")}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded border text-xs transition-colors ${
                      sortDirection === "desc"
                        ? resolvedTheme === "dark"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-blue-500 border-blue-500 text-white"
                        : resolvedTheme === "dark"
                        ? "bg-gray-800 border-gray-600 text-white hover:border-gray-500"
                        : "bg-white border-gray-300 text-gray-900 hover:border-gray-400"
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
        <div className="p-4">
          {error && (
            <div className="w-full mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-xs">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                resolvedTheme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || enabledCount === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                resolvedTheme === "dark"
                  ? "bg-white hover:bg-gray-100 text-gray-900 disabled:opacity-50"
                  : "bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"
              }`}
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting..." : `Export ${format.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
