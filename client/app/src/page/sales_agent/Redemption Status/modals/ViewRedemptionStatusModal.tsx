import { useState } from "react";
import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { ViewRedemptionStatusModalProps } from "./types";

export function ViewRedemptionStatusModal({
  isOpen,
  onClose,
  item,
}: ViewRedemptionStatusModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [imageLoading, setImageLoading] = useState(true);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      {/* Card */}
      <div
        className={`relative mx-4 w-full max-w-md md:max-w-3xl rounded-xl shadow-2xl ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Top bar with close */}
        <div className="flex items-center justify-end p-3">
          <button
            onClick={onClose}
            className={`p-2 rounded-md ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Content area: stacked on mobile, side-by-side on desktop */}
        <div className="px-4 md:px-6">
          <div className="md:flex md:gap-6">
            {/* Image */}
            <div className="overflow-hidden rounded-lg md:w-1/2 relative">
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 animate-pulse" />
              )}
              <img
                src={item.image}
                alt={`${item.type}: ${item.details}`}
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  e.currentTarget.src = "/images/tshirt.png";
                  setImageLoading(false);
                }}
                className={`w-full h-auto object-cover transition-opacity duration-300 ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                loading="lazy"
              />
            </div>
            {/* Details */}
            <div className="pb-4 md:pb-6 md:w-1/2">
              <p
                className={`mt-3 text-sm font-semibold ${
                  isDark ? "text-green-400" : "text-green-600"
                }`}
              >
                {item.id}
              </p>
              <h3 className="mt-1 text-2xl font-bold">{item.details}</h3>
              <div
                className={`mt-3 space-y-3 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">Description</p>
                  <p className="text-sm">
                    Premium cotton polo for events and daily wear.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Purpose</p>
                  <p className="text-sm">
                    Company events or stylish uniform piece.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Specifications</p>
                  <ul className="list-disc pl-5 text-sm">
                    <li>Material: 100% Platinum Cotton</li>
                    <li>Fit: Modern</li>
                    <li>Collar: Ribbed Polo</li>
                    <li>Sleeves: Short with ribbed armbands</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold">Options</p>
                  <p className="text-sm">
                    Sizes S–XL; Colors Black, White, Navy Blue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom points/price bar */}
        <div
          className={`flex items-center justify-end rounded-b-xl px-4 md:px-6 py-3 ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <p
            className={`ml-auto text-sm font-bold ${
              isDark ? "text-yellow-300" : "text-yellow-600"
            }`}
          >
            500 Points
          </p>
        </div>
      </div>
    </div>
  );
}
