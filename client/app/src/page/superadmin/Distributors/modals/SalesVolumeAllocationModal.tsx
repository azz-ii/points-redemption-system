import { useState, useEffect, useCallback } from "react";
import { X, TrendingUp, ChevronLeft, ChevronRight, Search, Info } from "lucide-react";
import type { Distributor } from "./types";
import { distributorsApi, type SalesVolumeTier } from "@/lib/distributors-api";
import { PaginatedTableSkeleton } from "@/components/shared/paginated-table-skeleton";

interface PaginatedDistributorsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Distributor[];
}

interface SalesVolumeAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFetchPage: (page: number, pageSize: number, searchQuery: string) => Promise<PaginatedDistributorsResponse>;
  loading: boolean;
  onSubmit: (allocations: { id: number; sales_volume: number }[], reason: string) => void;
}

function getRateForVolume(volume: number, tiers: SalesVolumeTier[]): number | null {
  for (const tier of tiers) {
    if (volume >= tier.lower && volume <= tier.upper) {
      return tier.rate;
    }
  }
  return null;
}

export function SalesVolumeAllocationModal({
  isOpen,
  onClose,
  onFetchPage,
  loading,
  onSubmit,
}: SalesVolumeAllocationModalProps) {
  const [salesVolumes, setSalesVolumes] = useState<Record<number, string>>({});
  const [reason, setReason] = useState("");
  const [tiers, setTiers] = useState<SalesVolumeTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(false);

  // Data state
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Fetch tiers on mount
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const fetchTiers = async () => {
      setTiersLoading(true);
      try {
        const data = await distributorsApi.getSalesVolumeTiers();
        if (!cancelled) setTiers(data);
      } catch (err) {
        console.error("Failed to fetch sales volume tiers:", err);
      } finally {
        if (!cancelled) setTiersLoading(false);
      }
    };
    fetchTiers();
    return () => { cancelled = true; };
  }, [isOpen]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch page data
  const fetchPageData = useCallback(async () => {
    if (!isOpen) return;
    try {
      setIsLoadingPage(true);
      const data = await onFetchPage(currentPage, itemsPerPage, debouncedSearchQuery);
      setDistributors(data.results);
      setTotalCount(data.count);
    } catch (error) {
      console.error("Failed to fetch distributors:", error);
      setDistributors([]);
      setTotalCount(0);
    } finally {
      setIsLoadingPage(false);
    }
  }, [isOpen, currentPage, itemsPerPage, debouncedSearchQuery, onFetchPage]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setSalesVolumes({});
      setReason("");
    }
  }, [isOpen]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleVolumeChange = (distributorId: number, value: string) => {
    setSalesVolumes((prev) => ({ ...prev, [distributorId]: value }));
  };

  const handleSubmit = () => {
    const allocations: { id: number; sales_volume: number }[] = [];

    Object.entries(salesVolumes).forEach(([idStr, valueStr]) => {
      const volume = parseInt(valueStr, 10);
      if (!isNaN(volume) && volume >= 1) {
        allocations.push({ id: parseInt(idStr, 10), sales_volume: volume });
      }
    });

    if (allocations.length === 0) {
      alert("Please enter a sales volume for at least one distributor.");
      return;
    }

    // Validate all volumes are within range
    for (const alloc of allocations) {
      const rate = getRateForVolume(alloc.sales_volume, tiers);
      if (rate === null) {
        alert(`Sales volume ${alloc.sales_volume.toLocaleString()} is out of the valid range (1–500,000).`);
        return;
      }
    }

    onSubmit(allocations, reason);
  };

  // Calculate summary
  const activeSummary = Object.entries(salesVolumes).reduce(
    (acc, [, valueStr]) => {
      const volume = parseInt(valueStr, 10);
      if (!isNaN(volume) && volume >= 1) {
        const rate = getRateForVolume(volume, tiers);
        if (rate !== null) {
          acc.count++;
          acc.totalPoints += Math.floor(volume * rate);
        }
      }
      return acc;
    },
    { count: 0, totalPoints: 0 }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col bg-card">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Allocate Points by Sales Volume
              </h2>
              <p className="text-sm mt-1 text-muted-foreground">
                {totalCount} distributor{totalCount !== 1 ? "s" : ""} · Monthly allocation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Rate Table Reference */}
          <div className="mb-6 p-4 rounded-lg border border-border bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Points Rate Table</h3>
            </div>
            {tiersLoading ? (
              <p className="text-sm text-muted-foreground">Loading tiers...</p>
            ) : (
              <div className="grid grid-cols-6 gap-2 text-xs">
                {tiers.map((tier) => (
                  <div key={tier.level} className="p-2 rounded bg-background border border-border text-center">
                    <div className="font-medium text-foreground">
                      {tier.lower.toLocaleString()}–{tier.upper.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground mt-0.5">×{tier.rate}</div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Points = Sales Volume × Rate. Example: 5,000 vol × 0.25 rate = 1,250 points added.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, brand, or sales channel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-muted border-border text-foreground placeholder-muted-foreground"
                disabled={loading || isLoadingPage}
              />
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoadingPage && (
            <PaginatedTableSkeleton
              columns={[
                { span: 3, widthPercent: 70 },
                { span: 2, widthPercent: 80 },
                { span: 2, widthPercent: 60 },
                { span: 2, widthPercent: 50 },
                { span: 1, widthPercent: 60 },
                { span: 2, widthPercent: 50 },
              ]}
              rowCount={10}
            />
          )}

          <div className="space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 font-semibold text-sm pb-2 border-b text-foreground border-border">
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Current Points</div>
              <div className="col-span-2">Sales Volume</div>
              <div className="col-span-1">Rate</div>
              <div className="col-span-2">Points to Add</div>
              <div className="col-span-2">New Total</div>
            </div>

            {/* Distributor Rows */}
            {!isLoadingPage && distributors.map((distributor) => {
              const rawValue = salesVolumes[distributor.id] ?? "";
              const volume = parseInt(rawValue, 10);
              const hasVolume = !isNaN(volume) && volume >= 1;
              const rate = hasVolume ? getRateForVolume(volume, tiers) : null;
              const pointsToAdd = rate !== null ? Math.floor(volume * rate) : 0;
              const currentPoints = distributor.points || 0;
              const newTotal = currentPoints + pointsToAdd;
              const outOfRange = hasVolume && rate === null;

              return (
                <div
                  key={distributor.id}
                  className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border hover:bg-accent"
                >
                  <div className="col-span-3 text-sm font-medium text-foreground truncate" title={distributor.name}>
                    {distributor.name}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {currentPoints.toLocaleString()}
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={rawValue}
                      onChange={(e) => handleVolumeChange(distributor.id, e.target.value)}
                      placeholder="0"
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-muted border-border text-foreground placeholder-muted-foreground ${
                        outOfRange ? "border-red-500 focus:ring-red-500" : ""
                      }`}
                      disabled={loading}
                    />
                    {outOfRange && (
                      <p className="text-xs text-red-500 mt-0.5">Out of range</p>
                    )}
                  </div>
                  <div className="col-span-1 text-sm text-muted-foreground">
                    {rate !== null ? `×${rate}` : "—"}
                  </div>
                  <div className="col-span-2 text-sm">
                    <span className={pointsToAdd > 0 ? "text-green-500 font-semibold" : "text-muted-foreground"}>
                      {pointsToAdd > 0 ? `+${pointsToAdd.toLocaleString()}` : "—"}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm">
                    <span className={pointsToAdd > 0 ? "text-foreground font-semibold" : "text-muted-foreground"}>
                      {pointsToAdd > 0 ? newTotal.toLocaleString() : currentPoints.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {!isLoadingPage && distributors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No distributors match your search" : "No distributors found"}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalCount > itemsPerPage && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount} distributors
              {searchQuery && ` (search: "${searchQuery}")`}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading || isLoadingPage}
                className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm px-3 text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading || isLoadingPage}
                className="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent text-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Summary + Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-border">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Reason / Note (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-64 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-muted border-border text-foreground placeholder-muted-foreground"
              disabled={loading}
            />
            {activeSummary.count > 0 && (
              <span className="text-sm text-muted-foreground">
                {activeSummary.count} distributor{activeSummary.count !== 1 ? "s" : ""} ·{" "}
                <span className="text-green-500 font-semibold">
                  +{activeSummary.totalPoints.toLocaleString()} pts
                </span>{" "}
                total
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg transition-colors text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || activeSummary.count === 0}
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700"
            >
              <TrendingUp className="h-4 w-4" />
              {loading ? "Allocating..." : "Allocate Points"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
