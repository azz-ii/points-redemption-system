import { useState } from "react";
import { X, Plus, Info, CheckCircle2, Box } from "lucide-react";
import type { RedeemItemData } from "@/lib/api";

interface ViewItemModalProps {
  item: RedeemItemData;
  onClose: () => void;
  onAddToCart: (item: RedeemItemData) => void;
}

const FORMULA_LABELS: Record<string, string> = {
  DRIVER_MULTIPLIER: 'Driver Multiplier',
  AREA_RATE: 'Area Rate',
  PER_SQFT: 'Per Sqft',
  PER_INVOICE: 'Per Invoice',
  PER_DAY: 'Per Day'
};

export function ViewItemModal({ item, onClose, onAddToCart }: ViewItemModalProps) {
  const [imageLoading, setImageLoading] = useState(true);

  const isDynamicPricing = item.pricing_formula && item.pricing_formula !== 'NONE';
  const multiplier = item.points_multiplier || item.points;

  // Render text blocks safely converting newlines to breaks
  const PreformattedText = ({ text }: { text?: string }) => {
    if (!text || text.trim() === '') return <span className="text-muted-foreground italic">Not specified</span>;
    return (
      <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
        {text}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 backdrop-blur-sm bg-background/90"
      onClick={onClose}
    >
      <div 
        className="bg-card w-full max-w-4xl rounded-2xl border border-border shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Image (Sticky on mobile if scrolling) */}
        <div className="w-full md:w-5/12 lg:w-1/2 bg-muted relative flex-shrink-0 flex items-center justify-center min-h-[250px] md:min-h-full p-4">
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background text-foreground z-10 shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>

          {imageLoading && (
            <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse" />
          )}
          <img
            src={item.image || "/images/tshirt.png"}
            alt={item.name}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              e.currentTarget.src = "/images/tshirt.png";
              setImageLoading(false);
            }}
            className={`max-w-full max-h-full object-contain drop-shadow-xl transition-opacity duration-300 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
          />
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-7/12 lg:w-1/2 flex flex-col h-full bg-card">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border z-10 bg-card">
            <div>
              <div className="flex gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {item.category}
                </span>
                {item.legend && item.legend !== item.category && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                    {item.legend}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold leading-tight text-foreground">
                {item.name}
              </h2>
              <div className="mt-1 flex items-center text-xs text-muted-foreground font-mono">
                {item.item_code || "NO-CODE"}
              </div>
            </div>
            
            {/* Desktop close button */}
            <button
              onClick={onClose}
              className="hidden md:flex p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* Pricing Section */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flexitems-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary mb-1">Redemption Cost</p>
                <div className="text-3xl font-black text-primary">
                  {isDynamicPricing ? (
                    <span>{multiplier.toLocaleString()} <span className="text-lg text-primary/70 font-semibold">pts / {item.pricing_formula ? FORMULA_LABELS[item.pricing_formula] : 'unit'}</span></span>
                  ) : (
                    <span>{item.points.toLocaleString()} <span className="text-lg text-primary/70 font-semibold">pts</span></span>
                  )}
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="flex gap-4">
              {item.has_stock ? (
                <div className="flex items-center gap-2 text-sm">
                  <Box className="h-5 w-5 text-muted-foreground" />
                  <span>
                    Stock: <strong className={item.available_stock > 0 ? "text-green-500" : "text-destructive"}>
                      {item.available_stock} available
                    </strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Box className="h-5 w-5 text-muted-foreground" />
                  <span className="text-blue-500 font-medium">Made to Order</span>
                </div>
              )}
              
              {item.request_count > 0 && (
                <div className="flex items-center gap-2 text-sm border-l border-border pl-4 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Redeemed {item.request_count} times</span>
                </div>
              )}
            </div>

            <hr className="border-border" />

            {/* Description Blocks */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" /> Description
                </h3>
                <PreformattedText text={item.description} />
              </div>

              {item.purpose && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Internal Purpose</h3>
                  <PreformattedText text={item.purpose} />
                </div>
              )}

              {item.specifications && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Specifications</h3>
                  <div className="p-3 bg-muted/50 rounded-lg text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                    {item.specifications}
                  </div>
                </div>
              )}
            </div>
            
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-border bg-card">
            <button
              onClick={() => onAddToCart(item)}
              disabled={item.has_stock && item.available_stock <= 0}
              className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-lg bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="h-5 w-5" />
              Add to Cart
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}