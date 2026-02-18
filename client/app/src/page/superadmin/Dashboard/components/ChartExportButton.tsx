import { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface DetailExportItem {
  id: string | number;
  label: string;
  fetcher: () => Promise<Record<string, unknown>[]>;
}

interface ChartExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  disabled?: boolean;
}

export function exportDataAsExcel(rows: Record<string, unknown>[], fname: string) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Details");
  XLSX.writeFile(wb, `${fname}-${Date.now()}.xlsx`);
}

export function exportDataAsPdf(rows: Record<string, unknown>[], fname: string, title: string) {
  const columns = Object.keys(rows[0]);
  const body = rows.map((row) => columns.map((col) => String(row[col] ?? "")));
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
  autoTable(doc, {
    startY: 28,
    head: [columns],
    body,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [71, 85, 105] },
  });
  doc.save(`${fname}-${Date.now()}.pdf`);
}

export function ChartExportButton({ data, filename, disabled }: ChartExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const exportExcel = () => {
    if (!data.length) return;
    exportDataAsExcel(data, filename);
    setOpen(false);
  };

  const exportPdf = () => {
    if (!data.length) return;
    const columns = Object.keys(data[0]);
    const rows = data.map((row) => columns.map((col) => String(row[col] ?? "")));
    const doc = new jsPDF({ orientation: columns.length > 5 ? "landscape" : "portrait" });
    doc.setFontSize(14);
    doc.text(filename.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), 14, 16);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [columns],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] },
    });
    doc.save(`${filename}-${Date.now()}.pdf`);
    setOpen(false);
  };

  const isDisabled = disabled || !data.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !isDisabled && setOpen((v) => !v)}
        disabled={isDisabled}
        title="Export chart data"
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        <Download className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[170px] rounded-lg border bg-card border-border shadow-lg py-1 animate-in fade-in-0 zoom-in-95">
          <button
            onClick={exportExcel}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-green-500" />
            Export as Excel
          </button>
          <button
            onClick={exportPdf}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-accent transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-red-500" />
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}
