import { useState } from "react";
import { useTheme } from "next-themes";
import { X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
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
  const normalizedStatus = request.status.toUpperCase();

  // Determine status display based on approval and processing status
  const getStatusDisplay = () => {
    if (normalizedStatus === "APPROVED") {
      if (request.processing_status === "PROCESSED") {
        return {
          label: "Processed",
          colorClass: isDark ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-700",
          withTooltip: false,
        };
      }
      if (request.processing_status === "CANCELLED") {
        return {
          label: "Cancelled",
          colorClass: isDark ? "bg-red-500 text-white" : "bg-red-100 text-red-700",
          withTooltip: true,
          tooltipText: "An Admin Has Cancelled this Request",
        };
      }
      return {
        label: "Approved",
        colorClass: isDark ? "bg-green-500 text-black" : "bg-green-100 text-green-700",
        withTooltip: false,
      };
    }

    if (normalizedStatus === "PENDING") {
      return {
        label: "Pending",
        colorClass: isDark ? "bg-yellow-400 text-black" : "bg-yellow-100 text-yellow-700",
        withTooltip: false,
      };
    }

    return {
      label: "Rejected",
      colorClass: isDark ? "bg-red-500 text-white" : "bg-red-100 text-red-700",
      withTooltip: false,
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <TooltipProvider>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
        <div
          className={`${
            isDark ? "bg-gray-900" : "bg-white"
          } rounded-lg shadow-2xl max-w-2xl w-full border divide-y ${
            isDark
              ? "border-gray-700 divide-gray-700"
              : "border-gray-200 divide-gray-200"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-redemption-status-title"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-8">
            <div>
              <h2 id="view-redemption-status-title" className="text-xl font-semibold">
                Redemption Item Details
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                View item information and status
              </p>
            </div>
            <button
              onClick={onClose}
              className="hover:opacity-70 transition-opacity"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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
              <div className="md:w-1/2 mt-4 md:mt-0 space-y-4">
                {/* Item Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Item Information
                  </h3>
                  <p
                    className={`text-sm font-semibold ${
                      isDark ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    {item.variant_code}
                  </p>
                  <h4 className="text-xl font-bold">{item.catalogue_item_name}</h4>
                  {item.variant_option && (
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {item.variant_option}
                    </p>
                  )}
                </div>

                {/* Order Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Order Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                      <p className="text-sm font-medium">{item.quantity} unit{item.quantity !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Points per Item</label>
                      <p className="text-sm font-medium">{item.points_per_item} points</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Status
                  </h3>
                  {statusDisplay.withTooltip ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-help ${statusDisplay.colorClass}`}
                        >
                          {statusDisplay.label}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{statusDisplay.tooltipText}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusDisplay.colorClass}`}
                    >
                      {statusDisplay.label}
                    </span>
                  )}
                </div>

                {/* Additional Info */}
                {(request.rejection_reason || request.remarks) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Additional Information
                    </h3>
                    {request.rejection_reason && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Rejection Reason</label>
                        <p className="text-sm">{request.rejection_reason}</p>
                      </div>
                    )}
                    {request.remarks && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Remarks</label>
                        <p className="text-sm">{request.remarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Total Points Bar */}
            <div
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${
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

          {/* Footer */}
          <div className="p-8 flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
