import type { Account } from "../modals/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportColumn {
  key: keyof Account | "status";
  label: string;
  enabled: boolean;
}

export type SortField = keyof Account | "status";
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
  { key: "username", label: "Username", enabled: true },
  { key: "full_name", label: "Full Name", enabled: true },
  { key: "email", label: "Email", enabled: true },
  { key: "position", label: "Position", enabled: true },
  { key: "points", label: "Points", enabled: true },
  { key: "status", label: "Status", enabled: true },
];

/**
 * Get the display status of an account
 */
function getAccountStatus(account: Account): string {
  if (account.is_banned) return "Banned";
  if (account.is_activated) return "Active";
  return "Inactive";
}

/**
 * Get cell value for export
 */
function getCellValue(account: Account, key: ExportColumn["key"]): string | number {
  if (key === "status") {
    return getAccountStatus(account);
  }
  if (key === "is_activated" || key === "is_banned") {
    return account[key] ? "Yes" : "No";
  }
  return account[key] ?? "";
}

/**
 * Sort accounts by field and direction
 */
function sortAccounts(
  accounts: Account[],
  sortField: SortField,
  sortDirection: SortDirection
): Account[] {
  return [...accounts].sort((a, b) => {
    let aVal: string | number | boolean;
    let bVal: string | number | boolean;

    if (sortField === "status") {
      aVal = getAccountStatus(a);
      bVal = getAccountStatus(b);
    } else {
      aVal = a[sortField as keyof Account] as string | number | boolean;
      bVal = b[sortField as keyof Account] as string | number | boolean;
    }

    // Handle different types
    if (typeof aVal === "boolean") {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    }

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
 * Generate PDF export of accounts
 */
export function generatePDF(accounts: Account[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "accounts_export" } = options;
  const enabledColumns = columns.filter((col) => col.enabled);

  if (enabledColumns.length === 0) {
    throw new Error("At least one column must be selected for export");
  }

  // Sort accounts
  const sortedAccounts = sortAccounts(accounts, sortField, sortDirection);

  // Prepare table data
  const headers = enabledColumns.map((col) => col.label);
  const rows = sortedAccounts.map((account) =>
    enabledColumns.map((col) => String(getCellValue(account, col.key)))
  );

  // Create PDF
  const doc = new jsPDF({
    orientation: enabledColumns.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add title
  const title = "Accounts Export";
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
  doc.text(`Total Records: ${sortedAccounts.length}`, pageWidth / 2, 34, {
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
 * Generate Excel export of accounts
 */
export function generateExcel(accounts: Account[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "accounts_export" } = options;
  const enabledColumns = columns.filter((col) => col.enabled);

  if (enabledColumns.length === 0) {
    throw new Error("At least one column must be selected for export");
  }

  // Sort accounts
  const sortedAccounts = sortAccounts(accounts, sortField, sortDirection);

  // Prepare data with headers
  const headers = enabledColumns.map((col) => col.label);
  const rows = sortedAccounts.map((account) =>
    enabledColumns.map((col) => getCellValue(account, col.key))
  );

  // Create worksheet
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const colWidths = enabledColumns.map((col) => {
    switch (col.key) {
      case "id":
        return { wch: 8 };
      case "email":
        return { wch: 30 };
      case "full_name":
        return { wch: 25 };
      case "username":
        return { wch: 20 };
      case "position":
        return { wch: 20 };
      case "points":
        return { wch: 10 };
      case "status":
        return { wch: 12 };
      default:
        return { wch: 15 };
    }
  });
  worksheet["!cols"] = colWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");

  // Add metadata sheet
  const metaData = [
    ["Accounts Export Report"],
    [],
    ["Generated On", new Date().toLocaleString()],
    ["Total Records", sortedAccounts.length],
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
 * Export accounts using specified options
 */
export function exportAccounts(accounts: Account[], options: ExportOptions): void {
  if (options.format === "pdf") {
    generatePDF(accounts, options);
  } else {
    generateExcel(accounts, options);
  }
}
