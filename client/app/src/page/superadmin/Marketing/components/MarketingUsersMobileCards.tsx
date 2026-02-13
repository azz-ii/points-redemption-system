import { Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import type { MarketingUser } from "./types";

interface MarketingUsersMobileCardsProps {
  paginatedUsers: MarketingUser[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewAccount: (user: MarketingUser) => void;
  onEditAccount: (user: MarketingUser) => void;
}

const getLegendColor = (legend: string) => {
  switch (legend) {
    case "COLLATERAL":
      return "bg-red-500 text-white";
    case "GIVEAWAY":
      return "bg-blue-500 text-white";
    case "ASSET":
      return "bg-yellow-500 text-black";
    case "BENEFIT":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export function MarketingUsersMobileCards({
  paginatedUsers,
  loading,
  error,
  onRetry,
  currentPage,
  totalPages,
  onPageChange,
  onViewAccount,
  onEditAccount,
}: MarketingUsersMobileCardsProps) {
  if (loading && paginatedUsers.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg animate-pulse bg-card"
          >
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (paginatedUsers.length === 0) {
    return (
      <div
        className="text-center py-8 rounded-lg bg-card"
      >
        <p className="text-gray-500">No marketing users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paginatedUsers.map((user) => (
        <div
          key={user.id}
          className="p-4 rounded-lg border bg-card border-border"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold">{user.full_name}</h3>
              <p className="text-sm text-gray-500">@{user.username || "No Username"}</p>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-black">
              {user.position}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-3">{user.email}</p>

          {/* Assigned Legends */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Assigned Items:</p>
            {user.assigned_legends.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {user.assigned_legends.map((assignment) => (
                  <span
                    key={assignment.legend}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLegendColor(
                      assignment.legend
                    )}`}
                  >
                    {assignment.legend} ({assignment.item_count})
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 text-sm italic">
                No items assigned
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewAccount(user)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
            >
              <Eye className="h-4 w-4" />
              View
            </button>
            <button
              onClick={() => onEditAccount(user)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-gray-500 text-white text-sm font-medium hover:bg-gray-600"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium disabled:opacity-50 bg-card text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded text-sm font-medium disabled:opacity-50 bg-card text-foreground"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
