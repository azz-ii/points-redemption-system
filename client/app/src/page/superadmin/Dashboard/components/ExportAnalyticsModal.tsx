import { useState, useCallback } from "react";
import { X, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_EXPORT_SECTIONS,
  exportAnalyticsPDF,
  exportAnalyticsExcel,
  type AnalyticsExportData,
  type AnalyticsExportSection,
} from "../utils/analyticsExport";

interface ExportAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalyticsExportData;
}

export function ExportAnalyticsModal({
  isOpen,
  onClose,
  data,
}: ExportAnalyticsModalProps) {
  const [format, setFormat] = useState<"pdf" | "excel">("excel");
  const [sections, setSections] = useState<AnalyticsExportSection[]>(DEFAULT_EXPORT_SECTIONS);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSection = useCallback((key: string) => {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)),
    );
  }, []);

  const toggleAll = useCallback((enabled: boolean) => {
    setSections((prev) => prev.map((s) => ({ ...s, enabled })));
  }, []);

  const handleExport = useCallback(() => {
    const enabled = sections.filter((s) => s.enabled);
    if (!enabled.length) {
      setError("Select at least one section to export");
      return;
    }

    try {
      setIsExporting(true);
      setError(null);

      if (format === "pdf") {
        exportAnalyticsPDF(data, sections);
      } else {
        exportAnalyticsExcel(data, sections);
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error("[ExportAnalytics] Error:", err);
      setError(err instanceof Error ? err.message : "Export failed");
      setIsExporting(false);
    }
  }, [format, sections, data, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-card">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-card border-border">
          <h2 className="text-xl font-semibold">Export Analytics Report</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-accent text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Format */}
          <div>
            <label className="block text-sm font-medium mb-3">Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat("excel")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  format === "excel"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-border hover:border-gray-600"
                }`}
              >
                <div className="font-medium">Excel (.xlsx)</div>
                <div className="text-xs mt-1 text-muted-foreground">Multi-sheet workbook</div>
              </button>
              <button
                onClick={() => setFormat("pdf")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  format === "pdf"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-border hover:border-gray-600"
                }`}
              >
                <div className="font-medium">PDF (.pdf)</div>
                <div className="text-xs mt-1 text-muted-foreground">Printable report</div>
              </button>
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">Report Sections</label>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAll(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Select All
                </button>
                <span className="text-xs text-gray-400">|</span>
                <button
                  onClick={() => toggleAll(false)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {sections.map((s) => (
                <label
                  key={s.key}
                  className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={() => toggleSection(s.key)}
                    className="rounded"
                  />
                  <span className="text-sm">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t bg-card border-border">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !sections.some((s) => s.enabled)}
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
