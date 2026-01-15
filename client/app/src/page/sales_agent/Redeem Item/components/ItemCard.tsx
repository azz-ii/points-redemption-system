import { useState, memo } from "react";
import { useTheme } from "next-themes";
import { Plus, Truck } from "lucide-react";
import type { ItemCardProps } from "../types";

function ItemCardComponent({ item, onAddToCart }: ItemCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div
      className={`rounded-xl overflow-hidden border shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-strong ${
        isDark ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"
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
        <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 text-white text-[11px] font-semibold backdrop-blur">
          {item.category}
        </div>
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-gray-900 text-[11px] font-bold shadow-soft">
          {item.points.toLocaleString()} pts
        </div>
      </div>
      {/* Info */}
      <div className="p-4 relative">
        <div className="flex justify-between items-start mb-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm md:text-base leading-tight">
              {item.name}
            </h3>
            <p
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Redeem now to lock this rate.
            </p>
            {item.needs_driver && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full ${
                  isDark
                    ? "bg-gray-900 text-blue-200"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                <Truck className="h-3 w-3" />
                Delivery arranged
              </span>
            )}
          </div>
          {/* Add button */}
          <button
            onClick={() => onAddToCart(item)}
            className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-soft ${
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

export const ItemCard = memo(ItemCardComponent);
