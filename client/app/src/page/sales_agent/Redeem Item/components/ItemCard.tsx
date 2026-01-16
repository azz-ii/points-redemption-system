import { useState } from "react";
import { useTheme } from "next-themes";
import { Plus } from "lucide-react";
import type { ItemCardProps } from "../types";

export function ItemCard({ item, onAddToCart }: ItemCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [imageLoading, setImageLoading] = useState(true);

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
      </div>
      {/* Info */}
      <div className="p-4 relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-sm md:text-base">
              {item.name}
            </h3>
            <p
              className={`text-xs md:text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {item.points.toLocaleString()} pts
            </p>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {item.category}
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
