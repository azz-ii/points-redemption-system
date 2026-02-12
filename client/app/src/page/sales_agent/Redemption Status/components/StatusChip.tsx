import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusChipProps {
  status: string;
  processingStatus?: string;
}

export function StatusChip({ status, processingStatus }: StatusChipProps) {
  const base = "px-3 py-1 rounded-full text-xs font-semibold inline-block";
  const normalizedStatus = status.toUpperCase();
  
  // Show processing status if request is APPROVED
  if (normalizedStatus === "APPROVED") {
    // If APPROVED and PROCESSED, show "Processed" status
    if (processingStatus === "PROCESSED") {
      return (
        <span
          className={`${base} bg-blue-100 text-blue-700 dark:bg-blue-500 dark:text-white`}
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
              className={`${base} cursor-help bg-red-100 text-red-700 dark:bg-red-500 dark:text-white`}
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
        className={`${base} bg-green-100 text-green-700 dark:bg-green-500 dark:text-black`}
      >
        Approved
      </span>
    );
  }
  
  // For non-approved requests, show approval status
  if (normalizedStatus === "PENDING") {
    return (
      <span
        className={`${base} bg-yellow-100 text-yellow-700 dark:bg-yellow-400 dark:text-black`}
      >
        Pending
      </span>
    );
  }
  
  return (
    <span
      className={`${base} bg-red-100 text-red-700 dark:bg-red-500 dark:text-white`}
    >
      Rejected
    </span>
  );
}
