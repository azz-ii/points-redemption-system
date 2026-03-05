import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/ui/status-badge";

interface StatusChipProps {
  status: string;
  processingStatus?: string;
  arStatus?: string | null;
}

export function StatusChip({ status, processingStatus, arStatus }: StatusChipProps) {
  const normalizedStatus = status.toUpperCase();
  
  // Show processing status if request is APPROVED
  if (normalizedStatus === "APPROVED") {
    if (processingStatus === "PROCESSED") {
      // Check AR status for customer requests
      if (arStatus === "PENDING") {
        return <StatusBadge status="AWAITING_AR" label="Awaiting AR" size="md" />;
      }
      if (arStatus === "UPLOADED") {
        return <StatusBadge status="PROCESSED" label="Completed" size="md" />;
      }
      return <StatusBadge status="PROCESSED" label="Processed" size="md" />;
    }
    
    if (processingStatus === "CANCELLED") {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <StatusBadge status="CANCELLED" label="Cancelled" size="md" className="cursor-help" />
            </span>
          </TooltipTrigger>
          <TooltipContent>An Admin Has Cancelled this Request</TooltipContent>
        </Tooltip>
      );
    }
    
    return <StatusBadge status="APPROVED" label="Approved" size="md" />;
  }
  
  if (normalizedStatus === "PENDING") {
    return <StatusBadge status="PENDING" label="Pending" size="md" />;
  }
  
  return <StatusBadge status="REJECTED" label="Rejected" size="md" />;
}
