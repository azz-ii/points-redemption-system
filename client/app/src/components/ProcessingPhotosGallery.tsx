import { Camera } from "lucide-react";

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
    const parsed = new URL(url);
    return `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    // Already a relative URL – let the browser resolve it normally
    return url;
  }
}

interface ProcessingPhotosGalleryProps {
  photos: ProcessingPhotoData[];
}

export function ProcessingPhotosGallery({ photos }: ProcessingPhotosGalleryProps) {
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
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="block border rounded-lg overflow-hidden border-border hover:ring-2 hover:ring-primary transition-all"
            >
              <img
                src={src}
                alt={photo.caption || "Processing photo"}
                className="h-24 w-24 object-cover"
              />
            </a>
            <p className="text-[10px] text-muted-foreground leading-tight max-w-[6rem] truncate">
              {photo.uploaded_by_name || "Unknown"}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight max-w-[6rem]">
              {new Date(photo.uploaded_at).toLocaleDateString()}
            </p>
            {photo.caption && (
              <p className="text-[10px] text-muted-foreground leading-tight max-w-[6rem] truncate" title={photo.caption}>
                {photo.caption}
              </p>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
