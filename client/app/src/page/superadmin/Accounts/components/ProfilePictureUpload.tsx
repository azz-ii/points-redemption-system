import { useRef, useState } from "react";
import { Upload, X, User } from "lucide-react";

interface ProfilePictureUploadProps {
  currentImage?: string | null;
  onImageSelect: (file: File | null) => void;
  onImageRemove: () => void;
  preview?: string | null;
}

export function ProfilePictureUpload({
  currentImage,
  onImageSelect,
  onImageRemove,
  preview,
}: ProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      onImageSelect(file);
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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      onImageSelect(file);
    }
  };

  const handleRemove = () => {
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = preview || currentImage;

  return (
    <div className="space-y-2">
      <label className="text-xs text-gray-500 mb-2 block">
        Profile Picture
      </label>

      <div className="flex items-center gap-4">
        {/* Preview */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden bg-muted border-border border-2"
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-gray-400" />
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-border bg-muted"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center gap-3 pointer-events-none">
              <Upload className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {displayImage ? "Change photo" : "Upload photo"}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Remove button */}
          {displayImage && (
            <button
              type="button"
              onClick={handleRemove}
              className="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Remove photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
