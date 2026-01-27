import { useTheme } from "next-themes";
import { User, Calendar, CheckCircle, XCircle, Package, Ban } from "lucide-react";

export interface RequestTimelineData {
  // Request info
  requested_by_name?: string | null;
  date_requested?: string | null;
  // Legacy review fields (used when dual approval not enabled)
  reviewed_by_name?: string | null;
  date_reviewed?: string | null;
  // Dual approval - Sales
  requires_sales_approval?: boolean;
  sales_approval_status?: string | null;
  sales_approved_by_name?: string | null;
  sales_approval_date?: string | null;
  sales_rejection_reason?: string | null;
  // Dual approval - Marketing
  requires_marketing_approval?: boolean;
  marketing_approval_status?: string | null;
  marketing_approved_by_name?: string | null;
  marketing_approval_date?: string | null;
  marketing_rejection_reason?: string | null;
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
  extraInfo,
  isDark,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  person: string | null | undefined;
  date: string | null | undefined;
  extraInfo?: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-900"}`}>
          {title}
        </p>
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-3 h-3 text-gray-400" />
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>
              {person || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className={isDark ? "text-gray-400" : "text-gray-600"}>
              {formatDate(date)}
            </span>
          </div>
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Determine if dual approval is enabled
  const hasDualApproval = data.requires_sales_approval || data.requires_marketing_approval;

  // Get approval status styling
  const getApprovalStatusColor = (status: string | null | undefined) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return isDark ? "bg-green-900/50 text-green-400" : "bg-green-100 text-green-700";
      case "REJECTED":
        return isDark ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-700";
      case "PENDING":
        return isDark ? "bg-yellow-900/50 text-yellow-400" : "bg-yellow-100 text-yellow-700";
      default:
        return isDark ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        Request Timeline
      </h3>

      <div className="space-y-6">
        {/* Requested */}
        <TimelineItem
          icon={User}
          iconColor={isDark ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"}
          title="Requested"
          person={data.requested_by_name}
          date={data.date_requested}
          isDark={isDark}
        />

        {/* Approval Section */}
        {hasDualApproval ? (
          <>
            {/* Sales Approval */}
            {data.requires_sales_approval && (
              <TimelineItem
                icon={data.sales_approval_status?.toUpperCase() === "REJECTED" ? XCircle : CheckCircle}
                iconColor={
                  data.sales_approval_status?.toUpperCase() === "APPROVED"
                    ? isDark ? "bg-green-900/50 text-green-400" : "bg-green-100 text-green-600"
                    : data.sales_approval_status?.toUpperCase() === "REJECTED"
                    ? isDark ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
                    : isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"
                }
                title="Sales Approval"
                person={data.sales_approved_by_name}
                date={data.sales_approval_date}
                isDark={isDark}
                extraInfo={
                  <>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${getApprovalStatusColor(data.sales_approval_status)}`}>
                        {data.sales_approval_status?.toUpperCase() || "PENDING"}
                      </span>
                    </div>
                    {data.sales_rejection_reason && (
                      <p className={`text-xs mt-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
                        Reason: {data.sales_rejection_reason}
                      </p>
                    )}
                  </>
                }
              />
            )}

            {/* Marketing Approval */}
            {data.requires_marketing_approval && (
              <TimelineItem
                icon={data.marketing_approval_status?.toUpperCase() === "REJECTED" ? XCircle : CheckCircle}
                iconColor={
                  data.marketing_approval_status?.toUpperCase() === "APPROVED"
                    ? isDark ? "bg-green-900/50 text-green-400" : "bg-green-100 text-green-600"
                    : data.marketing_approval_status?.toUpperCase() === "REJECTED"
                    ? isDark ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
                    : isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"
                }
                title="Marketing Approval"
                person={data.marketing_approved_by_name}
                date={data.marketing_approval_date}
                isDark={isDark}
                extraInfo={
                  <>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${getApprovalStatusColor(data.marketing_approval_status)}`}>
                        {data.marketing_approval_status?.toUpperCase() || "PENDING"}
                      </span>
                    </div>
                    {data.marketing_rejection_reason && (
                      <p className={`text-xs mt-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
                        Reason: {data.marketing_rejection_reason}
                      </p>
                    )}
                  </>
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
                ? isDark ? "bg-green-900/50 text-green-400" : "bg-green-100 text-green-600"
                : data.status?.toUpperCase() === "REJECTED"
                ? isDark ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
                : isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"
            }
            title="Reviewed"
            person={data.reviewed_by_name}
            date={data.date_reviewed}
            isDark={isDark}
            extraInfo={
              data.rejection_reason ? (
                <p className={`text-xs mt-1 ${isDark ? "text-red-400" : "text-red-600"}`}>
                  Reason: {data.rejection_reason}
                </p>
              ) : data.remarks ? (
                <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Remarks: {data.remarks}
                </p>
              ) : null
            }
          />
        )}

        {/* Processed */}
        {showProcessing && (data.processed_by_name || data.date_processed || data.processing_status?.toUpperCase() === "PROCESSED") && (
          <TimelineItem
            icon={Package}
            iconColor={isDark ? "bg-blue-900/50 text-blue-400" : "bg-blue-100 text-blue-600"}
            title="Processed"
            person={data.processed_by_name}
            date={data.date_processed}
            isDark={isDark}
          />
        )}

        {/* Cancelled */}
        {showCancellation && (data.cancelled_by_name || data.date_cancelled || data.processing_status?.toUpperCase() === "CANCELLED") && (
          <TimelineItem
            icon={Ban}
            iconColor={isDark ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"}
            title="Cancelled"
            person={data.cancelled_by_name}
            date={data.date_cancelled}
            isDark={isDark}
          />
        )}
      </div>

      {/* General Remarks (if not shown in approval and exists) */}
      {hasDualApproval && data.remarks && (
        <div className={`mt-4 p-3 rounded ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
          <p className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Remarks</p>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>{data.remarks}</p>
        </div>
      )}
    </div>
  );
}
