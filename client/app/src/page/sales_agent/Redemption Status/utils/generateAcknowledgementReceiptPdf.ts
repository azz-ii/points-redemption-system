import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { RedemptionRequest } from "../modals/types";

function formatArDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

/**
 * Generates the AR PDF. Optionally embeds a signature image in the 'Received by' block if provided.
 * @param request RedemptionRequest object
 * @param arNumber AR number string
 * @param arDate Date object
 * @param signatureDataUrl Optional: base64 or data URL of signature image
 * @param receiverName Optional: Printed name to show below the signature line
 */
export async function generateAcknowledgementReceiptPdf(
  request: RedemptionRequest,
  arNumber: string,
  arDate: Date,
  signatureDataUrl?: string | null,
  receiverName?: string | null
): Promise<Blob> {
  // A5 landscape: 210 x 148 mm
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a5",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 14;
  const marginRight = 14;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let y = 14;

  // ── Header ──
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Oracle Petroleum Corp.", pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bolditalic");
  doc.text("ACKNOWLEDGEMENT RECEIPT", pageWidth / 2, y, { align: "center" });
  y += 10;

  // ── TO / AR NO / DATE row ──
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TO:", marginLeft, y);
  doc.setFont("helvetica", "normal");

  // Underlined TO value
  const toX = marginLeft + 12;
  const toValue = request.requested_for_name || "—";
  doc.text(toValue, toX, y);
  doc.line(toX, y + 1, toX + 60, y + 1);

  // AR NO and DATE on the right
  const rightCol = pageWidth - marginRight - 60;
  doc.setFont("helvetica", "bold");
  doc.text("AR NO.", rightCol, y);
  doc.setFont("helvetica", "normal");
  doc.text(arNumber, rightCol + 18, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("DATE:", rightCol, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatArDate(arDate), rightCol + 18, y);

  y += 10;

  // ── Body text ──
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("I hereby acknowledge the receipt of the following item/s:", pageWidth / 2, y, {
    align: "center",
  });
  y += 6;

  // ── Items table ──
  const headers = ["Item", "Code", "Qty", "Points/Item", "Subtotal"];
  const rows = request.items.map((item) => [
    item.product_name,
    item.product_code,
    String(item.quantity),
    String(item.points_per_item),
    String(item.total_points),
  ]);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: y,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
    },
    bodyStyles: {
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 28 },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 24, halign: "right" },
    },
    margin: { left: marginLeft, right: marginRight },
  });

  // Get Y after table
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── *NOTHING TO FOLLOW* ──
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("*NOTHING TO FOLLOW*", pageWidth / 2, y, { align: "center" });
  y += 8;

  // ── REMARKS ──
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("REMARKS:", marginLeft, y);
  doc.setFont("helvetica", "normal");
  doc.line(marginLeft + 24, y + 1, pageWidth - marginRight, y + 1);
  y += 10;


  // ── Signature block ──
  const colCount = 4;
  const colWidth = contentWidth / colCount;
  const labels = ["Prepared by:", "Checked by:", "Received by:", "Date Received:"];
  const signatureY = y;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  labels.forEach((label, i) => {
    const colX = marginLeft + i * colWidth;
    doc.text(label, colX, signatureY);
  });

  // Blank signature lines
  const lineY = signatureY + 14;
  labels.forEach((_, i) => {
    const colX = marginLeft + i * colWidth;
    doc.line(colX, lineY, colX + colWidth - 6, lineY);
  });

  // Insert signature image in 'Received by' block if provided
  if (signatureDataUrl) {
    try {
      // Place signature image above the line in the 'Received by' column (index 2)
      const sigCol = 2;
      const sigX = marginLeft + sigCol * colWidth + 2;
      const sigY = signatureY + 2;
      const sigWidth = colWidth - 10;
      const sigHeight = 12;
      doc.addImage(signatureDataUrl, 'PNG', sigX, sigY, sigWidth, sigHeight, undefined, 'FAST');
    } catch (_) {
      // Fallback: ignore image if it fails
      // Optionally log error
    }
  }

  // "PRINTED NAME & SIGNATURE" labels
  const captionY = lineY + 4;
  
  // Receiver name above the "PRINTED NAME & SIGNATURE" text if provided
  if (receiverName) {
    const rx = marginLeft + 2 * colWidth; // "Received by" column
    // Try to center the text above the line if it is short, otherwise print from left
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(receiverName.toUpperCase(), rx + colWidth / 2 - 3, captionY - 5, { align: "center" });
  }

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  labels.forEach((label, i) => {
    const colX = marginLeft + i * colWidth;
    if (label !== "Date Received:") {
      doc.text("PRINTED NAME & SIGNATURE", colX, captionY);
    }
  });

  // ── Return Blob instead of saving directly ──
  return doc.output("blob");
}
