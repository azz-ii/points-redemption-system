import { useEffect, useState } from "react";
import { Camera, X } from "lucide-react";

export interface ProcessingPhotoData {
  id: number;
  photo: string;
  uploaded_by: number | null;
  uploaded_by_name: string | null;
  uploaded_at: string;
  caption: string | null;
}

/**
 * Normalize a media URL returned by Django so it always uses the current
 * page's origin. DRF builds absolute URLs using Django's internal host
 * (e.g. http://localhost/media/...) which is unreachable from the browser
 * when running behind a reverse proxy. We keep only the path so the browser
 * resolves it against the public-facing origin.
 */
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
    return `${window.location.origin}/api/media/${url}`;
  }
}

interface ProcessingPhotosGalleryProps {
  photos: ProcessingPhotoData[];
}

export function ProcessingPhotosGallery({
  photos,
}: ProcessingPhotosGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProcessingPhotoData | null>(null);

  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedPhoto]);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        <Camera className="inline h-4 w-4 mr-1" />
        Processing Photos ({photos.length})
      </h3>
      <div className="flex flex-wrap gap-3">
        {photos.map((photo) => {
          const src = normalizeMediaUrl(photo.photo);
          return (
            <div key={photo.id} className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="block border rounded-lg overflow-hidden border-border hover:ring-2 hover:ring-primary transition-all text-left"
              >
                <img
                  src={src}
                  alt={photo.caption || "Processing photo"}
                  className="h-24 w-24 object-cover"
                />
              </button>
              <p className="text-[10px] text-muted-foreground leading-tight max-w-[6rem] truncate">
                {photo.uploaded_by_name || "Unknown"}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight max-w-[6rem]">
                {new Date(photo.uploaded_at).toLocaleDateString()}
              </p>
              {photo.caption && (
                <p
                  className="text-[10px] text-muted-foreground leading-tight max-w-[6rem] truncate"
                  title={photo.caption}
                >
                  {photo.caption}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Processing photo preview"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-6xl max-h-[92vh] rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-border">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {selectedPhoto.caption || "Processing photo"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedPhoto.uploaded_by_name || "Unknown"} • {new Date(selectedPhoto.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="shrink-0 rounded-lg border border-border bg-background/70 p-2 hover:bg-accent transition-colors"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 bg-black flex items-center justify-center p-4 sm:p-6">
              <img
                src={normalizeMediaUrl(selectedPhoto.photo)}
                alt={selectedPhoto.caption || "Processing photo"}
                className="max-h-[78vh] max-w-full object-contain select-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
