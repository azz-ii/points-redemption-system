import type { MarketingUser } from "../components/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportColumn {
  key: keyof MarketingUser | "assigned_legends_text" | "status";
  label: string;
  enabled: boolean;
}

export type SortField = keyof MarketingUser | "assigned_legends_text" | "status";
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
  { key: "assigned_legends_text", label: "Assigned Legends", enabled: true },
  { key: "points", label: "Points", enabled: false },
  { key: "status", label: "Status", enabled: true },
];

/**
 * Format assigned legends for display
 */
function formatAssignedLegends(user: MarketingUser): string {
  if (!user.assigned_legends || user.assigned_legends.length === 0) {
    return "None";
  }
  return user.assigned_legends
    .map((assignment) => `${assignment.legend} (${assignment.item_count})`)
    .join(", ");
}

/**
 * Get user status
 */
function getUserStatus(user: MarketingUser): string {
  if (user.is_banned) return "Banned";
  if (!user.is_activated) return "Inactive";
  return "Active";
}

/**
 * Get cell value for export
 */
function getCellValue(user: MarketingUser, key: ExportColumn["key"]): string | number {
  switch (key) {
    case "assigned_legends_text":
      return formatAssignedLegends(user);
    case "status":
      return getUserStatus(user);
    default: {
      const value = user[key as keyof MarketingUser];
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
 * Sort marketing users by field and direction
 */
function sortUsers(
  users: MarketingUser[],
  sortField: SortField,
  sortDirection: SortDirection
): MarketingUser[] {
  return [...users].sort((a, b) => {
    let aVal: string | number | undefined;
    let bVal: string | number | undefined;

    if (sortField === "assigned_legends_text") {
      aVal = formatAssignedLegends(a);
      bVal = formatAssignedLegends(b);
    } else if (sortField === "status") {
      aVal = getUserStatus(a);
      bVal = getUserStatus(b);
    } else {
      aVal = a[sortField as keyof MarketingUser] as string | number | undefined;
      bVal = b[sortField as keyof MarketingUser] as string | number | undefined;
    }

    // Handle undefined/null values
    if (aVal === undefined || aVal === null) aVal = "";
    if (bVal === undefined || bVal === null) bVal = "";

    // Compare values
    if (typeof aVal === "string" && typeof bVal === "string") {
      const comparison = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    // Convert to string for comparison
    const aStr = String(aVal);
    const bStr = String(bVal);
    const comparison = aStr.localeCompare(bStr, undefined, { sensitivity: "base" });
    return sortDirection === "asc" ? comparison : -comparison;
  });
}

/**
 * Generate PDF export of marketing users
 */
export function generatePDF(users: MarketingUser[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "marketing_users_export" } = options;
  const enabledColumns = columns.filter((col) => col.enabled);

  if (enabledColumns.length === 0) {
    throw new Error("At least one column must be selected for export");
  }

  // Sort users
  const sortedUsers = sortUsers(users, sortField, sortDirection);

  // Prepare table data
  const headers = enabledColumns.map((col) => col.label);
  const rows = sortedUsers.map((user) =>
    enabledColumns.map((col) => String(getCellValue(user, col.key)))
  );

  // Create PDF
  const doc = new jsPDF({
    orientation: enabledColumns.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add title
  const title = "Marketing Users Export";
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
  doc.text(`Total Users: ${sortedUsers.length}`, pageWidth / 2, 34, {
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
    columnStyles: enabledColumns.reduce((acc, col, idx) => {
      // Wider columns for email and assigned legends
      if (col.key === "email" || col.key === "assigned_legends_text") {
        acc[idx] = { cellWidth: 45 };
      }
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
  });

  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Generate Excel export of marketing users
 */
export function generateExcel(users: MarketingUser[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "marketing_users_export" } = options;
  const enabledColumns = columns.filter((col) => col.enabled);

  if (enabledColumns.length === 0) {
    throw new Error("At least one column must be selected for export");
  }

  // Sort users
  const sortedUsers = sortUsers(users, sortField, sortDirection);

  // Prepare data with headers
  const headers = enabledColumns.map((col) => col.label);
  const rows = sortedUsers.map((user) =>
    enabledColumns.map((col) => getCellValue(user, col.key))
  );

  // Create worksheet
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const colWidths = enabledColumns.map((col) => {
    switch (col.key) {
      case "id":
        return { wch: 8 };
      case "username":
        return { wch: 15 };
      case "full_name":
        return { wch: 25 };
      case "email":
        return { wch: 30 };
      case "position":
        return { wch: 12 };
      case "assigned_legends_text":
        return { wch: 40 };
      case "points":
        return { wch: 10 };
      case "status":
        return { wch: 10 };
      default:
        return { wch: 15 };
    }
  });
  worksheet["!cols"] = colWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Marketing Users");

  // Calculate status summary
  const activeUsers = sortedUsers.filter((u) => !u.is_banned && u.is_activated).length;
  const inactiveUsers = sortedUsers.filter((u) => !u.is_banned && !u.is_activated).length;
  const bannedUsers = sortedUsers.filter((u) => u.is_banned).length;

  // Add metadata sheet
  const metaData = [
    ["Marketing Users Export Report"],
    [],
    ["Generated On", new Date().toLocaleString()],
    ["Total Users", sortedUsers.length],
    ["Sort Field", enabledColumns.find((c) => c.key === sortField)?.label || sortField],
    ["Sort Direction", sortDirection === "asc" ? "Ascending" : "Descending"],
    [],
    ["User Status Summary"],
    ["Active", activeUsers],
    ["Inactive", inactiveUsers],
    ["Banned", bannedUsers],
  ];
  const metaSheet = XLSX.utils.aoa_to_sheet(metaData);
  metaSheet["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, metaSheet, "Export Info");

  // Save file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export marketing users using specified options
 */
export function exportMarketingUsers(users: MarketingUser[], options: ExportOptions): void {
  if (options.format === "pdf") {
    generatePDF(users, options);
  } else {
    generateExcel(users, options);
  }
}
