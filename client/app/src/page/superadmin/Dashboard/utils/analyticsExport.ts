/**
 * Export utilities for analytics reports.
 * Supports PDF and Excel export of analytics data.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type {
  AnalyticsOverview,
  TimeSeriesEntry,
  ItemPopularity,
  AgentPerformance,
  TeamPerformance,
  TurnaroundData,
  EntityAnalytics,
} from "./analyticsApi";

interface AutoTableDoc {
  lastAutoTable?: { finalY: number };
}

function getAutoTableY(doc: jsPDF, fallback: number): number {
  const d = doc as unknown as AutoTableDoc;
  return d.lastAutoTable?.finalY ? d.lastAutoTable.finalY + 8 : fallback + 50;
}

export interface AnalyticsExportData {
  overview?: AnalyticsOverview | null;
  timeSeries?: TimeSeriesEntry[];
  items?: ItemPopularity[];
  agents?: AgentPerformance[];
  teams?: TeamPerformance[];
  turnaround?: TurnaroundData | null;
  distributors?: EntityAnalytics[];
  customers?: EntityAnalytics[];
}

export interface AnalyticsExportSection {
  key: keyof AnalyticsExportData;
  label: string;
  enabled: boolean;
}

export const DEFAULT_EXPORT_SECTIONS: AnalyticsExportSection[] = [
  { key: "overview", label: "Overview Stats", enabled: true },
  { key: "timeSeries", label: "Time-Series Trends", enabled: true },
  { key: "items", label: "Item Popularity", enabled: true },
  { key: "agents", label: "Agent Performance", enabled: true },
  { key: "teams", label: "Team Performance", enabled: true },
  { key: "turnaround", label: "Turnaround Time", enabled: true },
  { key: "distributors", label: "Top Distributors", enabled: true },
  { key: "customers", label: "Top Customers", enabled: true },
];

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── PDF Export ───────────────────────────────────────────

export function exportAnalyticsPDF(
  data: AnalyticsExportData,
  sections: AnalyticsExportSection[],
): void {
  const doc = new jsPDF({ orientation: "landscape" });
  const enabled = sections.filter((s) => s.enabled);
  let y = 14;

  doc.setFontSize(18);
  doc.text("Analytics Report", 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 10;

  for (const section of enabled) {
    // Page break if close to bottom
    if (y > 170) {
      doc.addPage();
      y = 14;
    }

    doc.setFontSize(14);
    doc.text(section.label, 14, y);
    y += 6;

    if (section.key === "overview" && data.overview) {
      const o = data.overview;
      autoTable(doc, {
        startY: y,
        head: [["Metric", "Value"]],
        body: [
          ["Total Requests", String(o.total_requests)],
          ["Approved", String(o.approved_count)],
          ["Rejected", String(o.rejected_count)],
          ["Processed", String(o.processed_count)],
          ["Cancelled", String(o.cancelled_count)],
          ["Points Redeemed", o.total_points_redeemed.toLocaleString()],
          ["Active Distributors", String(o.on_board_count)],
          ["Active Customers", String(o.customers_count)],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      y = getAutoTableY(doc, y);
    }

    if (section.key === "timeSeries" && data.timeSeries?.length) {
      autoTable(doc, {
        startY: y,
        head: [["Date", "Requests", "Points Redeemed", "Approved", "Rejected"]],
        body: data.timeSeries.map((e) => [
          fmtDate(e.date),
          String(e.request_count),
          e.points_redeemed.toLocaleString(),
          String(e.approved_count),
          String(e.rejected_count),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      y = getAutoTableY(doc, y);
    }

    if (section.key === "items" && data.items?.length) {
      autoTable(doc, {
        startY: y,
        head: [["Item", "Code", "Category", "Qty", "Points", "Requests"]],
        body: data.items.map((e) => [
          e.item_name,
          e.item_code,
          e.legend,
          String(e.total_quantity),
          e.total_points.toLocaleString(),
          String(e.request_count),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      y = getAutoTableY(doc, y);
    }

    if (section.key === "agents" && data.agents?.length) {
      autoTable(doc, {
        startY: y,
        head: [["Agent", "Team", "Requests", "Approved", "Rejected", "Rate %", "Points"]],
        body: data.agents.map((e) => [
          e.agent_name,
          e.team_name || "-",
          String(e.total_requests),
          String(e.approved_count),
          String(e.rejected_count),
          `${e.approval_rate}%`,
          e.total_points.toLocaleString(),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      y = getAutoTableY(doc, y);
    }

    if (section.key === "teams" && data.teams?.length) {
      autoTable(doc, {
        startY: y,
        head: [["Team", "Requests", "Approved", "Rejected", "Rate %", "Points"]],
        body: data.teams.map((e) => [
          e.team_name,
          String(e.total_requests),
          String(e.approved_count),
          String(e.rejected_count),
          `${e.approval_rate}%`,
          e.total_points.toLocaleString(),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      y = getAutoTableY(doc, y);
    }

    if (section.key === "turnaround" && data.turnaround) {
      const o = data.turnaround.overall;
      autoTable(doc, {
        startY: y,
        head: [["Stage", "Avg Hours"]],
        body: [
          ["Request → Review", o.avg_request_to_review_hours != null ? `${o.avg_request_to_review_hours}h` : "N/A"],
          ["Review → Process", o.avg_review_to_process_hours != null ? `${o.avg_review_to_process_hours}h` : "N/A"],
          ["Total", o.avg_total_hours != null ? `${o.avg_total_hours}h` : "N/A"],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      y = getAutoTableY(doc, y);
    }

    const entityData = section.key === "distributors" ? data.distributors : section.key === "customers" ? data.customers : null;
    if (entityData?.length) {
      autoTable(doc, {
        startY: y,
        head: [["Name", "Requests", "Points", "Processed"]],
        body: entityData.map((e) => [
          e.entity_name,
          String(e.request_count),
          e.total_points.toLocaleString(),
          String(e.processed_count),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      y = getAutoTableY(doc, y);
    }
  }

  doc.save(`analytics-report-${Date.now()}.pdf`);
}

// ── Excel Export ─────────────────────────────────────────

export function exportAnalyticsExcel(
  data: AnalyticsExportData,
  sections: AnalyticsExportSection[],
): void {
  const wb = XLSX.utils.book_new();
  const enabled = sections.filter((s) => s.enabled);

  for (const section of enabled) {
    if (section.key === "overview" && data.overview) {
      const o = data.overview;
      const ws = XLSX.utils.json_to_sheet([
        { Metric: "Total Requests", Value: o.total_requests },
        { Metric: "Pending", Value: o.pending_count },
        { Metric: "Approved", Value: o.approved_count },
        { Metric: "Rejected", Value: o.rejected_count },
        { Metric: "Processed", Value: o.processed_count },
        { Metric: "Cancelled", Value: o.cancelled_count },
        { Metric: "Total Points Redeemed", Value: o.total_points_redeemed },
        { Metric: "Active Distributors", Value: o.on_board_count },
        { Metric: "Active Customers", Value: o.customers_count },
      ]);
      ws["!cols"] = [{ wch: 25 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, "Overview");
    }

    if (section.key === "timeSeries" && data.timeSeries?.length) {
      const ws = XLSX.utils.json_to_sheet(
        data.timeSeries.map((e) => ({
          Date: fmtDate(e.date),
          Requests: e.request_count,
          "Points Redeemed": e.points_redeemed,
          Approved: e.approved_count,
          Rejected: e.rejected_count,
        })),
      );
      ws["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws, "Trends");
    }

    if (section.key === "items" && data.items?.length) {
      const ws = XLSX.utils.json_to_sheet(
        data.items.map((e) => ({
          "Item Name": e.item_name,
          "Item Code": e.item_code,
          Category: e.legend,
          "Total Qty": e.total_quantity,
          "Total Points": e.total_points,
          Requests: e.request_count,
        })),
      );
      ws["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws, "Items");
    }

    if (section.key === "agents" && data.agents?.length) {
      const ws = XLSX.utils.json_to_sheet(
        data.agents.map((e) => ({
          Agent: e.agent_name,
          Team: e.team_name || "-",
          "Total Requests": e.total_requests,
          Approved: e.approved_count,
          Rejected: e.rejected_count,
          "Approval Rate %": e.approval_rate,
          "Total Points": e.total_points,
        })),
      );
      ws["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, "Agents");
    }

    if (section.key === "teams" && data.teams?.length) {
      const ws = XLSX.utils.json_to_sheet(
        data.teams.map((e) => ({
          Team: e.team_name,
          "Total Requests": e.total_requests,
          Approved: e.approved_count,
          Rejected: e.rejected_count,
          "Approval Rate %": e.approval_rate,
          "Total Points": e.total_points,
        })),
      );
      ws["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, "Teams");
    }

    if (section.key === "turnaround" && data.turnaround) {
      const o = data.turnaround.overall;
      const rows = [
        { Stage: "Request → Review", "Avg Hours": o.avg_request_to_review_hours ?? "N/A" },
        { Stage: "Review → Process", "Avg Hours": o.avg_review_to_process_hours ?? "N/A" },
        { Stage: "Total", "Avg Hours": o.avg_total_hours ?? "N/A" },
      ];
      if (data.turnaround.trend.length) {
        rows.push({ Stage: "", "Avg Hours": "" } as never);
        rows.push({ Stage: "--- Monthly Trend ---", "Avg Hours": "" } as never);
        for (const t of data.turnaround.trend) {
          rows.push({ Stage: fmtDate(t.month), "Avg Hours": t.avg_total_hours ?? "N/A" } as never);
        }
      }
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [{ wch: 22 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, "Turnaround");
    }

    const entityData =
      section.key === "distributors"
        ? data.distributors
        : section.key === "customers"
          ? data.customers
          : null;
    if (entityData?.length) {
      const ws = XLSX.utils.json_to_sheet(
        entityData.map((e) => ({
          Name: e.entity_name,
          Type: e.entity_type,
          Requests: e.request_count,
          "Total Points": e.total_points,
          Processed: e.processed_count,
        })),
      );
      ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(
        wb,
        ws,
        section.key === "distributors" ? "Distributors" : "Customers",
      );
    }
  }

  // Metadata
  const meta = XLSX.utils.json_to_sheet([
    { Field: "Report Generated", Value: new Date().toLocaleString() },
    { Field: "Sections Included", Value: enabled.map((s) => s.label).join(", ") },
  ]);
  meta["!cols"] = [{ wch: 20 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, meta, "Info");

  XLSX.writeFile(wb, `analytics-report-${Date.now()}.xlsx`);
}
