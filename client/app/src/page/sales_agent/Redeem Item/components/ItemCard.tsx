import { useState } from "react";
import { useTheme } from "next-themes";
import { Plus, Info } from "lucide-react";
import { DYNAMIC_QUANTITY_LABELS, PRICING_TYPE_DESCRIPTIONS } from "@/lib/api";
import type { ItemCardProps } from "../types";

export function ItemCard({ item, onAddToCart }: ItemCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [imageLoading, setImageLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine if this is a dynamic pricing item
  const isDynamicPricing = item.pricing_type && item.pricing_type !== 'FIXED';
  const multiplier = item.points_multiplier || item.points;

  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        isDark
          ? "bg-gray-900 border-gray-800"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Image */}
      <div className="bg-gray-300 h-40 md:h-48 overflow-hidden relative">
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse" />
        )}
        <img
          src={item.image}
          alt={item.name}
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
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
            <div className={`px-2 py-0.5 rounded text-xs font-medium ${
              isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
            }`}>
              {DYNAMIC_QUANTITY_LABELS[item.pricing_type]}
            </div>
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                aria-label="Pricing info"
              >
                <Info className="h-3 w-3" />
              </button>
              {showTooltip && (
                <div className={`absolute top-6 left-0 z-10 w-64 p-2 rounded shadow-lg text-xs ${
                  isDark ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  {PRICING_TYPE_DESCRIPTIONS[item.pricing_type]}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-4 relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-sm md:text-base">
              {item.name}
            </h3>
            {isDynamicPricing ? (
              <p className={`text-xs md:text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {multiplier.toLocaleString()} pts / {DYNAMIC_QUANTITY_LABELS[item.pricing_type].toLowerCase()}
              </p>
            ) : (
              <p
                className={`text-xs md:text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {item.points.toLocaleString()} pts
              </p>
            )}
            <p
              className={`text-xs mt-1 ${
                !item.has_stock
                  ? isDark ? 'text-blue-400' : 'text-blue-500'
                  : item.available_stock === 0 
                    ? 'text-red-500 font-medium'
                    : item.available_stock < 10
                      ? 'text-amber-500'
                      : isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {!item.has_stock 
                ? 'Made to Order' 
                : item.available_stock === 0 
                  ? 'Out of stock' 
                  : `${item.available_stock} available`} • {item.category}
            </p>
            {/* Order quantity limits hint */}
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Qty: {item.min_order_qty ?? 1}{item.max_order_qty ? ` - ${item.max_order_qty}` : '+'}
            </p>
          </div>
          {/* Add button */}
          <button
            onClick={() => onAddToCart(item)}
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isDark
                ? "bg-yellow-400 text-black hover:bg-yellow-300"
                : "bg-yellow-400 text-black hover:bg-yellow-300"
            }`}
            aria-label={`Add ${item.name}`}
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
