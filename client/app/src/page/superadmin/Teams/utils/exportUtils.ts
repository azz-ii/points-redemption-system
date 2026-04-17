import type { Team } from "../modals/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportColumn {
  key: keyof Team | "approver_name" | "formatted_date";
  label: string;
  enabled: boolean;
}

export type SortField = keyof Team | "approver_name" | "formatted_date";
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
  { key: "approver_name", label: "Approver", enabled: true },
  { key: "member_count", label: "Members", enabled: true },
  { key: "formatted_date", label: "Created Date", enabled: true },
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
function getCellValue(team: Team, key: ExportColumn["key"]): string | number {
  if (key === "formatted_date") {
    return formatDate(team.created_at);
  }
  if (key === "approver_name") {
    return team.approver_details?.full_name || "";
  }
  if (key === "approver_details" || key === "updated_at" || key === "created_at") {
    // Handle dates and complex objects
    if (typeof team[key as keyof Team] === "string") {
      return formatDate(team[key as keyof Team] as string);
    }
    return "";
  }
  const value = team[key as keyof Team];
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value ?? "");
}

/**
 * Sort teams by field and direction
 */
function sortTeams(
  teams: Team[],
  sortField: SortField,
  sortDirection: SortDirection
): Team[] {
  return [...teams].sort((a, b) => {
    let aVal: string | number = "";
    let bVal: string | number = "";

    if (sortField === "formatted_date") {
      aVal = a.created_at || "";
      bVal = b.created_at || "";
    } else if (sortField === "approver_name") {
      aVal = a.approver_details?.full_name || "";
      bVal = b.approver_details?.full_name || "";
    } else {
      const aData = a[sortField as keyof Team];
      const bData = b[sortField as keyof Team];
      aVal = String(aData ?? "");
      bVal = String(bData ?? "");
    }

    // Handle undefined values
    if (aVal === undefined || aVal === null) aVal = "";
    if (bVal === undefined || bVal === null) bVal = "";

    // Compare values
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    // Try numeric comparison if both look like numbers
    const aNum = parseFloat(aStr);
    const bNum = parseFloat(bStr);
    
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    }

    // String comparison
    const comparison = aStr.localeCompare(bStr, undefined, { sensitivity: "base" });
    return sortDirection === "asc" ? comparison : -comparison;
  });
}

/**
 * Generate PDF export of teams
 */
export function generatePDF(teams: Team[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "teams_export" } = options;
  const enabledColumns = columns.filter((col) => col.enabled);

  if (enabledColumns.length === 0) {
    throw new Error("At least one column must be selected for export");
  }

  // Sort teams
  const sortedTeams = sortTeams(teams, sortField, sortDirection);

  // Prepare table data
  const headers = enabledColumns.map((col) => col.label);
  const rows = sortedTeams.map((team) =>
    enabledColumns.map((col) => String(getCellValue(team, col.key)))
  );

  // Create PDF
  const doc = new jsPDF({
    orientation: enabledColumns.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add title
  const title = "Teams Export";
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
  doc.text(`Total Records: ${sortedTeams.length}`, pageWidth / 2, 34, {
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
 * Generate Excel export of teams
 */
export function generateExcel(teams: Team[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "teams_export" } = options;
  const enabledColumns = columns.filter((col) => col.enabled);

  if (enabledColumns.length === 0) {
    throw new Error("At least one column must be selected for export");
  }

  // Sort teams
  const sortedTeams = sortTeams(teams, sortField, sortDirection);

  // Prepare data with headers
  const headers = enabledColumns.map((col) => col.label);
  const rows = sortedTeams.map((team) =>
    enabledColumns.map((col) => getCellValue(team, col.key))
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
      case "approver_name":
        return { wch: 25 };
      case "member_count":
        return { wch: 12 };
      case "formatted_date":
        return { wch: 15 };
      default:
        return { wch: 15 };
    }
  });
  worksheet["!cols"] = colWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Teams");

  // Add metadata sheet
  const metaData = [
    ["Teams Export Report"],
    [],
    ["Generated On", new Date().toLocaleString()],
    ["Total Records", sortedTeams.length],
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
 * Export teams using specified options
 */
export function exportTeams(teams: Team[], options: ExportOptions): void {
  if (options.format === "pdf") {
    generatePDF(teams, options);
  } else {
    generateExcel(teams, options);
  }
}
