import { useState, useEffect, useCallback } from "react";
import { X, Save, AlertTriangle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Distributor } from "./types";
import { SetPointsConfirmationModal } from "./SetPointsConfirmationModal";
import type { ChunkedUpdateProgress } from "@/lib/distributors-api";

interface PaginatedDistributorsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Distributor[];
}

interface SetPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFetchPage: (page: number, pageSize: number, searchQuery: string) => Promise<PaginatedDistributorsResponse>;
  loading: boolean;
  onSubmit: (updates: { id: number; points: number }[], reason: string) => void;
  onBulkSubmit?: (pointsDelta: number, password: string) => void;
  onResetAll?: (password: string) => void;
  progress?: ChunkedUpdateProgress | null;
}

export function SetPointsModal({
  isOpen,
  onClose,
  onFetchPage,
  loading,
  onSubmit,
  onBulkSubmit,
  onResetAll,
  progress,
}: SetPointsModalProps) {
  const [pointsToAdd, setPointsToAdd] = useState<Record<number, number>>({});
  const [reason, setReason] = useState("");

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

  // Advanced section state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bulkPointsDelta, setBulkPointsDelta] = useState<number>(0);
  const [confirmBulkUpdate, setConfirmBulkUpdate] = useState(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationType, setConfirmationType] = useState<"bulk" | "reset">("bulk");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch page data when page or search changes
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
      // Reset confirmation modal
      setShowConfirmModal(false);
      setConfirmPassword("");
      // Reset advanced section
      setShowAdvanced(false);
      setBulkPointsDelta(0);
      setConfirmBulkUpdate(false);
      // Reset pagination and search
      setCurrentPage(1);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setReason("");
    }
  }, [isOpen]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handlePointsChange = (distributorId: number, value: string) => {
    // Allow empty string, minus sign, or valid numbers
    if (value === "" || value === "-") {
      setPointsToAdd((prev) => ({ ...prev, [distributorId]: 0 }));
    } else {
      const delta = parseInt(value, 10);
      if (!isNaN(delta)) {
        setPointsToAdd((prev) => ({ ...prev, [distributorId]: delta }));
      }
    }
  };

  const handleSubmit = () => {
    // Only submit updates for items with non-zero deltas
    const updates: { id: number; points: number }[] = [];
    
    // Get all distributor IDs that have point changes
    Object.entries(pointsToAdd).forEach(([idStr, delta]) => {
      if (delta !== 0) {
        const id = parseInt(idStr, 10);
        // Find the distributor to get current points
        const distributor = distributors.find(d => d.id === id);
        if (distributor) {
          const newPoints = (distributor.points || 0) + delta;
          updates.push({ id, points: newPoints });
        }
      }
    });
    
    if (updates.length === 0) {
      alert("No changes to save. Please add or subtract points for at least one distributor.");
      return;
    }
    
    onSubmit(updates, reason);
  };

  const handleBulkSubmit = () => {
    if (!onBulkSubmit) return;
    if (!confirmBulkUpdate) {
      alert("Please confirm that you understand this will affect all distributors.");
      return;
    }
    if (bulkPointsDelta === 0) {
      alert("Points delta cannot be 0.");
      return;
    }
    // Open confirmation modal
    setConfirmationType("bulk");
    setShowConfirmModal(true);
  };

  const handleResetAll = () => {
    if (!onResetAll) return;
    // Open confirmation modal
    setConfirmationType("reset");
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (confirmationType === "bulk") {
      onBulkSubmit?.(bulkPointsDelta, confirmPassword);
    } else {
      onResetAll?.(confirmPassword);
    }
    setShowConfirmModal(false);
    setConfirmPassword("");
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div
          className="rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col bg-card"
        >
          {/* Header */}
          <div
            className="flex justify-between items-center p-6 border-b border-border"
          >
            <div>
              <h2
                className="text-2xl font-semibold text-foreground"
              >
                Set Points
              </h2>
              <p
                className="text-sm mt-1 text-muted-foreground"
              >
                {totalCount} distributor{totalCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !!progress}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <p
              className="text-sm mb-4 text-muted-foreground"
            >
              Add or subtract points for distributors. Enter positive numbers to add points, negative numbers to deduct. Changes will be applied when you click Save.
            </p>

            {/* Progress Indicator */}
            {progress && (
              <div
                className="mb-4 p-4 rounded-lg border bg-blue-900/20 border-blue-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-sm font-medium text-blue-300"
                  >
                    Processing chunk {progress.currentChunk} of {progress.totalChunks}
                  </span>
                  <span
                    className="text-sm text-blue-400"
                  >
                    {progress.successCount} / {progress.totalRecords} processed
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-2 bg-muted"
                >
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(progress.currentChunk / progress.totalChunks) * 100}%`,
                    }}
                  />
                </div>
                {progress.failedCount > 0 && (
                  <p
                    className="text-xs mt-2 text-orange-400"
                  >
                    {progress.failedCount} failed so far
                  </p>
                )}
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search by name, location, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-muted border-gray-600 text-foreground placeholder-gray-500"
                  disabled={loading || isLoadingPage}
                />
              </div>
            </div>

            {/* Loading Indicator */}
            {isLoadingPage && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {/* Header Row */}
              <div
                className="grid grid-cols-12 gap-4 font-semibold text-sm pb-2 border-b text-foreground border-border"
              >
                <div className="col-span-4">Name</div>
                <div className="col-span-3">Location</div>
                <div className="col-span-2">Current</div>
                <div className="col-span-2">Add/Subtract</div>
                <div className="col-span-1">New Total</div>
              </div>

              {/* Distributor Rows */}
              {!isLoadingPage && distributors.map((distributor) => {
                const delta = pointsToAdd[distributor.id] || 0;
                const currentPoints = distributor.points || 0;
                const newTotal = currentPoints + delta; // Allow negative values
                
                return (
                  <div
                    key={distributor.id}
                    className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border hover:bg-gray-700/50"
                  >
                    <div
                      className="col-span-4 text-sm font-medium text-foreground"
                    >
                      {distributor.name}
                    </div>
                    <div
                      className="col-span-3 text-sm text-muted-foreground"
                    >
                      {distributor.location}
                    </div>
                    <div
                      className="col-span-2 text-sm text-muted-foreground"
                    >
                      {currentPoints.toLocaleString()}
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={delta === 0 ? "" : delta}
                        onChange={(e) =>
                          handlePointsChange(distributor.id, e.target.value)
                        }
                        placeholder="0"
                        className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-muted border-gray-600 text-foreground placeholder-gray-500"
                        disabled={loading}
                      />
                    </div>
                    <div
                      className={`col-span-1 text-sm font-semibold ${
                        delta > 0
                          ? "text-green-500"
                          : delta < 0
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {newTotal.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {!isLoadingPage && distributors.length === 0 && (
              <div
                className="text-center py-8 text-muted-foreground"
              >
                {searchQuery
                  ? "No distributors match your search"
                  : "No distributors found"}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalCount > itemsPerPage && (
            <div
              className="flex items-center justify-between px-6 py-4 border-t border-border"
            >
              <div
                className="text-sm text-muted-foreground"
              >
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
                <span
                  className="text-sm px-3 text-foreground"
                >
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

          {/* Advanced Section */}
          {onBulkSubmit && (
            <div
              className="mt-6 border rounded-lg border-border"
            >
              {/* Advanced Section Header */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-4 transition-colors hover:bg-gray-700/50"
                disabled={loading}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className="h-5 w-5 text-orange-400"
                  />
                  <span
                    className="font-semibold text-foreground"
                  >
                    Advanced Options
                  </span>
                </div>
                {showAdvanced ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {/* Advanced Section Content */}
              {showAdvanced && (
                <div
                  className="p-4 border-t border-border bg-gray-700/30"
                >
                  {/* Warning Alert */}
                  <div
                    className="mb-4 p-3 rounded-lg border-l-4 bg-orange-900/20 border-orange-500"
                  >
                    <p
                      className="text-sm font-medium text-orange-300"
                    >
                      ⚠️ Warning: Bulk Update
                    </p>
                    <p
                      className="text-sm mt-1 text-orange-200"
                    >
                      This will apply the same points adjustment to all{" "}
                    {totalCount} distributor(s). This action cannot
                      be undone.
                    </p>
                  </div>

                  {/* Bulk Points Delta Input */}
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-2 text-foreground"
                    >
                      Points to Add/Subtract
                    </label>
                    <input
                      type="number"
                      value={bulkPointsDelta === 0 ? "" : bulkPointsDelta}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || value === "-") {
                          setBulkPointsDelta(0);
                        } else {
                          const num = parseInt(value, 10);
                          if (!isNaN(num)) {
                            setBulkPointsDelta(num);
                          }
                        }
                      }}
                      placeholder="Enter positive or negative number"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-muted border-gray-600 text-foreground placeholder-gray-500"
                      disabled={loading}
                    />
                    <p
                      className="text-xs mt-1 text-muted-foreground"
                    >
                      Positive numbers add points, negative numbers subtract
                    </p>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="mb-4">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmBulkUpdate}
                        onChange={(e) => setConfirmBulkUpdate(e.target.checked)}
                        className="mt-1"
                        disabled={loading}
                      />
                      <span
                        className="text-sm text-foreground"
                      >
                      I understand this will affect all {totalCount}{" "}
                        distributor(s) and cannot be undone
                      </span>
                    </label>
                  </div>

                  {/* Bulk Submit Button */}
                  <button
                    onClick={handleBulkSubmit}
                    disabled={
                      loading ||
                      !confirmBulkUpdate ||
                      bulkPointsDelta === 0
                    }
                    className="w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-orange-600 text-foreground hover:bg-orange-700"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {loading ? "Applying..." : `Apply ${bulkPointsDelta > 0 ? "+" : ""}${bulkPointsDelta} Points to All Distributors`}
                  </button>

                  {/* Reset All Button */}
                  {onResetAll && (
                    <>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="px-2 bg-gray-700/30 text-muted-foreground">
                            Or
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleResetAll}
                        disabled={loading}
                        className="w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-destructive text-foreground hover:bg-destructive/90"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {loading ? "Resetting..." : `Reset All ${totalCount} Distributors to 0 Points`}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            className="flex justify-end gap-2 p-6 border-t border-border"
          >
            <div className="flex-1">
              <input
                type="text"
                placeholder="Reason / Note (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-muted border-gray-600 text-foreground placeholder-gray-500"
                disabled={loading || !!progress}
              />
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg transition-colors text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !!progress}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !!progress}
              className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-card text-foreground hover:bg-accent"
            >
              <Save className="h-4 w-4" />
              {loading ? (progress ? "Processing..." : "Saving...") : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <SetPointsConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmPassword("");
        }}
        onConfirm={handleConfirmAction}
        confirmationType={confirmationType}
        bulkPointsDelta={bulkPointsDelta}
        distributorsCount={totalCount}
        loading={loading}
        password={confirmPassword}
        onPasswordChange={setConfirmPassword}
      />
    </>
  );
}
