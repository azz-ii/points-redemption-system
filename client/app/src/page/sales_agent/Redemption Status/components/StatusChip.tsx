import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusChipProps {
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" | "Pending" | "Approved" | "Rejected" | "Withdrawn";
  processingStatus?: "NOT_PROCESSED" | "PROCESSED" | "CANCELLED";
  isDark: boolean;
}

export function StatusChip({ status, processingStatus, isDark }: StatusChipProps) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold inline-block";
  const normalizedStatus = status.toUpperCase();
  
  // Show processing status if request is APPROVED
  if (normalizedStatus === "APPROVED") {
    // If APPROVED and PROCESSED, show "Processed" status
    if (processingStatus === "PROCESSED") {
      return (
        <span
          className={`${base} ${
            isDark ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-700"
          }`}
        >
          Processed
        </span>
      );
    }
    
    // If APPROVED and CANCELLED, show "Cancelled" status with tooltip
    if (processingStatus === "CANCELLED") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={`${base} cursor-help ${
                isDark ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
              }`}
            >
              Cancelled
            </span>
          </TooltipTrigger>
          <TooltipContent>An Admin Has Cancelled this Request</TooltipContent>
        </Tooltip>
      );
    }
    
    // If APPROVED but not processed/cancelled, show "Approved" status
    return (
      <span
        className={`${base} ${
          isDark ? "bg-green-500 text-black" : "bg-green-100 text-green-700"
        }`}
      >
        Approved
      </span>
    );
  }
  
  // For non-approved requests, show approval status
  if (normalizedStatus === "PENDING") {
    return (
      <span
        className={`${base} ${
          isDark ? "bg-yellow-400 text-black" : "bg-yellow-100 text-yellow-700"
        }`}
      >
        Pending
      </span>
    );
  }
  
  // Handle WITHDRAWN status
  if (normalizedStatus === "WITHDRAWN") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`${base} cursor-help ${
              isDark ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
            }`}
          >
            Withdrawn
          </span>
        </TooltipTrigger>
        <TooltipContent>You withdrew this request</TooltipContent>
      </Tooltip>
    );
  }
  
  return (
    <span
      className={`${base} ${
        isDark ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
      }`}
    >
      Rejected
    </span>
  );
}
