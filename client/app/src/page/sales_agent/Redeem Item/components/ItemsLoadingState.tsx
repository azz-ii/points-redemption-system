function SkeletonCard() {
  return (
    <div
      className="rounded-lg overflow-hidden border bg-card border-border flex flex-col"
    >
      {/* Image skeleton */}
      <div className="h-36 md:h-44 bg-gray-300 dark:bg-gray-700 animate-pulse flex-shrink-0" />
      {/* Content skeleton — fixed at bottom */}
      <div className="flex-shrink-0 p-2">
        <div className="flex justify-between items-end">
          <div className="flex-1 space-y-1">
            {/* Title skeleton */}
            <div
              className="h-3 md:h-4 rounded animate-pulse bg-muted"
              style={{ width: "70%" }}
            />
            {/* Points skeleton */}
            <div
              className="h-3 rounded animate-pulse bg-muted"
              style={{ width: "40%" }}
            />
            {/* Category skeleton */}
            <div
              className="h-3 rounded animate-pulse bg-muted"
              style={{ width: "50%" }}
            />
          </div>
          {/* Button skeleton */}
          <div
            className="w-7 h-7 md:w-8 md:h-8 rounded-full flex-shrink-0 animate-pulse bg-muted"
          />
        </div>
      </div>
    </div>
  );
}

export function ItemsLoadingState() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: 12 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
