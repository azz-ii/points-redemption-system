import type { RequestItem } from "../modals/types";
import * as XLSX from "xlsx";

/**
 * Export history data to CSV format
 */
export function exportToCSV(requests: RequestItem[], filename: string = "history_export"): void {
  if (requests.length === 0) {
    throw new Error("No data to export");
  }

  // Define CSV headers
  const headers = [
    "Request ID",
    "Requested By",
    "Requested For",
    "Total Points",
    "Status",
    "Processing Status",
    "Date Requested",
    "Date Processed",
  ];

  // Convert data to CSV rows
  const rows = requests.map((request) => [
    request.id,
    request.requested_by_name,
    request.requested_for_name,
    request.total_points,
    request.status_display,
    request.processing_status_display,
    new Date(request.date_requested).toLocaleDateString(),
    request.date_processed ? new Date(request.date_processed).toLocaleDateString() : "N/A",
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export history data to Excel format
 */
export function exportToExcel(requests: RequestItem[], filename: string = "history_export"): void {
  if (requests.length === 0) {
    throw new Error("No data to export");
  }

  // Prepare data with headers
  const headers = [
    "Request ID",
    "Requested By",
    "Requested For",
    "Total Points",
    "Status",
    "Processing Status",
    "Date Requested",
    "Date Processed",
  ];

  const rows = requests.map((request) => [
    request.id,
    request.requested_by_name,
    request.requested_for_name,
    request.total_points,
    request.status_display,
    request.processing_status_display,
    new Date(request.date_requested).toLocaleDateString(),
    request.date_processed ? new Date(request.date_processed).toLocaleDateString() : "N/A",
  ]);

  // Create worksheet
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 12 }, // Request ID
    { wch: 25 }, // Requested By
    { wch: 25 }, // Requested For
    { wch: 15 }, // Total Points
    { wch: 15 }, // Status
    { wch: 20 }, // Processing Status
    { wch: 15 }, // Date Requested
    { wch: 15 }, // Date Processed
  ];

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "History");

  // Add metadata sheet
  const metaData = [
    ["Redemption History Export"],
    [],
    ["Generated On", new Date().toLocaleString()],
    ["Total Records", requests.length],
  ];
  const metaSheet = XLSX.utils.aoa_to_sheet(metaData);
  metaSheet["!cols"] = [{ wch: 20 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, metaSheet, "Export Info");

  // Save file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
