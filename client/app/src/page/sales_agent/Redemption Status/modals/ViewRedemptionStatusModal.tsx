import { useState } from "react";
import { useTheme } from "next-themes";
import { X } from "lucide-react";
import type { ViewRedemptionStatusModalProps } from "./types";

export function ViewRedemptionStatusModal({
  isOpen,
  onClose,
  item,
  request,
}: ViewRedemptionStatusModalProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [imageLoading, setImageLoading] = useState(true);

  if (!isOpen || !item || !request) return null;

  const imageUrl = item.image_url || "/images/tshirt.png";

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
                src={imageUrl}
                alt={`${item.catalogue_item_name}: ${item.variant_option || ""}`}
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
                {item.variant_code}
              </p>
              <h3 className="mt-1 text-2xl font-bold">{item.catalogue_item_name}</h3>
              {item.variant_option && (
                <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {item.variant_option}
                </p>
              )}
              <div
                className={`mt-3 space-y-3 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">Quantity</p>
                  <p className="text-sm">{item.quantity} unit{item.quantity !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Points per Item</p>
                  <p className="text-sm">{item.points_per_item} points</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Status</p>
                  <p className="text-sm">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        request.status === "APPROVED"
                          ? "bg-green-500 text-white"
                          : request.status === "PENDING"
                          ? "bg-yellow-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {request.status_display}
                    </span>
                  </p>
                </div>
                {request.rejection_reason && (
                  <div>
                    <p className="text-sm font-semibold">Rejection Reason</p>
                    <p className="text-sm">{request.rejection_reason}</p>
                  </div>
                )}
                {request.remarks && (
                  <div>
                    <p className="text-sm font-semibold">Remarks</p>
                    <p className="text-sm">{request.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Bottom points/price bar */}
        <div
          className={`flex items-center justify-between rounded-b-xl px-4 md:px-6 py-3 ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            Total for this item
          </p>
          <p
            className={`text-sm font-bold ${
              isDark ? "text-yellow-300" : "text-yellow-600"
            }`}
          >
            {item.total_points} Points
          </p>
        </div>
      </div>
    </div>
  );
}
