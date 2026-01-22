import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { RedemptionItem } from "../modals";

export interface ExportColumn {
  key: keyof RedemptionItem;
  label: string;
  enabled: boolean;
}

export type SortField = keyof RedemptionItem;
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
  { key: "team_name", label: "Team", enabled: true },
  { key: "status_display", label: "Status", enabled: true },
  { key: "processing_status_display", label: "Processing Status", enabled: true },
  { key: "total_points", label: "Total Points", enabled: true },
  { key: "date_requested", label: "Date Requested", enabled: true },
  { key: "reviewed_by_name", label: "Reviewed By", enabled: true },
  { key: "date_reviewed", label: "Date Reviewed", enabled: true },
  { key: "remarks", label: "Remarks", enabled: false },
];

/**
 * Format date string for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
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
function getCellValue(item: RedemptionItem, key: ExportColumn["key"]): string | number {
  switch (key) {
    case "date_requested":
    case "date_reviewed":
    case "date_processed":
    case "date_cancelled": {
      const value = item[key];
      return formatDate(value ?? null);
    }
    case "team_name": {
      return item.team_name || "N/A";
    }
    case "status_display": {
      return item.status_display || item.status || "N/A";
    }
    case "processing_status_display": {
      return item.processing_status_display || item.processing_status || "N/A";
    }
    case "points_deducted_from_display": {
      return item.points_deducted_from_display || item.points_deducted_from || "N/A";
    }
    default: {
      const value = item[key as keyof RedemptionItem];
      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      }
      if (Array.isArray(value)) {
        return String(value.length);
      }
      if (value === null || value === undefined) {
        return "N/A";
      }
      return value;
    }
  }
}

/**
 * Sort redemption items by field and direction
 */
function sortItems(
  items: RedemptionItem[],
  sortField: SortField,
  sortDirection: SortDirection
): RedemptionItem[] {
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
 * Calculate processing status summary
 */
function getProcessingSummary(items: RedemptionItem[]): {
  pending: number;
  processing: number;
  processed: number;
  cancelled: number;
} {
  return items.reduce(
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
}

/**
 * Generate PDF export
 */
function generatePDF(items: RedemptionItem[], options: ExportOptions): void {
  const doc = new jsPDF({
    orientation: options.columns.length > 5 ? "landscape" : "portrait",
  });

  const enabledColumns = options.columns.filter((col) => col.enabled);
  const summary = getProcessingSummary(items);

  // Title
  doc.setFontSize(18);
  doc.text("Redemption Requests Export", 14, 20);

  // Metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total Records: ${items.length}`, 14, 36);
  doc.text(
    `Processing Status - Pending: ${summary.pending}, Processing: ${summary.processing}, Processed: ${summary.processed}, Cancelled: ${summary.cancelled}`,
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
  const filename = options.filename || `redemption-requests-${new Date().getTime()}.pdf`;
  doc.save(filename);
}

/**
 * Generate Excel export
 */
function generateExcel(items: RedemptionItem[], options: ExportOptions): void {
  const enabledColumns = options.columns.filter((col) => col.enabled);
  const summary = getProcessingSummary(items);

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
    if (col.key === "remarks" || col.key === "rejection_reason") return { wch: 30 };
    return { wch: 15 };
  });
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Redemption Requests");

  // Metadata sheet
  const metadata = [
    { Field: "Export Date", Value: new Date().toLocaleString() },
    { Field: "Total Records", Value: items.length },
    { Field: "Pending", Value: summary.pending },
    { Field: "Processing", Value: summary.processing },
    { Field: "Processed", Value: summary.processed },
    { Field: "Cancelled", Value: summary.cancelled },
  ];
  const metaWs = XLSX.utils.json_to_sheet(metadata);
  metaWs["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, metaWs, "Export Info");

  // Save the file
  const filename = options.filename || `redemption-requests-${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Main export function
 */
export function exportRedemptionRequests(
  items: RedemptionItem[],
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
