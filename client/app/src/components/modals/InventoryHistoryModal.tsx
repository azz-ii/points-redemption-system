import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Layers,
  Minus,
} from "lucide-react";
import { stockAuditApi, type StockAuditLog } from "@/lib/inventory-api";
import { PaginatedTableSkeleton } from "@/components/shared/paginated-table-skeleton";

interface InventoryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

function AdjustmentTypeBadge({ adjustmentType }: { adjustmentType: StockAuditLog["adjustment_type"] }) {
  switch (adjustmentType) {
    case "ADD":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300">
          <ArrowUpRight className="h-3 w-3" />
          Add
        </span>
      );
    case "DECREASE":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-900/40 dark:border-rose-800/50 dark:text-rose-300">
          <ArrowDownRight className="h-3 w-3" />
          Decrease
        </span>
      );
    case "BULK_ADD":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 border border-zinc-200 text-zinc-800 dark:bg-zinc-900/40 dark:border-zinc-800/50 dark:text-zinc-300">
          <Layers className="h-3 w-3" />
          Bulk Add
        </span>
      );
    case "BULK_DECREASE":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800 dark:bg-red-900/60 dark:text-red-200">
          <Layers className="h-3 w-3" />
          Bulk Dec.
        </span>
      );
    case "BULK_RESET":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800 dark:bg-red-900/60 dark:text-red-200">
          <RotateCcw className="h-3 w-3" />
          Reset
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
          {adjustmentType}
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
    <span className="inline-flex items-center gap-0.5 text-muted-foreground">
      <Minus className="h-3.5 w-3.5" />0
    </span>
  );
}

export function InventoryHistoryModal({
  isOpen,
  onClose,
  productId,
  productName,
}: InventoryHistoryModalProps) {
  const [logs, setLogs] = useState<StockAuditLog[]>([]);
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
      const data = await stockAuditApi.getStockHistory(productId, currentPage, pageSize);
      setLogs(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error("Failed to fetch stock history:", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
      setLogs([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, productId, currentPage, pageSize]);

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
      <div className="rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col bg-card">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Stock History</h2>
              <p className="text-sm text-muted-foreground">
                {productName}
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
            className="p-1 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-5" style={{ scrollbarGutter: "stable" }}>
          {isLoading && (
            <div className="px-6 py-4">
              <PaginatedTableSkeleton
                columns={[
                  { span: 3, widthPercent: 70 },
                  { span: 2, widthPercent: 80 },
                  { span: 1, widthPercent: 50 },
                  { span: 2, widthPercent: 60 },
                  { span: 2, widthPercent: 70 },
                  { span: 2, widthPercent: 75 },
                ]}
                rowCount={8}
              />
            </div>
          )}

          {error && (
            <div className="m-6 p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {!isLoading && !error && logs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No stock history found</p>
            </div>
          )}

          {!isLoading && !error && logs.length > 0 && (
            <div className="divide-y divide-border">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-3 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground bg-muted">
                <div className="col-span-3">Date</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-1 text-right">Delta</div>
                <div className="col-span-2 text-center">Stock</div>
                <div className="col-span-2">Reason</div>
                <div className="col-span-2">Changed By</div>
              </div>

              {logs.map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-12 gap-3 px-6 py-3 items-center text-sm transition-colors hover:bg-accent border-border"
                >
                  <div className="col-span-3 text-xs text-muted-foreground">
                    {formatDate(log.created_at)}
                  </div>
                  <div className="col-span-2">
                    <AdjustmentTypeBadge adjustmentType={log.adjustment_type} />
                  </div>
                  <div className="col-span-1 text-right">
                    <DeltaDisplay delta={log.stock_delta} />
                  </div>
                  <div className="col-span-2 text-center text-xs text-muted-foreground">
                    {log.previous_stock.toLocaleString()} → {log.new_stock.toLocaleString()}
                  </div>
                  <div className="col-span-2">
                    {log.reason ? (
                      <span
                        className="text-xs text-muted-foreground truncate block"
                        title={log.reason}
                      >
                        {log.reason}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </div>
                  <div className="col-span-2 text-xs text-foreground truncate">
                    {log.changed_by_username}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border">
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent text-foreground"
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
