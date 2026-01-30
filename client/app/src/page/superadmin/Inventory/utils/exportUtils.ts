import type { InventoryItem } from "../modals";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface ExportColumn {
  key: keyof InventoryItem;
  label: string;
  enabled: boolean;
}

export type SortField = keyof InventoryItem;
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
  { key: "category", label: "Category", enabled: true },
  { key: "legend", label: "Legend", enabled: true },
  { key: "stock", label: "Stock", enabled: true },
  { key: "committed_stock", label: "Committed", enabled: true },
  { key: "available_stock", label: "Available", enabled: true },
  { key: "stock_status", label: "Status", enabled: true },
  { key: "points", label: "Points", enabled: false },
  { key: "price", label: "Price", enabled: false },
];

/**
 * Get cell value for export
 */
function getCellValue(item: InventoryItem, key: ExportColumn["key"]): string | number {
  switch (key) {
    case "legend": {
      // Format legend to be more readable
      const legendMap: Record<string, string> = {
        GIVEAWAY: "Giveaway",
        MERCH: "Merch",
        PROMO: "Promo",
        AD_MATERIALS: "Ad Materials",
        POINT_OF_SALE: "Point of Sale",
        OTHERS: "Others",
      };
      return legendMap[item.legend] || item.legend;
    }
    default: {
      const value = item[key];
      return value ?? "";
    }
  }
}

/**
 * Sort inventory items by field and direction
 */
function sortItems(
  items: InventoryItem[],
  sortField: SortField,
  sortDirection: SortDirection
): InventoryItem[] {
  return [...items].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    // Handle undefined/null values
    const aValue = aVal === undefined || aVal === null ? "" : aVal;
    const bValue = bVal === undefined || bVal === null ? "" : bVal;

    // Compare values
    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Convert to string for comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr, undefined, { sensitivity: "base" });
    return sortDirection === "asc" ? comparison : -comparison;
  });
}

/**
 * Generate PDF export of inventory items
 */
export function generatePDF(items: InventoryItem[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "inventory_export" } = options;
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
    orientation: enabledColumns.length > 6 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add title
  const title = "Inventory Export";
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

  // Add stock summary
  const inStock = sortedItems.filter((i) => i.stock_status === "In Stock").length;
  const lowStock = sortedItems.filter((i) => i.stock_status === "Low Stock").length;
  const outOfStock = sortedItems.filter((i) => i.stock_status === "Out of Stock").length;
  doc.text(
    `In Stock: ${inStock} | Low Stock: ${lowStock} | Out of Stock: ${outOfStock}`,
    pageWidth / 2,
    40,
    { align: "center" }
  );

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 48,
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
    margin: { top: 48, right: 14, bottom: 20, left: 14 },
    didParseCell: function (data) {
      // Highlight stock status column
      if (data.column.index === enabledColumns.findIndex((c) => c.key === "stock_status")) {
        const value = String(data.cell.raw);
        if (value === "Out of Stock") {
          data.cell.styles.textColor = [220, 38, 38]; // red
          data.cell.styles.fontStyle = "bold";
        } else if (value === "Low Stock") {
          data.cell.styles.textColor = [202, 138, 4]; // yellow
          data.cell.styles.fontStyle = "bold";
        } else if (value === "In Stock") {
          data.cell.styles.textColor = [22, 163, 74]; // green
        }
      }
    },
  });

  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Generate Excel export of inventory items
 */
export function generateExcel(items: InventoryItem[], options: ExportOptions): void {
  const { columns, sortField, sortDirection, filename = "inventory_export" } = options;
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
      case "category":
        return { wch: 20 };
      case "legend":
        return { wch: 14 };
      case "stock":
        return { wch: 8 };
      case "committed_stock":
        return { wch: 12 };
      case "available_stock":
        return { wch: 12 };
      case "stock_status":
        return { wch: 14 };
      case "points":
        return { wch: 10 };
      case "price":
        return { wch: 12 };
      default:
        return { wch: 15 };
    }
  });
  worksheet["!cols"] = colWidths;

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

  // Calculate stock summary
  const inStock = sortedItems.filter((i) => i.stock_status === "In Stock").length;
  const lowStock = sortedItems.filter((i) => i.stock_status === "Low Stock").length;
  const outOfStock = sortedItems.filter((i) => i.stock_status === "Out of Stock").length;

  // Add metadata sheet
  const metaData = [
    ["Inventory Export Report"],
    [],
    ["Generated On", new Date().toLocaleString()],
    ["Total Records", sortedItems.length],
    ["Sort Field", enabledColumns.find((c) => c.key === sortField)?.label || sortField],
    ["Sort Direction", sortDirection === "asc" ? "Ascending" : "Descending"],
    [],
    ["Stock Summary"],
    ["In Stock", inStock],
    ["Low Stock", lowStock],
    ["Out of Stock", outOfStock],
  ];
  const metaSheet = XLSX.utils.aoa_to_sheet(metaData);
  metaSheet["!cols"] = [{ wch: 15 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, metaSheet, "Export Info");

  // Save file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export inventory items using specified options
 */
export function exportInventoryItems(items: InventoryItem[], options: ExportOptions): void {
  if (options.format === "pdf") {
    generatePDF(items, options);
  } else {
    generateExcel(items, options);
  }
}
