import type { PaginationProps } from "../types";

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className={`px-3 py-2 rounded-lg ${
          currentPage === 1
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-muted text-foreground hover:bg-accent"
        }`}
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-lg ${
            page === currentPage
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-accent"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className={`px-3 py-2 rounded-lg ${
          currentPage === totalPages
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-muted text-foreground hover:bg-accent"
        }`}
      >
        Next
      </button>
    </div>
  );
}
