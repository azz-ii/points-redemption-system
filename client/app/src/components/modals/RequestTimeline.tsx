import { User, Calendar, CheckCircle, XCircle, Package, Ban, Upload } from "lucide-react";

export interface RequestTimelineData {
  // Request info
  requested_by_name?: string | null;
  date_requested?: string | null;
  // Legacy review fields (used when dual approval not enabled)
  reviewed_by_name?: string | null;
  date_reviewed?: string | null;
  // Dual approval - Marketing
  requires_marketing_approval?: boolean;
  marketing_approval_status?: string | null;
  marketing_approved_by_name?: string | null;
  marketing_approval_date?: string | null;
  marketing_rejection_reason?: string | null;
  // Withdrawal fields
  withdrawal_reason?: string | null;
  // Processing fields
  processed_by_name?: string | null;
  date_processed?: string | null;
  // Cancellation fields
  cancelled_by_name?: string | null;
  date_cancelled?: string | null;
  // General fields
  remarks?: string | null;
  rejection_reason?: string | null;
  status?: string;
  processing_status?: string;
  // Acknowledgement Receipt fields
  ar_status?: string | null;
  ar_uploaded_by_name?: string | null;
  ar_uploaded_at?: string | null;
  requested_for_type?: string | null;
}

interface RequestTimelineProps {
  data: RequestTimelineData;
  showProcessing?: boolean;
  showCancellation?: boolean;
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

function TimelineItem({
  icon: Icon,
  iconColor,
  title,
  person,
  date,
  remarks,
  extraInfo,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  person: string | null | undefined;
  date: string | null | undefined;
  remarks?: string | null;
  extraInfo?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-foreground`}>
          {title}
        </p>
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {person || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {formatDate(date)}
            </span>
          </div>
          {remarks && (
            <p className="text-xs mt-1 text-muted-foreground">
              {remarks}
            </p>
          )}
          {extraInfo}
        </div>
      </div>
    </div>
  );
}

export function RequestTimeline({
  data,
  showProcessing = true,
  showCancellation = true,
}: RequestTimelineProps) {
  // Determine if dual approval is enabled
  const hasDualApproval = data.requires_marketing_approval;

  // Get approval status styling
  const getApprovalStatusColor = (status: string | null | undefined) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300 dark:bg-green-900/50 dark:text-green-400";
      case "REJECTED":
        return "bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-900/40 dark:border-rose-800/50 dark:text-rose-300 dark:bg-red-900/50 dark:text-red-400";
      case "PENDING":
        return "bg-yellow-100 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:border-yellow-800/50 dark:text-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className={`text-sm font-semibold uppercase tracking-wide text-foreground`}>
        Request Timeline
      </h3>

      <div className="space-y-6">
        {/* Requested */}
        <TimelineItem
          icon={User}
          iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
          title="Requested"
          person={data.requested_by_name}
          date={data.date_requested}
          remarks={data.remarks ? `Remarks: ${data.remarks}` : undefined}
        />

        {/* Withdrawn (if withdrawal reason exists) */}
        {data.withdrawal_reason && (
          <TimelineItem
            icon={XCircle}
            iconColor="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
            title="Withdrawn"
            person={data.requested_by_name}
            date={data.date_requested}
            remarks={`Reason: ${data.withdrawal_reason}`}
          />
        )}

        {/* Approval Section */}
        {hasDualApproval ? (
          <>
            {/* Marketing Approval */}
            {data.requires_marketing_approval && (
              <TimelineItem
                icon={data.marketing_approval_status?.toUpperCase() === "REJECTED" ? XCircle : CheckCircle}
                iconColor={
                  data.marketing_approval_status?.toUpperCase() === "APPROVED"
                    ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                    : data.marketing_approval_status?.toUpperCase() === "REJECTED"
                    ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
                    : "bg-muted text-muted-foreground"
                }
                title="Marketing Approval"
                person={data.marketing_approved_by_name}
                date={data.marketing_approval_date}
                remarks={
                  data.marketing_approval_status?.toUpperCase() === "REJECTED"
                    ? data.marketing_rejection_reason ? `Reason: ${data.marketing_rejection_reason}` : undefined
                    : data.marketing_approval_status?.toUpperCase() === "APPROVED"
                    ? data.remarks ? `Remarks: ${data.remarks}` : undefined
                    : undefined
                }
                extraInfo={
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${getApprovalStatusColor(data.marketing_approval_status)}`}>
                      {data.marketing_approval_status?.toUpperCase() || "PENDING"}
                    </span>
                  </div>
                }
              />
            )}
          </>
        ) : (
          /* Legacy single approval flow */
          <TimelineItem
            icon={data.status?.toUpperCase() === "REJECTED" ? XCircle : CheckCircle}
            iconColor={
              data.status?.toUpperCase() === "APPROVED"
                ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                : data.status?.toUpperCase() === "REJECTED"
                ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
                : "bg-muted text-muted-foreground"
            }
            title="Reviewed"
            person={data.reviewed_by_name}
            date={data.date_reviewed}
            remarks={
              data.status?.toUpperCase() === "REJECTED"
                ? data.rejection_reason ? `Reason: ${data.rejection_reason}` : undefined
                : data.remarks ? `Remarks: ${data.remarks}` : undefined
            }
          />
        )}

        {/* Processed */}
        {showProcessing && (data.processed_by_name || data.date_processed || data.processing_status?.toUpperCase() === "PROCESSED") && (
          <TimelineItem
            icon={Package}
            iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
            title="Processed"
            person={data.processed_by_name}
            date={data.date_processed}
            remarks={data.remarks ? `Remarks: ${data.remarks}` : undefined}
          />
        )}

        {/* Cancelled */}
        {showCancellation && (data.cancelled_by_name || data.date_cancelled || data.processing_status?.toUpperCase() === "CANCELLED") && (
          <TimelineItem
            icon={Ban}
            iconColor="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
            title="Cancelled"
            person={data.cancelled_by_name}
            date={data.date_cancelled}
            remarks={data.rejection_reason ? `Reason: ${data.rejection_reason}` : undefined}
          />
        )}

        {/* Acknowledgement Receipt */}
        {data.processing_status === "PROCESSED" && data.requested_for_type === "CUSTOMER" && data.ar_status && data.ar_status !== "NOT_REQUIRED" && (
          <TimelineItem
            icon={data.ar_status === "UPLOADED" ? Upload : Package}
            iconColor={
              data.ar_status === "UPLOADED"
                ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                : "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
            }
            title={
              data.ar_status === "UPLOADED"
                ? "Acknowledgement Receipt Uploaded"
                : "Awaiting Acknowledgement Receipt"
            }
            person={data.ar_status === "UPLOADED" ? data.ar_uploaded_by_name : null}
            date={data.ar_status === "UPLOADED" ? data.ar_uploaded_at : null}
            extraInfo={
              data.ar_status === "PENDING" ? (
                <p className="text-xs mt-1 text-amber-600 dark:text-amber-400">
                  Sales agent needs to upload the acknowledgement receipt
                </p>
              ) : null
            }
          />
        )}
      </div>
    </div>
  );
}
