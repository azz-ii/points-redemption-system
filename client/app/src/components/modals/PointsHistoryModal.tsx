import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Clock, ArrowUpRight, ArrowDownRight, RotateCcw, Layers, Minus } from "lucide-react";
import { pointsAuditApi, type PointsAuditLog } from "@/lib/points-audit-api";

interface PointsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "USER" | "DISTRIBUTOR" | "CUSTOMER";
  entityId: number;
  entityName: string;
}

function ActionBadge({ actionType }: { actionType: string }) {
  switch (actionType) {
    case "INDIVIDUAL_SET":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300`}>
          <Layers className="h-3 w-3" />
          Individual
        </span>
      );
    case "BULK_DELTA":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300`}>
          <Layers className="h-3 w-3" />
          Bulk Update
        </span>
      );
    case "BULK_RESET":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300`}>
          <RotateCcw className="h-3 w-3" />
          Reset
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground`}>
          {actionType}
        </span>
      );
  }
}

function DeltaDisplay({ delta }: { delta: number }) {
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-green-500 font-semibold">
        <ArrowUpRight className="h-3.5 w-3.5" />
        +{delta.toLocaleString()}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-red-500 font-semibold">
        <ArrowDownRight className="h-3.5 w-3.5" />
        {delta.toLocaleString()}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-0.5 text-muted-foreground`}>
      <Minus className="h-3.5 w-3.5" />
      0
    </span>
  );
}

export function PointsHistoryModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
}: PointsHistoryModalProps) {
  const [logs, setLogs] = useState<PointsAuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 15;
  const totalPages = Math.ceil(totalCount / pageSize);

  const fetchHistory = useCallback(async () => {
    if (!isOpen) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await pointsAuditApi.getHistory(entityType, entityId, currentPage, pageSize);
      setLogs(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error("Failed to fetch points history:", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
      setLogs([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, entityType, entityId, currentPage, pageSize]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col bg-card`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-6 border-b border-border`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30`}
            >
              <Clock
                className={`h-5 w-5 text-blue-600 dark:text-blue-400`}
              />
            </div>
            <div>
              <h2
                className={`text-lg font-semibold text-foreground`}
              >
                Points History
              </h2>
              <p
                className={`text-sm text-muted-foreground`}
              >
                {entityName}
                {totalCount > 0 && (
                  <span className="ml-2">
                    &middot; {totalCount} record{totalCount !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status" />
            </div>
          )}

          {error && (
            <div className={`m-6 p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300`}>
              {error}
            </div>
          )}

          {!isLoading && !error && logs.length === 0 && (
            <div
              className={`text-center py-12 text-muted-foreground`}
            >
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No points history found</p>
            </div>
          )}

          {!isLoading && !error && logs.length > 0 && (
            <div className="divide-y divide-gray-700/50">
              {/* Table header */}
              <div
                className={`grid grid-cols-12 gap-2 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted`}
              >
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Action</div>
                <div className="col-span-2 text-right">Delta</div>
                <div className="col-span-2 text-center">Points</div>
                <div className="col-span-3">Changed By</div>
              </div>

              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`grid grid-cols-12 gap-2 px-6 py-3 items-center text-sm transition-colors hover:bg-accent border-border`}
                >
                  <div
                    className={`col-span-3 text-xs text-muted-foreground`}
                  >
                    {formatDate(log.created_at)}
                  </div>
                  <div className="col-span-2">
                    <ActionBadge actionType={log.action_type} />
                  </div>
                  <div className="col-span-2 text-right">
                    <DeltaDisplay delta={log.points_delta} />
                  </div>
                  <div
                    className={`col-span-2 text-center text-xs text-muted-foreground`}
                  >
                    {log.previous_points.toLocaleString()} → {log.new_points.toLocaleString()}
                  </div>
                  <div className="col-span-3">
                    <div
                      className={`text-xs truncate text-foreground`}
                    >
                      {log.changed_by_username}
                    </div>
                    {log.reason && (
                      <div
                        className={`text-xs truncate mt-0.5 text-muted-foreground`}
                        title={log.reason}
                      >
                        {log.reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div
            className={`flex items-center justify-between px-6 py-3 border-t border-border`}
          >
            <div
              className={`text-xs text-muted-foreground`}
            >
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent text-foreground`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent text-foreground`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
