import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { RequestHistoryItem } from "../modals";

export interface ExportColumn {
  key: keyof RequestHistoryItem;
  label: string;
  enabled: boolean;
}

export type SortField = keyof RequestHistoryItem;
export type SortDirection = "asc" | "desc";

export interface ExportOptions {
  columns: ExportColumn[];
  sortField: SortField;
  sortDirection: SortDirection;
  format: "pdf" | "excel";
  filename?: string;
}

export const DEFAULT_EXPORT_COLUMNS: ExportColumn[] = [
  { key: "id", label: "Request ID", enabled: true },
  { key: "requested_by_name", label: "Requested By", enabled: true },
  { key: "requested_for_name", label: "Requested For", enabled: true },
  { key: "status_display", label: "Status", enabled: true },
  { key: "processing_status_display", label: "Processing Status", enabled: true },
  { key: "total_points", label: "Total Points", enabled: true },
  { key: "date_requested", label: "Date Requested", enabled: true },
];

/**
 * Format date string for display
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Get cell value for export
 */
function getCellValue(item: RequestHistoryItem, key: ExportColumn["key"]): string | number {
  switch (key) {
    case "date_requested": {
      const value = item[key];
      return value ? formatDate(value) : "";
    }
    default: {
      const value = item[key as keyof RequestHistoryItem];
      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      }
      if (Array.isArray(value)) {
        return String(value.length);
      }
      return value ?? "";
    }
  }
}

/**
 * Sort request history items by field and direction
 */
function sortItems(
  items: RequestHistoryItem[],
  sortField: SortField,
  sortDirection: SortDirection
): RequestHistoryItem[] {
  return [...items].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    let comparison = 0;
    if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });
}

/**
 * Calculate status summary
 */
function getStatusSummary(items: RequestHistoryItem[]): {
  approved: number;
  rejected: number;
  cancelled: number;
} {
  return items.reduce(
    (acc, item) => {
      const status = item.status_display?.toLowerCase() || "";
      if (status.includes("approved")) acc.approved++;
      else if (status.includes("rejected")) acc.rejected++;
      else if (status.includes("cancelled")) acc.cancelled++;
      return acc;
    },
    { approved: 0, rejected: 0, cancelled: 0 }
  );
}

/**
 * Generate PDF export
 */
function generatePDF(items: RequestHistoryItem[], options: ExportOptions): void {
  const doc = new jsPDF({
    orientation: options.columns.length > 5 ? "landscape" : "portrait",
  });

  const enabledColumns = options.columns.filter((col) => col.enabled);
  const summary = getStatusSummary(items);

  // Title
  doc.setFontSize(18);
  doc.text("Request History Export", 14, 20);

  // Metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total Records: ${items.length}`, 14, 36);
  doc.text(
    `Status Summary - Approved: ${summary.approved}, Rejected: ${summary.rejected}, Cancelled: ${summary.cancelled}`,
    14,
    42
  );

  // Table headers
  const headers = enabledColumns.map((col) => col.label);

  // Table data
  const data = items.map((item) =>
    enabledColumns.map((col) => String(getCellValue(item, col.key)))
  );

  // Generate table with color coding for status
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 48,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    didParseCell: (data) => {
      // Color code status columns
      if (data.section === "body") {
        const colIndex = data.column.index;
        const colKey = enabledColumns[colIndex]?.key;

        if (colKey === "status_display" || colKey === "processing_status_display") {
          const cellValue = String(data.cell.text).toLowerCase();
          if (cellValue.includes("approved") || cellValue.includes("processed")) {
            data.cell.styles.fillColor = [220, 252, 231]; // green-100
            data.cell.styles.textColor = [21, 128, 61]; // green-700
          } else if (cellValue.includes("rejected") || cellValue.includes("cancelled")) {
            data.cell.styles.fillColor = [254, 226, 226]; // red-100
            data.cell.styles.textColor = [185, 28, 28]; // red-700
          } else if (cellValue.includes("pending") || cellValue.includes("processing")) {
            data.cell.styles.fillColor = [254, 249, 195]; // yellow-100
            data.cell.styles.textColor = [161, 98, 7]; // yellow-700
          }
        }
      }
    },
  });

  // Save the PDF
  const filename = options.filename || `request-history-${new Date().getTime()}.pdf`;
  doc.save(filename);
}

/**
 * Generate Excel export
 */
function generateExcel(items: RequestHistoryItem[], options: ExportOptions): void {
  const enabledColumns = options.columns.filter((col) => col.enabled);
  const summary = getStatusSummary(items);

  // Prepare main data
  const headers = enabledColumns.map((col) => col.label);
  const data = items.map((item) =>
    enabledColumns.reduce((row, col) => {
      row[col.label] = getCellValue(item, col.key);
      return row;
    }, {} as Record<string, string | number>)
  );

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Main data sheet
  const ws = XLSX.utils.json_to_sheet(data, { header: headers });

  // Set column widths
  const colWidths = enabledColumns.map((col) => {
    if (col.key === "id") return { wch: 10 };
    if (col.key.includes("name")) return { wch: 20 };
    if (col.key.includes("status")) return { wch: 18 };
    if (col.key.includes("date")) return { wch: 15 };
    if (col.key.includes("points")) return { wch: 12 };
    return { wch: 15 };
  });
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Request History");

  // Metadata sheet
  const metadata = [
    { Field: "Export Date", Value: new Date().toLocaleString() },
    { Field: "Total Records", Value: items.length },
    { Field: "Approved Requests", Value: summary.approved },
    { Field: "Rejected Requests", Value: summary.rejected },
    { Field: "Cancelled Requests", Value: summary.cancelled },
  ];
  const metaWs = XLSX.utils.json_to_sheet(metadata);
  metaWs["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, metaWs, "Export Info");

  // Save the file
  const filename = options.filename || `request-history-${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Main export function
 */
export function exportRequestHistory(
  items: RequestHistoryItem[],
  options: ExportOptions
): void {
  // Sort items if needed
  const sortedItems = sortItems(items, options.sortField, options.sortDirection);

  // Generate export based on format
  if (options.format === "pdf") {
    generatePDF(sortedItems, options);
  } else {
    generateExcel(sortedItems, options);
  }
}
