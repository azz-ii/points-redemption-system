import { Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { MobileCardsSkeleton } from "@/components/shared/mobile-cards-skeleton";
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
    case "Collateral":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    case "Giveaway":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    case "Asset":
      return "bg-yellow-500 text-black";
    case "Benefit":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
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
    return <MobileCardsSkeleton count={6} showHeader={false} />;
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
        <p className="text-muted-foreground">No marketing users found</p>
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
              <p className="text-sm text-muted-foreground">@{user.username || "No Username"}</p>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
              {user.position}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-3">{user.email}</p>

          {/* Assigned Legends */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Assigned Items:</p>
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
              <span className="text-muted-foreground text-sm italic">
                No items assigned
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewAccount(user)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/60"
            >
              <Eye className="h-4 w-4" />
              View
            </button>
            <button
              onClick={() => onEditAccount(user)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-sm font-medium hover:bg-accent"
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
