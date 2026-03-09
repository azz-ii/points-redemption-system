import type { PaginationProps } from "../types";

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Compute a sliding window of up to 5 page numbers centred on currentPage
  const windowSize = Math.min(5, totalPages);
  const windowStart = Math.min(
    Math.max(1, currentPage - 2),
    Math.max(1, totalPages - windowSize + 1)
  );
  const pageWindow = Array.from({ length: windowSize }, (_, i) => windowStart + i);

  const navBtn = (disabled: boolean, onClick: () => void, label: string) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${
        disabled
          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          : "bg-muted text-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-1 md:gap-1.5 py-3">
      {navBtn(currentPage <= 1, () => onPageChange(Math.max(1, currentPage - 5)), "«")}
      {navBtn(currentPage === 1, () => onPageChange(currentPage - 1), "‹")}

      {pageWindow.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-7 h-7 md:w-9 md:h-9 rounded-lg text-xs md:text-sm font-medium flex items-center justify-center transition-colors ${
            page === currentPage
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-accent"
          }`}
        >
          {page}
        </button>
      ))}

      {navBtn(currentPage === totalPages, () => onPageChange(currentPage + 1), "›")}
      {navBtn(currentPage >= totalPages, () => onPageChange(Math.min(totalPages, currentPage + 5)), "»")}
    </div>
  );
}
