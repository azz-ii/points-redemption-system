import { useState, useRef } from "react";
import { X, Upload, Loader2, ImageIcon, Printer, FileText } from "lucide-react";
import { SignatureCapture } from "../components/SignatureCapture";
import { generateAcknowledgementReceiptPdf } from "../utils/generateAcknowledgementReceiptPdf";
import type { RedemptionRequest } from "./types";

type TabMode = "print-esig" | "print-blank" | "upload-image";

interface AcknowledgementReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: RedemptionRequest;
  onUploaded: () => void;
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AcknowledgementReceiptModal({
  isOpen,
  onClose,
  request,
  onUploaded,
}: AcknowledgementReceiptModalProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabMode>("print-esig");

  // Print fields (shared between print-esig and print-blank)
  const [arDate, setArDate] = useState(toDateInputValue(new Date()));
  const [receiverName, setReceiverName] = useState(request.requested_for_name || "");

  // Signature fields (print-esig only)
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureMethod, setSignatureMethod] = useState<"DRAWN" | "PHOTO" | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  // Upload fields (upload-image only)
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shared state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const canUploadAR = request.processing_status === "PROCESSED" && request.ar_status === "PENDING" && request.requested_for_type === "CUSTOMER";

  // --- Signature handlers ---
  const handleSignatureCapture = (file: File, method: "DRAWN" | "PHOTO") => {
    setSignatureFile(file);
    setSignatureMethod(method);
    setSignaturePreview(URL.createObjectURL(file));
  };

  const handleClearSignature = () => {
    setSignatureFile(null);
    setSignatureMethod(null);
    if (signaturePreview) URL.revokeObjectURL(signaturePreview);
    setSignaturePreview(null);
  };

  // --- Upload handlers ---
  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, or WebP)");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }
    setError(null);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getOrReserveArNumber = async (): Promise<string> => {
    // If we already have it in the request data, use it
    if (request.ar_number) return request.ar_number;

    const response = await fetch(`/api/redemption-requests/${request.id}/reserve_ar_number/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error("Failed to reserve AR Number from server");
    }
    const data = await response.json();
    return data.ar_number;
  };

  // --- Submit ---
  const handleSubmit = async () => {
    setError(null);

    if (activeTab === "print-esig") {
      if (!signatureFile) { setError("Please capture a signature"); return; }

      setIsSubmitting(true);
      try {
        const reservedArNumber = await getOrReserveArNumber();

        // Convert signature to data URL
        const signatureDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(signatureFile);
        });

        const finalName = receiverName.trim() || request.requested_for_name || "";

        // Generate PDF with signature
        const pdfBlob = await generateAcknowledgementReceiptPdf(
          request,
          reservedArNumber,
          new Date(arDate + "T00:00:00"),
          signatureDataUrl,
          finalName,
        );

        // Auto-upload if AR is pending and processed
        if (canUploadAR) {
          const pdfFile = new File(
            [pdfBlob],
            `AR-${reservedArNumber}-${request.requested_for_name}.pdf`,
            { type: "application/pdf" },
          );
          const formData = new FormData();
          formData.append("acknowledgement_receipt", pdfFile);
          formData.append("received_by_signature", signatureFile);
          formData.append("received_by_signature_method", signatureMethod || "DRAWN");
          formData.append("received_by_name", finalName);

          const response = await fetch(
            `/api/redemption-requests/${request.id}/upload_acknowledgement_receipt/`,
            { method: "POST", body: formData, credentials: "include" },
          );
          if (response.ok) {
            onUploaded();
          } else {
            const data = await response.json();
            console.error("Failed to auto-upload AR to system:", data);
            setError(data.error || "Failed to auto-upload the AR to the system.");
            // We should stop here instead of continuing since it failed.
            setIsSubmitting(false);
            return;
          }
        }

        // Download PDF locally
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `AR-${reservedArNumber}-${request.requested_for_name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        handleClose();
      } catch (err) {
        console.error("PDF generation/upload error:", err);
        setError("An error occurred creating or uploading the AR.");
      } finally {
        setIsSubmitting(false);
      }
    } else if (activeTab === "print-blank") {
      setIsSubmitting(true);
      try {
        const reservedArNumber = await getOrReserveArNumber();

        // Generate PDF without signature (blank for physical fill)
        const pdfBlob = await generateAcknowledgementReceiptPdf(
          request,
          reservedArNumber,
          new Date(arDate + "T00:00:00"),
          null,
          null,
        );

        // Download only — no server upload
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `AR-${reservedArNumber}-${request.requested_for_name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        handleClose();
      } catch (err) {
        console.error("PDF generation error:", err);
        setError("An error occurred generating the AR PDF.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // upload-image
      if (!file) { setError("Please upload the acknowledgement receipt photo"); return; }

      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("acknowledgement_receipt", file);

        const response = await fetch(
          `/api/redemption-requests/${request.id}/upload_acknowledgement_receipt/`,
          { method: "POST", body: formData, credentials: "include" },
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to upload acknowledgement receipt");
        }

        handleClose();
        onUploaded();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload acknowledgement receipt");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (signaturePreview) URL.revokeObjectURL(signaturePreview);
    setFile(null);
    setPreview(null);
    setArDate(toDateInputValue(new Date()));
    setReceiverName(request.requested_for_name || "");
    setSignatureFile(null);
    setSignatureMethod(null);
    setSignaturePreview(null);
    setError(null);
    onClose();
  };

  // --- Which submit button text / disabled? ---
  const isPrintTab = activeTab === "print-esig" || activeTab === "print-blank";
  const submitDisabled =
    isSubmitting ||
    (activeTab === "print-esig" && !signatureFile) ||
    (activeTab === "upload-image" && !file);

  const submitLabel = isSubmitting
    ? activeTab === "upload-image"
      ? "Uploading..."
      : "Generating..."
    : activeTab === "upload-image"
      ? "Upload & Confirm"
      : "Generate PDF";

  const tabs: { key: TabMode; label: string; icon: React.ReactNode; show: boolean }[] = [
    { key: "print-esig", label: "Print with e-Sig", icon: <FileText className="w-3.5 h-3.5" />, show: true },
    { key: "print-blank", label: "Print Blank", icon: <Printer className="w-3.5 h-3.5" />, show: true },
    { key: "upload-image", label: "Upload Image", icon: <Upload className="w-3.5 h-3.5" />, show: canUploadAR },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-xl w-full border border-border max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ar-modal-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border shrink-0">
          <div>
            <h3 id="ar-modal-title" className="text-base font-semibold">
              Acknowledgement Receipt
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Request #{request.id} &bull; {request.requested_for_name}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="hover:opacity-70 transition-opacity"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-4 shrink-0">
          <div className="flex rounded-lg bg-muted p-1 gap-1">
            {tabs.filter((t) => t.show).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto min-h-0">
          {/* Print fields — shown for both print tabs */}
          {isPrintTab && (
            <div className="space-y-4">
              <div>
                <label htmlFor="ar-date" className="block text-sm font-medium mb-1.5 text-foreground">
                  Date
                </label>
                <input
                  id="ar-date"
                  type="date"
                  value={arDate}
                  onChange={(e) => setArDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm bg-card border-border text-foreground"
                  disabled={isSubmitting}
                />
              </div>

              {/* Receiver name — only for print-esig (print-blank is filled physically) */}
              {activeTab === "print-esig" && (
                <div>
                  <label htmlFor="receiver-name" className="block text-sm font-medium mb-1.5 text-foreground">
                    Receiver Name
                  </label>
                  <input
                    id="receiver-name"
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Name of person receiving the items"
                    className="w-full px-3 py-2 rounded-lg border text-sm bg-card border-border text-foreground placeholder-muted-foreground"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          )}

          {/* Signature capture — print-esig only */}
          {activeTab === "print-esig" && (
            <div className="pt-2 border-t border-border">
              <h4 className="text-sm font-medium mb-3">Customer e-Signature</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Capture the customer's signature to include in the generated PDF.
              </p>
              <SignatureCapture
                onSignatureCapture={handleSignatureCapture}
                onClear={handleClearSignature}
                preview={signaturePreview || request.received_by_signature}
              />
            </div>
          )}

          {/* Print blank info */}
          {activeTab === "print-blank" && (
            <div className="rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
              The PDF will be generated without a signature or receiver name.
              These fields can be filled out physically on the printed document.
            </div>
          )}

          {/* Upload image section */}
          {activeTab === "upload-image" && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                Acknowledgement Receipt Photo
              </h4>
              <p className="text-xs text-muted-foreground">
                Upload a photo of the filled-out and signed Acknowledgement Receipt
              </p>

              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden bg-muted border-border border-2 flex-shrink-0">
                  {preview ? (
                    <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>

                {/* Drop zone */}
                <div className="flex-1">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
                      dragActive
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        : "border-border bg-muted"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center gap-3 pointer-events-none">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {file ? "Change image" : "Upload receipt photo"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WebP up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {file && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                      className="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-border shrink-0">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitDisabled}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 ${
              activeTab === "upload-image"
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPrintTab ? (
              <Printer className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
