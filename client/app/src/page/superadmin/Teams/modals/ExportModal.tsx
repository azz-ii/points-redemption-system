import { useState, useCallback, useEffect } from "react";
import { X, FileText, FileSpreadsheet, ArrowUp, ArrowDown, Download, Loader2 } from "lucide-react";
import { useTeams } from "@/hooks/queries/useTeams";
import {
  exportTeams,
  DEFAULT_EXPORT_COLUMNS,
  type ExportColumn,
  type SortField,
  type SortDirection,
} from "../utils/exportUtils";
import type { Team } from "./types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<"pdf" | "excel">("excel");
  const [columns, setColumns] = useState<ExportColumn[]>(DEFAULT_EXPORT_COLUMNS);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const { data: allTeams = [], isLoading: fetchingTeams } = useTeams(10000);

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

    if (allTeams.length === 0) {
      setError("No teams to export");
      return;
    }

    setExporting(true);
    setError("");

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `teams_export_${timestamp}`;
      
      exportTeams(allTeams, {
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
  }, [allTeams, columns, sortField, sortDirection, format, onClose]);

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
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div>
            <h2 id="export-modal-title" className="text-xl font-semibold">
              Export Teams
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {fetchingTeams ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading teams...
                </span>
              ) : (
                <>{allTeams.length} team{allTeams.length !== 1 ? "s" : ""} will be exported</>
              )}
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
        <div className="p-6 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Format Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Export Format
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  format === "excel"
                    ? "border-green-500 bg-green-500/10"
                    : "border-border hover:border-border"
                }`}
              >
                <FileSpreadsheet
                  className={`h-6 w-6 ${
                    format === "excel"
                      ? "text-green-500"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left">
                  <div className="font-medium">Excel</div>
                  <div className="text-xs text-muted-foreground">.xlsx</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  format === "pdf"
                    ? "border-red-500 bg-red-500/10"
                    : "border-border hover:border-border"
                }`}
              >
                <FileText
                  className={`h-6 w-6 ${
                    format === "pdf"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left">
                  <div className="font-medium">PDF</div>
                  <div className="text-xs text-muted-foreground">.pdf</div>
                </div>
              </button>
            </div>
          </div>

          {/* Column Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Columns to Export
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Select All
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {columns.map((col) => (
                <label
                  key={String(col.key)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    col.enabled
                      ? "bg-card"
                      : "bg-card"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={col.enabled}
                    onChange={() => handleColumnToggle(col.key)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  />
                  <span
                    className={`text-sm ${
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
            <p className="text-xs text-muted-foreground">
              {enabledCount} of {columns.length} columns selected
            </p>
          </div>

          {/* Sort Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Sort Options
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="sortField"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  Sort By
                </label>
                <select
                  id="sortField"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
                >
                  {columns.map((col) => (
                    <option key={String(col.key)} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Direction
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSortDirection("asc")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded border transition-colors ${
                      sortDirection === "asc"
                        ? "bg-primary border-blue-600 text-foreground"
                        : "bg-card border-border text-foreground hover:border-accent"
                    }`}
                  >
                    <ArrowUp className="h-4 w-4" />
                    Asc
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortDirection("desc")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded border transition-colors ${
                      sortDirection === "desc"
                        ? "bg-primary border-blue-600 text-foreground"
                        : "bg-card border-border text-foreground hover:border-accent"
                    }`}
                  >
                    <ArrowDown className="h-4 w-4" />
                    Desc
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6">
          {error && (
            <div className="w-full mb-4 p-3 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors bg-card hover:bg-accent text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || enabledCount === 0 || fetchingTeams}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {fetchingTeams
                ? "Loading..."
                : exporting
                ? "Exporting..."
                : `Export ${format.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
