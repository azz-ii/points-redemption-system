import type { CatalogueVariant } from "../modals";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportColumn {
  key: keyof CatalogueVariant | "formatted_date" | "status";
  label: string;
  enabled: boolean;
}

export type SortField = keyof CatalogueVariant | "formatted_date" | "status";
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
  { key: "item_name", label: "Item Name", enabled: true },
  { key: "item_code", label: "Item Code", enabled: true },
  { key: "legend", label: "Category", enabled: true },
  { key: "reward", label: "Reward", enabled: true },
  { key: "option_description", label: "Variant", enabled: true },
  { key: "points", label: "Points", enabled: true },
  { key: "price", label: "Price", enabled: true },
  { key: "status", label: "Status", enabled: true },
  { key: "formatted_date", label: "Date Added", enabled: true },
  { key: "pricing_type", label: "Pricing Type", enabled: false },
  { key: "description", label: "Description", enabled: false },
  { key: "purpose", label: "Purpose", enabled: false },
  { key: "specifications", label: "Specifications", enabled: false },
  { key: "needs_driver", label: "Needs Driver", enabled: false },
  { key: "mktg_admin_name", label: "Marketing Admin", enabled: false },
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
function getCellValue(item: CatalogueVariant, key: ExportColumn["key"]): string | number {
  switch (key) {
    case "formatted_date":
      return formatDate(item.date_added);
    case "status":
      return item.is_archived ? "Archived" : "Active";
    case "needs_driver":
      return item.needs_driver ? "Yes" : "No";
    case "legend": {
      // Format legend to be more readable
      const legendMap: Record<string, string> = {
        COLLATERAL: "Collateral",
        GIVEAWAY: "Giveaway",
        ASSET: "Asset",
        BENEFIT: "Benefit",
      };
      return legendMap[item.legend] || item.legend;
    }
    case "pricing_type": {
      // Format pricing type to be more readable
      const pricingMap: Record<string, string> = {
        FIXED: "Fixed",
        PER_SQFT: "Per Sq Ft",
        PER_INVOICE: "Per Invoice",
        PER_DAY: "Per Day",
        PER_EU_SRP: "Per EU SRP",
      };
      return pricingMap[item.pricing_type || "FIXED"] || item.pricing_type || "Fixed";
    }
    default: {
      const value = item[key as keyof CatalogueVariant];
      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      }
      return value ?? "";
    }
  }
}

/**
 * Sort catalogue items by field and direction
 */
function sortItems(
  items: CatalogueVariant[],
  sortField: SortField,
  sortDirection: SortDirection
): CatalogueVariant[] {
  return [...items].sort((a, b) => {
    let aVal: string | number | undefined;
    let bVal: string | number | undefined;

    if (sortField === "formatted_date") {
      aVal = a.date_added || "";
      bVal = b.date_added || "";
    } else if (sortField === "status") {
      aVal = a.is_archived ? "Archived" : "Active";
      bVal = b.is_archived ? "Archived" : "Active";
    } else {
      aVal = a[sortField as keyof CatalogueVariant] as string | number | undefined;
      bVal = b[sortField as keyof CatalogueVariant] as string | number | undefined;
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
 * Generate PDF export of catalogue items
 */
export function generatePDF(items: CatalogueVariant[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "catalogue_export" } = options;
  const enabledColumns = columns.filter((col) => col.enabled);

  if (enabledColumns.length === 0) {
    throw new Error("At least one column must be selected for export");
  }

  // Sort items
  const sortedItems = sortItems(items, sortField, sortDirection);

  // Prepare table data
  const headers = enabledColumns.map((col) => col.label);
  const rows = sortedItems.map((item) =>
    enabledColumns.map((col) => String(getCellValue(item, col.key)))
  );

  // Create PDF
  const doc = new jsPDF({
    orientation: enabledColumns.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add title
  const title = "Catalogue Export";
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
  doc.text(`Total Records: ${sortedItems.length}`, pageWidth / 2, 34, {
    align: "center",
  });

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 42,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [31, 41, 55], // gray-800
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246], // gray-100
    },
    margin: { top: 42, right: 10, bottom: 20, left: 10 },
    columnStyles: enabledColumns.reduce((acc, col, idx) => {
      // Limit description/purpose/specs column widths
      if (["description", "purpose", "specifications"].includes(col.key)) {
        acc[idx] = { cellWidth: 40 };
      }
      return acc;
    }, {} as Record<number, { cellWidth: number }>),
  });

  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Generate Excel export of catalogue items
 */
export function generateExcel(items: CatalogueVariant[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "catalogue_export" } = options;
  const enabledColumns = columns.filter((col) => col.enabled);

  if (enabledColumns.length === 0) {
    throw new Error("At least one column must be selected for export");
  }

  // Sort items
  const sortedItems = sortItems(items, sortField, sortDirection);

  // Prepare data with headers
  const headers = enabledColumns.map((col) => col.label);
  const rows = sortedItems.map((item) =>
    enabledColumns.map((col) => getCellValue(item, col.key))
  );

  // Create worksheet
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const colWidths = enabledColumns.map((col) => {
    switch (col.key) {
      case "id":
        return { wch: 8 };
      case "item_name":
        return { wch: 30 };
      case "item_code":
        return { wch: 12 };
      case "legend":
        return { wch: 12 };
      case "reward":
        return { wch: 15 };
      case "option_description":
        return { wch: 20 };
      case "points":
        return { wch: 10 };
      case "price":
        return { wch: 12 };
      case "status":
        return { wch: 10 };
      case "formatted_date":
        return { wch: 12 };
      case "pricing_type":
        return { wch: 15 };
      case "description":
      case "purpose":
      case "specifications":
        return { wch: 40 };
      case "mktg_admin_name":
        return { wch: 20 };
      default:
        return { wch: 15 };
    }
  });
  worksheet["!cols"] = colWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Catalogue");

  // Add metadata sheet
  const metaData = [
    ["Catalogue Export Report"],
    [],
    ["Generated On", new Date().toLocaleString()],
    ["Total Records", sortedItems.length],
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
 * Export catalogue items using specified options
 */
export function exportCatalogueItems(items: CatalogueVariant[], options: ExportOptions): void {
  if (options.format === "pdf") {
    generatePDF(items, options);
  } else {
    generateExcel(items, options);
  }
}
