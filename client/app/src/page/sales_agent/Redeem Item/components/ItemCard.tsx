import { useState } from "react";
import { Plus, Info } from "lucide-react";
import { DYNAMIC_QUANTITY_LABELS, PRICING_TYPE_DESCRIPTIONS } from "@/lib/api";
import type { ItemCardProps } from "../types";

export function ItemCard({ item, layout = "grid", onAddToCart }: ItemCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine if this is a dynamic pricing item
  const isDynamicPricing = item.pricing_type && item.pricing_type !== 'FIXED';
  const multiplier = item.points_multiplier || item.points;

  const isList = layout === "list";

  return (
    <div
      className={`rounded-lg overflow-hidden border bg-card border-border flex ${isList ? 'flex-row' : 'flex-col'}`}
    >
      {/* Image */}
      <div className={`${isList ? 'w-20 h-20 md:w-28 md:h-28' : 'h-36 md:h-44'} bg-gray-300 overflow-hidden relative flex-shrink-0`}>
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse" />
        )}
        <img
          src={item.image || "/images/tshirt.png"}
          alt={item.name}
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            const src = e.currentTarget.src;
            console.error(
              `[ItemCard] Image failed to load\n` +
              `  Item: ${item.name} (id=${item.id})\n` +
              `  Image field: ${item.image ?? '(empty)'}\n` +
              `  Resolved URL: ${src}`
            );
            e.currentTarget.src = "/images/tshirt.png";
            setImageLoading(false);
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoading ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
        />
        {/* Dynamic pricing badge */}
        {isDynamicPricing && (
          <div className="absolute top-2 left-2 flex items-center gap-1">
            <div className="px-2 py-0.5 rounded text-xs font-medium bg-primary text-primary-foreground">
              {DYNAMIC_QUANTITY_LABELS[item.pricing_type]}
            </div>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="w-5 h-5 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Pricing info"
              >
                <Info className="h-3 w-3" />
              </button>
              {showTooltip && (
                <div className="absolute top-6 left-0 z-10 w-64 p-2 rounded shadow-lg text-xs bg-card text-foreground border border-border">
                  {PRICING_TYPE_DESCRIPTIONS[item.pricing_type]}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Info */}
      <div className={`${isList ? 'p-2 md:p-3' : 'p-3 md:p-4'} flex-1 flex flex-col justify-center ${isList ? 'h-full' : ''}`}>
        <div className={`flex justify-between flex-1 ${isList ? 'items-center' : 'items-end'}`}>
          <div className={`flex flex-col ${isList ? 'gap-0 md:gap-1' : 'gap-1'}`}>
            <h3 className={`font-semibold leading-tight ${isList ? 'text-sm md:text-base' : 'text-xs md:text-sm'}`}>
              {item.name}
            </h3>
            {isDynamicPricing ? (
              <p className={`text-primary ${isList ? 'text-xs md:text-sm' : 'text-xs'}`}>
                {multiplier.toLocaleString()} pts / {DYNAMIC_QUANTITY_LABELS[item.pricing_type].toLowerCase()}
              </p>
            ) : (
              <p
                className={`text-muted-foreground ${isList ? 'text-xs md:text-sm' : 'text-xs'}`}
              >
                {item.points.toLocaleString()} pts
              </p>
            )}
            <p
              className={`text-xs ${isList ? 'md:text-sm' : ''} ${
                !item.has_stock
                  ? 'text-blue-500 dark:text-blue-400'
                  : item.available_stock === 0 
                    ? 'text-red-500 font-medium'
                    : item.available_stock < 10
                      ? 'text-amber-500'
                      : 'text-muted-foreground'
              }`}
            >
              {!item.has_stock 
                ? 'Made to Order' 
                : item.available_stock === 0 
                  ? 'Out of stock' 
                  : `${item.available_stock} available`} • {item.category}
            </p>
            {/* Order quantity limits hint */}
            <p className={`text-muted-foreground text-xs ${isList ? 'md:text-sm' : ''}`}>
              Qty: {item.min_order_qty ?? 1}{item.max_order_qty ? ` - ${item.max_order_qty}` : '+'}
            </p>
          </div>
          {/* Add button */}
          <button
            onClick={() => onAddToCart(item)}
            className={`${isList ? 'w-7 h-7 md:w-8 md:h-8 ml-4' : 'w-7 h-7 md:w-8 md:h-8'} rounded-full flex items-center justify-center flex-shrink-0 bg-yellow-400 text-black hover:bg-yellow-300 transition-colors`}
            aria-label={`Add ${item.name}`}
          >
            <Plus className={`${isList ? 'h-4 w-4' : 'h-3 w-3 md:h-4 md:w-4'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
