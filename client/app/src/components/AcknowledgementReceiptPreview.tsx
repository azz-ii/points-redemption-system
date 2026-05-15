import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

function normalizeMediaUrl(url: string): string {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.pathname.startsWith("/media/")) {
      return `${window.location.origin}/api/media${parsed.pathname.replace(/^\/media/, "")}${parsed.search}${parsed.hash}`;
    }
    if (parsed.pathname.startsWith("/api/media/")) {
      return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    if (url.startsWith("/media/")) {
      return `${window.location.origin}/api/media${url.replace(/^\/media/, "")}`;
    }
    if (url.startsWith("/api/media/")) {
      return `${window.location.origin}${url}`;
    }
    if (url.startsWith("/")) {
      return `${window.location.origin}${url}`;
    }
    return url;
  }
}

function isPdfUrl(url: string): boolean {
  const trimmed = url.split("?")[0].split("#")[0].toLowerCase();
  return trimmed.endsWith(".pdf");
}

export interface AcknowledgementReceiptPreviewProps {
  receiptUrl: string;
  alt?: string;
}

export function AcknowledgementReceiptPreview({
  receiptUrl,
  alt = "Acknowledgement Receipt",
}: AcknowledgementReceiptPreviewProps) {
  const [pdfObjectUrl, setPdfObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPdfUrl(receiptUrl)) {
      setPdfObjectUrl(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isActive = true;
    let createdObjectUrl: string | null = null;

    setIsLoading(true);
    setError(null);
    setPdfObjectUrl(null);

    fetch(normalizeMediaUrl(receiptUrl), {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load PDF preview");
        }

        return response.blob();
      })
      .then((blob) => {
        if (!isActive) return;

        createdObjectUrl = URL.createObjectURL(blob);
        setPdfObjectUrl(createdObjectUrl);
      })
      .catch((previewError) => {
        if (!isActive) return;

        setError(
          previewError instanceof Error
            ? previewError.message
            : "Failed to load PDF preview",
        );
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;

      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [receiptUrl]);

  if (isPdfUrl(receiptUrl)) {
    return (
      <div className="border rounded-lg overflow-hidden border-border bg-background">
        <div className="relative h-64 w-full bg-muted/30">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-muted-foreground">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading preview...
              </div>
            </div>
          )}
          {error ? (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
              {error}
            </div>
          ) : pdfObjectUrl ? (
            <iframe
              src={pdfObjectUrl}
              title={alt}
              className="h-full w-full border-0"
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden border-border inline-block bg-background">
      <img
        src={normalizeMediaUrl(receiptUrl)}
        alt={alt}
        className="max-w-full max-h-64 object-contain"
      />
    </div>
  );
}