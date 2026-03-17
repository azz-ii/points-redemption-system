import { useState, useCallback, useEffect } from "react";
import { X, FileText, FileSpreadsheet, ArrowUp, ArrowDown, Download, Loader2 } from "lucide-react";
import type { MarketingUser, LegendAssignment } from "../components/types";
import {
  exportMarketingUsers,
  DEFAULT_EXPORT_COLUMNS,
  type ExportColumn,
  type SortField,
  type SortDirection,
} from "../utils/exportUtils";
import { usersApi } from "@/lib/users-api";
import { API_URL } from "@/lib/config";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery?: string;
}

export function ExportModal({ isOpen, onClose, searchQuery }: ExportModalProps) {
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [allUsers, setAllUsers] = useState<MarketingUser[]>([]);
  const [fetchedCount, setFetchedCount] = useState(0);
  const [format, setFormat] = useState<"pdf" | "excel">("excel");
  const [columns, setColumns] = useState<ExportColumn[]>(DEFAULT_EXPORT_COLUMNS);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  // Fetch all filtered users when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchAllUsers = async () => {
      setFetchingUsers(true);
      setError("");
      try {
        // Fetch all Handler/Admin users with filters
        const users = await usersApi.getAllAccounts({
          search: searchQuery,
          position: 'Handler,Admin',
        });

        // Fetch legend assignments
        const assignmentsResponse = await fetch(
          `${API_URL}/catalogue/bulk-assign-marketing/`,
          { credentials: 'include' }
        );

        let assignmentsByUser: Record<number, LegendAssignment[]> = {};
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          if (assignmentsData.products) {
            for (const product of assignmentsData.products) {
              if (product.mktg_admin_id) {
                if (!assignmentsByUser[product.mktg_admin_id]) {
                  assignmentsByUser[product.mktg_admin_id] = [];
                }
                // Group by legend
                const existing = assignmentsByUser[product.mktg_admin_id].find(
                  (a) => a.legend === product.legend
                );
                if (existing) {
                  existing.item_count += 1;
                } else {
                  assignmentsByUser[product.mktg_admin_id].push({
                    legend: product.legend,
                    item_count: 1,
                  });
                }
              }
            }
          }
        }

        // Merge users with their assignments
        const usersWithAssignments: MarketingUser[] = users.map((user: any) => ({
          ...user,
          assigned_legends: assignmentsByUser[user.id] || [],
        }));

        setAllUsers(usersWithAssignments);
        setFetchedCount(usersWithAssignments.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchAllUsers();
  }, [isOpen, searchQuery]);

  const handleColumnToggle = useCallback((key: ExportColumn["key"]) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, enabled: !col.enabled } : col
      )
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setColumns((prev) => prev.map((col) => ({ ...col, enabled: true })));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setColumns((prev) => prev.map((col) => ({ ...col, enabled: false })));
  }, []);

  const handleExport = useCallback(() => {
    const enabledColumns = columns.filter((col) => col.enabled);
    if (enabledColumns.length === 0) {
      setError("Please select at least one column to export");
      return;
    }

    if (allUsers.length === 0) {
      setError("No marketing users to export");
      return;
    }

    setExporting(true);
    setError("");

    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `marketing_users_export_${timestamp}`;
      
      exportMarketingUsers(allUsers, {
        columns,
        sortField,
        sortDirection,
        format,
        filename,
      });

      // Close modal after successful export
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [allUsers, columns, sortField, sortDirection, format, onClose]);

  const handleClose = useCallback(() => {
    setError("");
    setAllUsers([]);
    setFetchedCount(0);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const enabledCount = columns.filter((col) => col.enabled).length;

  // User status summary
  const activeUsers = allUsers.filter((u) => !u.is_banned && u.is_activated).length;
  const inactiveUsers = allUsers.filter((u) => !u.is_banned && !u.is_activated).length;
  const bannedUsers = allUsers.filter((u) => u.is_banned).length;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="bg-card rounded-lg shadow-2xl max-w-lg w-full border divide-y border-border divide-gray-700 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div>
            <h2 id="export-modal-title" className="text-xl font-semibold">
              Export Marketing Users
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {fetchingUsers ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Fetching users... {fetchedCount} found
                </span>
              ) : (
                <>{fetchedCount} user{fetchedCount !== 1 ? "s" : ""} will be exported</>
              )}
            </p>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="text-green-500">{activeUsers} Active</span>
              <span className="text-yellow-500">{inactiveUsers} Inactive</span>
              <span className="text-red-500">{bannedUsers} Banned</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto min-h-0">
          {/* Format Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Export Format
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  format === "excel"
                    ? "border-green-500 bg-green-500/10"
                    : "border-border hover:border-border"
                }`}
              >
                <FileSpreadsheet
                  className={`h-6 w-6 ${
                    format === "excel"
                      ? "text-green-500"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left">
                  <div className="font-medium">Excel</div>
                  <div className="text-xs text-muted-foreground">.xlsx</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  format === "pdf"
                    ? "border-red-500 bg-red-500/10"
                    : "border-border hover:border-border"
                }`}
              >
                <FileText
                  className={`h-6 w-6 ${
                    format === "pdf"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left">
                  <div className="font-medium">PDF</div>
                  <div className="text-xs text-muted-foreground">.pdf</div>
                </div>
              </button>
            </div>
          </div>

          {/* Column Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Columns to Export
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Select All
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {columns.map((col) => (
                <label
                  key={String(col.key)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    col.enabled
                      ? "bg-card"
                      : "bg-card"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={col.enabled}
                    onChange={() => handleColumnToggle(col.key)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  />
                  <span
                    className={`text-sm ${
                      col.enabled
                        ? ""
                        : "text-muted-foreground"
                    }`}
                  >
                    {col.label}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {enabledCount} of {columns.length} columns selected
            </p>
          </div>

          {/* Sort Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Sort Options
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="sortField"
                  className="text-xs text-muted-foreground mb-2 block"
                >
                  Sort By
                </label>
                <select
                  id="sortField"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full px-4 py-3 rounded border bg-card border-border text-foreground focus:outline-none focus:border-ring"
                >
                  {columns.map((col) => (
                    <option key={String(col.key)} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  Direction
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSortDirection("asc")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded border transition-colors ${
                      sortDirection === "asc"
                        ? "bg-primary border-blue-600 text-foreground"
                        : "bg-card border-border text-foreground hover:border-accent"
                    }`}
                  >
                    <ArrowUp className="h-4 w-4" />
                    Asc
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortDirection("desc")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded border transition-colors ${
                      sortDirection === "desc"
                        ? "bg-primary border-blue-600 text-foreground"
                        : "bg-card border-border text-foreground hover:border-accent"
                    }`}
                  >
                    <ArrowDown className="h-4 w-4" />
                    Desc
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6">
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors bg-card hover:bg-accent text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || enabledCount === 0 || fetchingUsers}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors bg-card hover:bg-accent text-foreground disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {fetchingUsers
                ? "Loading..."
                : exporting
                ? "Exporting..."
                : `Export ${format.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
