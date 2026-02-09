import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { X, ChevronLeft, ChevronRight, Clock, ArrowUpRight, ArrowDownRight, RotateCcw, Layers, Minus } from "lucide-react";
import { pointsAuditApi, type PointsAuditLog } from "@/lib/points-audit-api";

interface PointsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "USER" | "DISTRIBUTOR" | "CUSTOMER";
  entityId: number;
  entityName: string;
}

function ActionBadge({ actionType, theme }: { actionType: string; theme: string | undefined }) {
  const isDark = theme === "dark";

  switch (actionType) {
    case "INDIVIDUAL_SET":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700"
        }`}>
          <Layers className="h-3 w-3" />
          Individual
        </span>
      );
    case "BULK_DELTA":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isDark ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-700"
        }`}>
          <Layers className="h-3 w-3" />
          Bulk Update
        </span>
      );
    case "BULK_RESET":
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isDark ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-700"
        }`}>
          <RotateCcw className="h-3 w-3" />
          Reset
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
        }`}>
          {actionType}
        </span>
      );
  }
}

function DeltaDisplay({ delta, theme }: { delta: number; theme: string | undefined }) {
  const isDark = theme === "dark";

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
    <span className={`inline-flex items-center gap-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
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
  const { resolvedTheme } = useTheme();
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
        className={`rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col ${
          resolvedTheme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-6 border-b ${
            resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                resolvedTheme === "dark" ? "bg-blue-900/30" : "bg-blue-50"
              }`}
            >
              <Clock
                className={`h-5 w-5 ${
                  resolvedTheme === "dark" ? "text-blue-400" : "text-blue-600"
                }`}
              />
            </div>
            <div>
              <h2
                className={`text-lg font-semibold ${
                  resolvedTheme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Points History
              </h2>
              <p
                className={`text-sm ${
                  resolvedTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
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
            className={`p-1 rounded-md transition-colors ${
              resolvedTheme === "dark"
                ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
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
            <div className={`m-6 p-4 rounded-lg ${
              resolvedTheme === "dark" ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-700"
            }`}>
              {error}
            </div>
          )}

          {!isLoading && !error && logs.length === 0 && (
            <div
              className={`text-center py-12 ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No points history found</p>
            </div>
          )}

          {!isLoading && !error && logs.length > 0 && (
            <div className="divide-y divide-gray-700/50">
              {/* Table header */}
              <div
                className={`grid grid-cols-12 gap-3 px-6 py-3 text-xs font-medium uppercase tracking-wider ${
                  resolvedTheme === "dark"
                    ? "text-gray-400 bg-gray-800/80"
                    : "text-gray-500 bg-gray-50"
                }`}
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
                  className={`grid grid-cols-12 gap-3 px-6 py-3 items-center text-sm transition-colors ${
                    resolvedTheme === "dark"
                      ? "hover:bg-gray-700/30 border-gray-700/50"
                      : "hover:bg-gray-50 border-gray-100"
                  }`}
                >
                  <div
                    className={`col-span-3 text-xs ${
                      resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatDate(log.created_at)}
                  </div>
                  <div className="col-span-2">
                    <ActionBadge actionType={log.action_type} theme={resolvedTheme} />
                  </div>
                  <div className="col-span-2 text-right">
                    <DeltaDisplay delta={log.points_delta} theme={resolvedTheme} />
                  </div>
                  <div
                    className={`col-span-2 text-center text-xs ${
                      resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {log.previous_points.toLocaleString()} → {log.new_points.toLocaleString()}
                  </div>
                  <div className="col-span-3">
                    <div
                      className={`text-xs truncate ${
                        resolvedTheme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {log.changed_by_username}
                    </div>
                    {log.reason && (
                      <div
                        className={`text-xs truncate mt-0.5 ${
                          resolvedTheme === "dark" ? "text-gray-500" : "text-gray-400"
                        }`}
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
            className={`flex items-center justify-between px-6 py-3 border-t ${
              resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div
              className={`text-xs ${
                resolvedTheme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  resolvedTheme === "dark"
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
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
