import type { Customer } from "@/lib/customers-api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportColumn {
  key: keyof Customer | "formatted_date";
  label: string;
  enabled: boolean;
}

export type SortField = keyof Customer | "formatted_date";
export type SortDirection = "asc" | "desc";

export interface ExportOptions {
  columns: ExportColumn[];
  sortField: SortField;
  sortDirection: SortDirection;
  format: "pdf" | "excel";
  filename?: string;
}

export const DEFAULT_EXPORT_COLUMNS: ExportColumn[] = [
  { key: "id", label: "ID", enabled: true },
  { key: "name", label: "Name", enabled: true },
  { key: "contact_email", label: "Contact Email", enabled: true },
  { key: "phone", label: "Phone", enabled: true },
  { key: "location", label: "Location", enabled: true },
  { key: "points", label: "Points", enabled: true },
  { key: "formatted_date", label: "Date Added", enabled: true },
  { key: "added_by_name", label: "Added By", enabled: true },
];

/**
 * Format date for display
 */
function formatDate(dateString?: string): string {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

/**
 * Get cell value for export
 */
function getCellValue(customer: Customer, key: ExportColumn["key"]): string | number {
  if (key === "formatted_date") {
    return formatDate(customer.date_added);
  }
  const value = customer[key as keyof Customer];
  return value ?? "";
}

/**
 * Sort customers by field and direction
 */
function sortCustomers(
  customers: Customer[],
  sortField: SortField,
  sortDirection: SortDirection
): Customer[] {
  return [...customers].sort((a, b) => {
    let aVal: string | number | undefined;
    let bVal: string | number | undefined;

    if (sortField === "formatted_date") {
      aVal = a.date_added || "";
      bVal = b.date_added || "";
    } else {
      aVal = a[sortField];
      bVal = b[sortField];
    }

    // Handle undefined values
    if (aVal === undefined) aVal = "";
    if (bVal === undefined) bVal = "";

    // Compare values
    if (typeof aVal === "string" && typeof bVal === "string") {
      const comparison = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });
}

/**
 * Generate PDF export of customers
 */
export function generatePDF(customers: Customer[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "customers_export" } = options;
  const enabledColumns = columns.filter((col) => col.enabled);

  if (enabledColumns.length === 0) {
    throw new Error("At least one column must be selected for export");
  }

  // Sort customers
  const sortedCustomers = sortCustomers(customers, sortField, sortDirection);

  // Prepare table data
  const headers = enabledColumns.map((col) => col.label);
  const rows = sortedCustomers.map((customer) =>
    enabledColumns.map((col) => String(getCellValue(customer, col.key)))
  );

  // Create PDF
  const doc = new jsPDF({
    orientation: enabledColumns.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add title
  const title = "Customers Export";
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 20, { align: "center" });

  // Add export date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 28, {
    align: "center",
  });

  // Add record count
  doc.text(`Total Records: ${sortedCustomers.length}`, pageWidth / 2, 34, {
    align: "center",
  });

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 42,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [31, 41, 55], // gray-800
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246], // gray-100
    },
    margin: { top: 42, right: 14, bottom: 20, left: 14 },
  });

  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Generate Excel export of customers
 */
export function generateExcel(customers: Customer[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "customers_export" } = options;
  const enabledColumns = columns.filter((col) => col.enabled);

  if (enabledColumns.length === 0) {
    throw new Error("At least one column must be selected for export");
  }

  // Sort customers
  const sortedCustomers = sortCustomers(customers, sortField, sortDirection);

  // Prepare data with headers
  const headers = enabledColumns.map((col) => col.label);
  const rows = sortedCustomers.map((customer) =>
    enabledColumns.map((col) => getCellValue(customer, col.key))
  );

  // Create worksheet
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const colWidths = enabledColumns.map((col) => {
    switch (col.key) {
      case "id":
        return { wch: 8 };
      case "name":
        return { wch: 25 };
      case "contact_email":
        return { wch: 30 };
      case "phone":
        return { wch: 15 };
      case "location":
        return { wch: 25 };
      case "points":
        return { wch: 10 };
      case "formatted_date":
        return { wch: 15 };
      case "added_by_name":
        return { wch: 20 };
      default:
        return { wch: 15 };
    }
  });
  worksheet["!cols"] = colWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

  // Add metadata sheet
  const metaData = [
    ["Customers Export Report"],
    [],
    ["Generated On", new Date().toLocaleString()],
    ["Total Records", sortedCustomers.length],
    ["Sort Field", enabledColumns.find((c) => c.key === sortField)?.label || sortField],
    ["Sort Direction", sortDirection === "asc" ? "Ascending" : "Descending"],
  ];
  const metaSheet = XLSX.utils.aoa_to_sheet(metaData);
  metaSheet["!cols"] = [{ wch: 15 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, metaSheet, "Export Info");

  // Save file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export customers using specified options
 */
export function exportCustomers(customers: Customer[], options: ExportOptions): void {
  if (options.format === "pdf") {
    generatePDF(customers, options);
  } else {
    generateExcel(customers, options);
  }
}
