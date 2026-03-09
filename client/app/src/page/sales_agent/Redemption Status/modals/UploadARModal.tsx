import { useState, useRef } from "react";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { redemptionRequestsApi } from "@/lib/api";

interface UploadARModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number;
  customerName: string;
  onUploaded: () => void;
}

export function UploadARModal({
  isOpen,
  onClose,
  requestId,
  customerName,
  onUploaded,
}: UploadARModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an image to upload");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await redemptionRequestsApi.uploadAcknowledgementReceipt(requestId, file);
      handleClose();
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload acknowledgement receipt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border border-border max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-ar-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h3 id="upload-ar-title" className="text-lg font-semibold">
              Upload Acknowledgement Receipt
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Request #{requestId} &bull; {customerName}
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a photo of the signed Acknowledgement Receipt confirming the customer received the requested item(s).
          </p>

          {/* Upload area */}
          <div className="flex items-center gap-4">
            {/* Preview */}
            <div className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden bg-muted border-border border-2 flex-shrink-0">
              {preview ? (
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="w-full h-full object-cover"
                />
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
                  onClick={handleRemove}
                  disabled={isSubmitting}
                  className="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Remove image
                </button>
              )}
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-border">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg font-semibold transition-colors bg-muted hover:bg-accent text-foreground border border-border disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !file}
            className="px-6 py-2.5 rounded-lg font-semibold transition-colors inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Receipt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
