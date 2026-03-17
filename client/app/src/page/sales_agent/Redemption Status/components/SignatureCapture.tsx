import { useRef, useState, useEffect } from "react";
import { X, Trash2, Pen, Camera } from "lucide-react";
import SignaturePad from "signature_pad";

interface SignatureCaptureProps {
  onSignatureCapture: (file: File, method: "DRAWN" | "PHOTO") => void;
  onClear: () => void;
  preview?: string | null;
}

export function SignatureCapture({ onSignatureCapture, onClear, preview }: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  const [mode, setMode] = useState<"DRAWN" | "PHOTO">("DRAWN");
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize signature pad
  useEffect(() => {
    if (mode === "DRAWN" && canvasRef.current && !signaturePadRef.current) {
      const canvas = canvasRef.current;
      // Set canvas size to match container
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = 120;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = 120 * dpr;
        const context = canvas.getContext("2d");
        if (context) {
          context.scale(dpr, dpr);
        }
      }

      signaturePadRef.current = new SignaturePad(canvas, {
        minWidth: 0.5,
        maxWidth: 2.5,
        throttle: 16,
      });

      signaturePadRef.current.addEventListener("beginStroke", () => setIsDrawing(true));
      signaturePadRef.current.addEventListener("endStroke", () => {
        setIsDrawing(false);
        setHasSignature(!signaturePadRef.current!.isEmpty());
      });
    }
  }, [mode]);

  const handleClearSignature = () => {
    if (mode === "DRAWN" && signaturePadRef.current) {
      signaturePadRef.current.clear();
      setHasSignature(false);
    }
    setError(null);
  };

  const handleSaveSignature = async () => {
    if (mode === "DRAWN" && signaturePadRef.current) {
      if (signaturePadRef.current.isEmpty()) {
        setError("Please draw your signature");
        return;
      }

      const dataUrl = signaturePadRef.current.toDataURL("image/png");
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const file = new File([blob], `signature-drawn-${Date.now()}.png`, {
        type: "image/png",
      });
      onSignatureCapture(file, "DRAWN");
      setError(null);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    onSignatureCapture(file, "PHOTO");
    setError(null);
  };

  const handleModeChange = (newMode: "DRAWN" | "PHOTO") => {
    setMode(newMode);
    setHasSignature(false);
    handleClearSignature();
    setError(null);
  };

  return (
    <div className="space-y-3">
      {/* Mode tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => handleModeChange("DRAWN")}
          className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2 ${
            mode === "DRAWN"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-accent text-foreground border border-border"
          }`}
        >
          <Pen className="h-4 w-4" />
          Draw
        </button>
        <button
          onClick={() => handleModeChange("PHOTO")}
          className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2 ${
            mode === "PHOTO"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-accent text-foreground border border-border"
          }`}
        >
          <Camera className="h-4 w-4" />
          Photo
        </button>
      </div>

      {/* Draw mode */}
      {mode === "DRAWN" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Sign in the box below
          </label>
          <div className="border-2 border-dashed border-border rounded-lg bg-muted/50 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair"
              onMouseDown={() => {
                if (!isDrawing) setHasSignature(false);
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearSignature}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-muted hover:bg-accent text-foreground border border-border flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
            <button
              onClick={handleSaveSignature}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Use Signature
            </button>
          </div>
        </div>
      )}

      {/* Photo mode */}
      {mode === "PHOTO" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Take or upload a photo of the signature
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-border bg-muted/50 hover:bg-muted text-foreground transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Camera className="h-5 w-5" />
            Choose Image or Take Photo
          </button>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Signature Preview
          </label>
          <div className="border rounded-lg overflow-hidden bg-muted/30 p-2 inline-block">
            <img
              src={preview}
              alt="Signature preview"
              className="max-w-xs max-h-24 object-contain"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
